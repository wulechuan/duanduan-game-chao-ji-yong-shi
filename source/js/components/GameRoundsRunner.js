window.duanduanGameChaoJiYongShi.classes.GameRoundsRunner = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes } = app
    const { createDOMWithClassNames } = utils

    return function GameRoundsRunner(game, initOptions) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameRoundsRunner 构造函数。')
        }

        const {
            maxRoundsToRun,
        } = initOptions

        let _maxRoundsToRun

        if (maxRoundsToRun === undefined || maxRoundsToRun === null) {
            _maxRoundsToRun = 3
        } else {
            _maxRoundsToRun = Math.floor(maxRoundsToRun)
            if (_maxRoundsToRun !== maxRoundsToRun || _maxRoundsToRun % 2 === 0) {
                throw new Error('maxRoundsToRun 必须为正奇数。')
            }
        }

        const minWinningRoundsPerPlayer = Math.ceil(_maxRoundsToRun / 2)

        this.game = game

        game.data.gameRounds.maxRoundsToRun = _maxRoundsToRun
        game.data.gameRounds.minWinningRoundsPerPlayer = minWinningRoundsPerPlayer

        this.subComponents = {}

        this.data = {}

        this.status = {
            isRunningOneRound: false,
            isOver: false,
        }


        this.createAndStartNewRound = createAndStartNewRound.bind(this)
        this.endCurrentRound        = endCurrentRound       .bind(this)
        this.end                    = end                   .bind(this)

        _init.call(this)

        console.log('【游戏局运行引擎】创建完毕。')
    }

    function _init() {
        _createCountDownOverlay.call(this)
        _createMoreDOMs        .call(this)
    }

    function _createCountDownOverlay() {
        const { CountDownOverlay } = classes
        this.subComponents.countDownOverlay = new CountDownOverlay()
    }

    function _createMoreDOMs() {
        const rootElement = createDOMWithClassNames('div', [
            'game-rounds',
        ])

        this.el = {
            root: rootElement,
        }
    }


    async function createAndStartNewRound() {
        _createNewRoundAndShowItUp.call(this)
        await this.subComponents.countDownOverlay.countDown(3)
        _startCurrentRound.call(this)
    }

    function end() {
        this.status.isOver = true
        this.game.end()
    }

    function _createNewRoundAndShowItUp() {
        const { GameRound } = classes

        const {
            gameRounds,
            gameRounds: {
                history: historicalGameRounds,
            },
        } = this.game.data

        const historicalGameRoundsCount = historicalGameRounds.length
        
        const lastRunGameRound = historicalGameRounds[historicalGameRoundsCount - 1]
        
        const displayingIndexOfNewGameRound = historicalGameRoundsCount + 1

        const newGameRound = new GameRound(this.game, displayingIndexOfNewGameRound)
        gameRounds.current = newGameRound

        this.el.root.appendChild(newGameRound.el.root)

        if (lastRunGameRound instanceof GameRound) {
            lastRunGameRound.leaveAndHide()
        }

        newGameRound.showUp()
    }

    function _startCurrentRound() {
        const { gameRounds } = this.game.data
        this.status.isRunningOneRound = true
        gameRounds.current.start()
    }

    function endCurrentRound() {
        const { gameRounds, fighters } = this.game.data

        this.status.isRunningOneRound = false

        const {
            minWinningRoundsPerPlayer,
            history: historicalGameRounds,
            current: currentGameRound,
        } = gameRounds

        if (!currentGameRound) {
            throw new ReferenceError('还没有开始过任何游戏局！')
        }


        historicalGameRounds.push(currentGameRound)
        gameRounds.current = null

        const [ fighter1, fighter2 ] = fighters.both

        const fighter1WonRounds = historicalGameRounds.filter(
            gameRound => gameRound.data.fighters.winner === fighter1
        )

        const fighter2WonRounds = historicalGameRounds.filter(
            gameRound => gameRound.data.fighters.winner === fighter2
        )

        const shouldEndGame = historicalGameRounds.length >= gameRounds.maxRoundsToRun ||
            fighter1WonRounds.length >= minWinningRoundsPerPlayer ||
            fighter2WonRounds.length >= minWinningRoundsPerPlayer
            

        if (shouldEndGame) {
            let finalWinner
            let finalLoser

            if (fighter1WonRounds.length > fighter2WonRounds.length) {
                finalWinner = fighter1
                finalLoser  = fighter2
            } else {
                finalWinner = fighter2
                finalLoser  = fighter1
            }

            fighters.finalWinner = finalWinner
            fighters.finalLoser  = finalLoser

            this.end()
        } else {
            this.createAndStartNewRound()
        }
    }
})();
