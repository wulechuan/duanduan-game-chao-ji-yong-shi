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

        if (game.status.isRunningOneRound) {
            throw new Error('【游戏】已经开始。不能为已经开始的【游戏】创建【游戏局】。')
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
        }

        this.start         = start        .bind(this)
        this.end           = end          .bind(this)
        this.annouceResult = annouceResult.bind(this)
        this.showUp        = showUp       .bind(this)
        this.leaveAndHide  = leaveAndHide .bind(this)


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
            return new GameRole(game, i + 1, roleConfig)
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
        const { gameRoundNumber } = this

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

    async function start() {
        console.log('【游戏局】开始。')
        this.status.isRunning = true

        console.warn('虚假逻辑开始。')
        const ms = Math.floor(Math.random() * 1357 + 246)
        console.log(`等待：${ms}ms`)
        await new Promise(resolve => {
            setTimeout(() => {
                // console.log(`游戏耗时：${ms}ms`)
                resolve()
            }, ms)
        })
        console.warn('虚假逻辑结束。')

        this.end({ loser: this.data.fighters.both[0] })
    }

    function end(options) {
        this.status.isRunning = false
        this.status.isOver = true
        console.log('【游戏局】结束。')

        const { loser } = options

        const { fighters } = this.data
        const [ fighter1, fighter2 ] = fighters.both

        if (fighter1 === loser) {
            fighters.winner = fighter2
            fighters.loser  = fighter1
            fighters.winnerRoleConfig = fighter2.roleConfig
            fighters.loserRoleConfig  = fighter1.roleConfig
            fighters.winnerArrayIndex = 1
            fighters.loserArrayIndex  = 0
        } else {
            fighters.winner = fighter1
            fighters.loser  = fighter2
            fighters.winnerRoleConfig = fighter1.roleConfig
            fighters.loserRoleConfig  = fighter2.roleConfig
            fighters.winnerArrayIndex = 0
            fighters.loserArrayIndex  = 1
        }

        this.annouceResult()
        this.gameRoundsRunner.endCurrentRound()
    }

    function annouceResult() {
        const { winner, loser } = this.data.fighters
        console.log('胜者：', winner.data.name)
        console.log('败者：',  loser.data.name)
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
