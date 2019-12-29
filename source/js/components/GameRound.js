window.duanduanGameChaoJiYongShi.classes.GameRound = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes } = app

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
            attackerIdOfNextRound: 0,
        }

        this.start        = start       .bind(this)
        this.end          = end         .bind(this)
        this.judge        = judge       .bind(this)
        this.showUp       = showUp      .bind(this)
        this.leaveAndHide = leaveAndHide.bind(this)

        console.log('旧版逻辑')
        this._oldStyleOneFaceOff = _oldStyleOneFaceOff.bind(this)


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
        const { game } = this
        const pickedFighterRoleConfigurations = game.data.pickedFighterRoleConfigurations.both
        this.data.fighters.both = pickedFighterRoleConfigurations.map((roleConfig, i) => {
            const { GameRole } = classes
            const newGameRole = new GameRole(game, i + 1, roleConfig)
            newGameRole.joinGameRound(this)
            return newGameRole
        })
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

        const {
            keyboardEngine,
        } = this.game.services

        keyboardEngine.start({
            ' ': this._oldStyleOneFaceOff,
            'ENTER': () => {
                console.warn('临时代码！')
                const loserArrayIndex = Math.floor(Math.random() * 2)
                this.data.fighters.both[loserArrayIndex].data.healthPoint = 0
                this.judge()
            },
        })
    }

    function _decideHealthPointDecreaseForOneRole(roleAIsDefencer, roleA, roleB) {
        const oldPoint = roleA.data.healthPoint

        let roleADefensiveRatio
        let roleBAttackingRatio
        if (roleAIsDefencer) {
            roleADefensiveRatio = Math.random() * 0.3 + 0.7
            roleBAttackingRatio = Math.random() * 0.3 + 0.7
        } else {
            roleADefensiveRatio = Math.random() * 0.15
            roleBAttackingRatio = Math.random() * 0.25 + 0.1
        }

        const attackFromB = roleB.data.attackingPower * roleBAttackingRatio
        const defenceOfA  = roleA.data.defencingPower * roleADefensiveRatio

        const decreaseLimit = Math.max(0, attackFromB - defenceOfA)

        decrease = Math.min(oldPoint, Math.floor(Math.random() * decreaseLimit))
        return decrease
    }

    function _oldStyleOneFaceOff() {
        const { status } = this

        if (!status.isRunning) {
            return
        }

        const fighters = this.data.fighters.both

        const attackerIdOfThisRound = status.attackerIdOfNextRound
        const attackerIdOfNextRound = 1 - attackerIdOfThisRound

        const attacker = fighters[attackerIdOfThisRound]
        const defencer = fighters[attackerIdOfNextRound]

        console.log(`${attacker.logString} 正在攻击 ${defencer.logString}...`)

        attacker.setPoseTo('is-attacking')
        defencer.setPoseTo('')

        const decreasePoints = [
            _decideHealthPointDecreaseForOneRole(true,  defencer, attacker),
            _decideHealthPointDecreaseForOneRole(false, attacker, defencer),
        ]

        defencer.data.healthPoint -= decreasePoints[0]
        attacker.data.healthPoint -= decreasePoints[1]

        status.attackerIdOfNextRound = attackerIdOfNextRound

        this.judge()
    }


    function judge() {
        this.subComponents.statusBlock.updateFightersStatusBaseOnFightersData()

        const fighters = this.data.fighters
        const [ fighter1, fighter2 ] = fighters.both

        const f1HP = fighter1.data.healthPoint
        const f2HP = fighter2.data.healthPoint

        const epsilon = 0.0001

        if (f1HP >= epsilon && f2HP >= epsilon) {
            return
        }

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
            'ENTER': this.end,
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
