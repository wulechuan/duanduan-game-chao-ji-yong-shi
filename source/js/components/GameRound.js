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

            judgementInterval: 66, // milliseconds
            judgementIntervalId: NaN,

            fighterNewAttacksQueue: [],
        }

        this.start                     = start                    .bind(this)
        this.end                       = end                      .bind(this)
        this.showUp                    = showUp                   .bind(this)
        this.leaveAndHide              = leaveAndHide             .bind(this)
        this.acceptOneAttackFromPlayer = acceptOneAttackFromPlayer.bind(this)


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
        _startJudgementInterval.call(this)
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
                this.data.fighters.both[Math.floor(Math.random() * 2)].$suffer(100000000)
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

    function acceptOneAttackFromPlayer(playerId) {
        this.status.fighterNewAttacksQueue.push(playerId)
    }

    function _startJudgementInterval() {
        const { status } = this
        if (!status.isRunning) { return }
        if (status.judgementIntervalId) { return }
        status.judgementIntervalId = setInterval(() => {
            _processAllQueuedAttacks.call(this)
        }, status.judgementInterval)
    }

    function _stopJudgementInterval() {
        const { status } = this
        if (!status.judgementIntervalId) { return }
        clearInterval(status.judgementIntervalId)
        status.judgementIntervalId = NaN
    }

    function _processAllQueuedAttacks() {
        const { status } = this
        const { fighterNewAttacksQueue } = status

        let arrayIndex = 0
        let eitherFighterLose = false

        while (arrayIndex < fighterNewAttacksQueue.length) {
            const attackerPlayerId = fighterNewAttacksQueue[arrayIndex]

            _judgeOnce.call(this, attackerPlayerId)

            eitherFighterLose = _eitherFighterLose.call(this)
            if (eitherFighterLose) { break }

            arrayIndex++
        }

        status.fighterNewAttacksQueue = []
        this.subComponents.statusBlock.updateFightersStatusBaseOnFightersData()

        if (eitherFighterLose) {
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

    function _judgeOnce(attackerPlayerId) {
        const attackerArrayIndex = attackerPlayerId - 1
        const suffererArrayIndex = 1 - attackerArrayIndex

        const bothFighters = this.data.fighters.both
        const attacker = bothFighters[attackerArrayIndex]
        const sufferer = bothFighters[suffererArrayIndex]

        const attackerData = sufferer.data
        const attackerHealthPoint     = attackerData.healthPoint
        const attackerFullHealthPoint = attackerData.fullHealthPoint

        const suffererData = sufferer.data
        const suffererFullHealthPoint = suffererData.fullHealthPoint
        const suffererOldHealthPoint = suffererData.healthPoint
        const suffererIsDefencing    = sufferer.status.isInDefencingMode


        const {
            roleAttackingPowerExtraRatio,
            roleDefencingPowerExtraRatio,
        } = appData.gameGlobalSettings

        const suffererDefensiveRatioIdea = suffererIsDefencing
            ? (Math.random() * 0.2  + 0.8)
            : (Math.random() * 0.15 + 0.15)

        const suffererDefensiveRatioActual = suffererDefensiveRatioIdea * (suffererOldHealthPoint / suffererFullHealthPoint)

        const attackerAttackingRatioIdea = Math.random() * 0.364 + 0.6
        const attackerAttackingRatioActual = attackerAttackingRatioIdea * (attackerHealthPoint / attackerFullHealthPoint)

        const absoluteAttackingBasePoint = Math.ceil(Math.random() * 79 + 90)

        const defencePoint = sufferer.data.defencingPower * suffererDefensiveRatioActual * roleAttackingPowerExtraRatio
        const attackPoint  = attacker.data.attackingPower * attackerAttackingRatioActual * roleDefencingPowerExtraRatio

        const desiredDecrease = Math.ceil(Math.max(0, attackPoint - defencePoint)) + absoluteAttackingBasePoint

        console.log(`${attacker.logString}攻击生效。\n${sufferer.logString}因此应扣除`, desiredDecrease, '点血值。')
        sufferer.$suffer(desiredDecrease)
    }

    function _roundHasAResult() {
        _stopJudgementInterval.call(this)

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
