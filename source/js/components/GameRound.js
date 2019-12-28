window.duanduanGameChaoJiYongShi.classes.GameRound = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes } = app

    const {
        randomPositiveIntegerLessThan,
        createDOMWithClassNames,
    } = utils
    
    return function GameRound(game, gameRoundIndex) {
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
        this.gameRoundIndex = gameRoundIndex


        this.fighters = {
            both: game.fighters.bothAttenders,
            winner: null,
            loser: null,
            winnerArrayIndex: NaN,
            loserArrayIndex: NaN,
        }

        this.status = {
            isRunning: false,
            isOver: false,
        }

        this.start            = start           .bind(this)
        this.end              = end             .bind(this)
        this.annouceResult    = annouceResult   .bind(this)
        this.showUp           = showUp          .bind(this)
        this.leaveAndHide     = leaveAndHide    .bind(this)
        

        _init(this)

        console.log('【游戏局】创建完毕。')
    }



    function _init(gameRound) {
        _createStage(gameRound)
        _createRoundStatusBar(gameRound)
        _createMoreDOMs(gameRound)
        gameRound.el.root.style.display = 'none'
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

    function _createStage(gameRound) {
        const { GameFightingStage } = classes
        const stageConfigs = gameRound.game.allGameFightingStageConfigurations
        const chosenStageConfig = stageConfigs[randomPositiveIntegerLessThan(stageConfigs.length)]
        gameRound.stage = new GameFightingStage(chosenStageConfig)
    }

    function _createRoundStatusBar(gameRound) {
        const { GameRoundStatusBlock } = classes
        gameRound.statusBlock = new GameRoundStatusBlock(gameRound)
    }

    function _createMoreDOMs(gameRound) {
        const { gameRoundIndex } = gameRound

        const [ fighter1, fighter2 ] = gameRound.fighters.both

        const fighter1RootElement = fighter1.el.root
        const fighter2RootElement = fighter2.el.root
        const stageRootElement = gameRound.stage.el.root
        const gameRoundStatusBlockRootElement = gameRound.statusBlock.el.root


        const rootElement = createDOMWithClassNames('div', [
            'game-round',
            `game-round-${gameRoundIndex}`,
        ])

        const fightersElement = createDOMWithClassNames('div', [
            'fighters',
        ])

        fightersElement.appendChild(fighter1RootElement)
        fightersElement.appendChild(fighter2RootElement)

        rootElement.appendChild(stageRootElement)
        rootElement.appendChild(fightersElement)
        rootElement.appendChild(gameRoundStatusBlockRootElement)
        
        gameRound.el = {
            root: rootElement,
            stage: stageRootElement,
            fighter1: fighter1RootElement,
            fighter2: fighter2RootElement,
        }
    }

    async function start() {
        console.log('【游戏局】开始。')
        this.status.isRunning = true

        console.warn('虚假逻辑开始。')
        const ms = Math.floor(Math.random() * 13579 + 2468)
        console.log(`等待：${ms}ms`)
        await new Promise(resolve => {
            setTimeout(() => {
                // console.log(`游戏耗时：${ms}ms`)
                resolve()
            }, ms)
        })
        console.warn('虚假逻辑结束。')

        this.end({ loser: this.fighters.both[0] })
    }

    function end(options) {
        this.status.isRunning = false
        this.status.isOver = true
        console.log('【游戏局】结束。')

        const { loser } = options

        const { fighters } = this
        const [ fighter1, fighter2 ] = fighters.both

        if (fighter1 === loser) {
            fighters.winner = fighter2
            fighters.loser  = fighter1
            fighters.winnerArrayIndex = 1
            fighters.loserArrayIndex  = 0
        } else {
            fighters.winner = fighter1
            fighters.loser  = fighter2
            fighters.winnerArrayIndex = 0
            fighters.loserArrayIndex  = 1
        }

        this.annouceResult()
        this.game.endCurrentRound()
    }

    function annouceResult() {
        const { winner, loser } = this.fighters
        console.log('Winner:', winner.name)
        console.log('Loser:',  loser.name)
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
