window.duanduanGameChaoJiYongShi.classes.GameRound = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes, data: appData } = app

    const {
        randomPositiveIntegerLessThan,
        createDOMWithClassNames,
    } = utils

    return function GameRound(game, gameRoundNumber) {
        const { Game } = classes

        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameRound 构造函数。')
        }

        if (!(game instanceof Game)) {
            throw new TypeError('创建【游戏局】时，必须指明其应隶属于哪个【游戏】。')
        }

        if (game.status.isOver) {
            throw new Error('【游戏】已经结束。不能为已经结束的【游戏】创建【游戏局】。')
        }

        this.game = game
        this.gameRoundsRunner = game.subComponents.parts.gameRoundsRunner

        this.subComponents = {}

        this.data = {
            gameRoundNumber,

            fighters: {
                both: null,
                winner: null,
                loser: null,
                winnerRoleConfig: null,
                loserRoleConfig: null,
                winnerArrayIndex: NaN,
                loserArrayIndex: NaN,
            },
        }

        this.status = {
            isRunning: false,
            isOver: false,

            judgementInterval: 200, // milliseconds
            judgementIntervalId: NaN,
        }

        this.start        = start       .bind(this)
        this.end          = end         .bind(this)
        this.showUp       = showUp      .bind(this)
        this.leaveAndHide = leaveAndHide.bind(this)


        _init.call(this)

        console.log('【游戏局】创建完毕。')
    }



    function _init() {
        _createFighters             .call(this)
        _createFightingStageRandomly.call(this)
        _createGameRoundStatusBlock .call(this)
        _createMoreDOMs             .call(this)
        this.el.root.style.display = 'none'
    }

    function _createFighters() {
        const { GameRole } = classes
        const {
            player1: player1KeyboardShortcuts,
            player2: player2KeyboardShortcuts,
        } = appData.keyboardShortcuts.gameRunning

        const { game } = this
        const { fighters } = this.data

        const [
            palyer1PickedFighterRoleConfig,
            palyer2PickedFighterRoleConfig,
        ] = game.data.pickedFighterRoleConfigurations.both

        fighters.both = [
            new GameRole(game, 1, palyer1PickedFighterRoleConfig, {
                keyForMovingLeftwards:  player1KeyboardShortcuts.moveLeftwards,
                keyForMovingRightwards: player1KeyboardShortcuts.moveRightwards,
                keyForAttack:           player1KeyboardShortcuts.attack,
                keyForDefence:          player1KeyboardShortcuts.defence,
            }),

            new GameRole(game, 2, palyer2PickedFighterRoleConfig, {
                keyForMovingLeftwards:  player2KeyboardShortcuts.moveLeftwards,
                keyForMovingRightwards: player2KeyboardShortcuts.moveRightwards,
                keyForAttack:           player2KeyboardShortcuts.attack,
                keyForDefence:          player2KeyboardShortcuts.defence,
            }),
        ]

        fighters.both.forEach(fighter => fighter.joinGameRound(this))
    }

    function _createFightingStageRandomly() {
        const stageConfigs = this.game.data.allGameFightingStageConfigurations
        const chosenStageConfig = stageConfigs[randomPositiveIntegerLessThan(stageConfigs.length)]
        _createFightingStage.call(this, chosenStageConfig)
    }

    function _createFightingStage(stageConfig) {
        const { GameFightingStage } = classes
        this.subComponents.fightingStage = new GameFightingStage(stageConfig)
    }

    function _createGameRoundStatusBlock() {
        const { GameRoundStatusBlock } = classes
        this.subComponents.statusBlock = new GameRoundStatusBlock(this)
    }

    function _createMoreDOMs() {
        const { gameRoundNumber } = this.data

        const {
            fightingStage,
            statusBlock,
        } = this.subComponents


        const rootElement = createDOMWithClassNames('div', [
            'game-round',
            `game-round-${gameRoundNumber}`,
        ])

        const bothFightersContainerElement = createDOMWithClassNames('div', [
            'fighters',
        ])

        this.data.fighters.both.forEach(f => bothFightersContainerElement.appendChild(f.el.root))

        rootElement.appendChild(fightingStage.el.root)
        rootElement.appendChild(bothFightersContainerElement)
        rootElement.appendChild(statusBlock.el.root)

        this.el = {
            root: rootElement,
        }
    }




    function start() {
        console.log(`\n\n【游戏局 ${this.data.gameRoundNumber}】开始。\n\n\n`)
        this.status.isRunning = true
        _startKeyboardEngine.call(this)
        _startJudgement.call(this)
    }

    function _startKeyboardEngine() {
        const {
            keyboardEngine,
        } = this.game.services


        const bothFighters = this.data.fighters.both

        const {
            keyDown: keyDownOfBothFighters,
            keyUp:   keyUpOfBothFighters,
        } = bothFighters.reduce((kec, fp) => {
            const {
                keyDown,
                keyUp,
            } = kec

            kec = {
                keyDown: {
                    ...keyDown,
                    ...fp.data.keyboardEngineKeyDownConfig,
                },
                keyUp: {
                    ...keyUp,
                    ...fp.data.keyboardEngineKeyUpConfig,
                }
            }

            return kec
        }, {
            keyDown: {},
            keyUp: {},
        })

        const globalKewDown = {
            'ENTER': () => {
                console.warn('临时代码！')
                const loserArrayIndex = Math.floor(Math.random() * 2)
                this.data.fighters.both[loserArrayIndex].data.healthPoint = 0
                this.judge()
            },
        }

        keyboardEngineConfigForBothPlayers = {
            keyDown: {
                ...keyDownOfBothFighters,
                ...globalKewDown,
            },
            keyUp: {
                ...keyUpOfBothFighters,
            }
        }

        keyboardEngine.start(keyboardEngineConfigForBothPlayers)
    }

    function _startJudgement() {
        const { status } = this
        if (!status.isRunning) { return }
        if (status.judgementIntervalId) { return }
        status.judgementIntervalId = setInterval(() => {
            _judgeOnce.call(this)
        }, status.judgementInterval)
    }

    function _stopJudgement() {
        const { status } = this
        if (!status.judgementIntervalId) { return }
        clearInterval(status.judgementIntervalId)
        status.judgementIntervalId = NaN
    }

    function _judgeOnce() {
        _faceOffOnce.call(this)
        if (_eitherFighterLose.call(this)) {
            _roundHasAResult.call(this)
        }
    }

    function _eitherFighterLose() {
        const fighters = this.data.fighters
        const [ fighter1, fighter2 ] = fighters.both

        const f1HP = fighter1.data.healthPoint
        const f2HP = fighter2.data.healthPoint

        const epsilon = 0.0001

        return f1HP < epsilon || f2HP < epsilon
    }

    function _decideHPDecreasementForFighterBeingAttacked(attacker, sufferer) {
        if (!attacker.status.isAttacking) { return 0 }

        const oldPoint = sufferer.data.healthPoint

        const suffererDefensiveRatio = Math.random() * 0.15
        const attackerAttackingRatio = Math.random() * 0.25 + 0.1

        const defencePoint = sufferer.data.defencingPower * suffererDefensiveRatio
        const attackPoint  = attacker.data.attackingPower * attackerAttackingRatio

        const desiredDecreasement = Math.ceil(
            Math.max(0, attackPoint - defencePoint) * (Math.random() * 0.25 + 0.75)
        )

        const acceptedDecreasement = Math.min(oldPoint, desiredDecreasement)

        return acceptedDecreasement
    }

    function _faceOffOnce() {
        const [ fighter1, fighter2 ] = this.data.fighters.both

        const fighter1HPDecreasement = _decideHPDecreasementForFighterBeingAttacked(fighter2, fighter1)
        const fighter2HPDecreasement = _decideHPDecreasementForFighterBeingAttacked(fighter1, fighter2)

        fighter1.$suffer(fighter1HPDecreasement)
        fighter2.$suffer(fighter2HPDecreasement)

        this.subComponents.statusBlock.updateFightersStatusBaseOnFightersData()
    }

    function _roundHasAResult() {
        _stopJudgement.call(this)

        const fighters = this.data.fighters
        const [ fighter1, fighter2 ] = fighters.both

        const f1HP = fighter1.data.healthPoint
        const f2HP = fighter2.data.healthPoint

        console.warn('暂未考虑双方同时阵亡的细则', f1HP, f2HP)
        let winner, loser, winnerArrayIndex, loserArrayIndex
        if (f1HP < f2HP) {
            winner = fighter2
            loser  = fighter1
            winnerArrayIndex = 1
            loserArrayIndex  = 0
        } else {
            winner = fighter1
            loser  = fighter2
            winnerArrayIndex = 0
            loserArrayIndex  = 1
        }

        fighters.winner = winner
        fighters.loser  = loser
        fighters.winnerRoleConfig = winner.roleConfig
        fighters.loserRoleConfig  = loser.roleConfig
        fighters.winnerArrayIndex = winnerArrayIndex
        fighters.loserArrayIndex  = loserArrayIndex

        winner.win()
        loser.lose()

        _ending.call(this)
    }

    function _ending() {
        this.status.isRunning = false
        this.status.isOver = true

        _annouceResult.call(this)
    }

    function end() {
        this.game.services.keyboardEngine.stop()
        console.log(`【游戏局 ${this.data.gameRoundNumber}】结束。\n\n\n`)
        this.gameRoundsRunner.endCurrentRound()
    }

    function _annouceResult() {
        const { winner, loser } = this.data.fighters
        console.log(
            '\n胜者：', winner.logString,
            '\n败者：',  loser.logString,
            '\n\n'
        )

        this.game.services.keyboardEngine.start({
            keyDown: {
                'ENTER': this.end,
            },
        })
    }

    function showUp() {
        const rootElement = this.el.root

        return new Promise(resolve => {
            setTimeout(() => {
                rootElement.style.display = ''

                rootElement.classList.add('entering')
                rootElement.onanimationend = function () {
                    rootElement.classList.remove('entering')
                    rootElement.onanimationend = null
                }
            }, 200)
        })
    }

    function leaveAndHide() {
        const rootElement = this.el.root

        rootElement.classList.add('leaving')
        rootElement.onanimationend = function () {
            rootElement.style.display = 'none'
            rootElement.classList.remove('leaving')
            rootElement.onanimationend = null
        }
    }
})();
