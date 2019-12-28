window.duanduanGameChaoJiYongShi.classes.GameRunningScreen = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes } = app
    const { createDOMWithClassNames } = utils

    return function GameRunningScreen(game, initOptions) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameRunningScreen 构造函数。')
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

        this.subComponents = {}

        this.data = {
            gameRounds: {
                minWinningRoundsPerPlayer,
                maxRoundsToRun: _maxRoundsToRun,
                history: [],
                current: null,
            },
        }

        this.status = {
            isRunningOneRound: false,
            isOver: false,
        }


        this.start                  = start                 .bind(this)
        this.end                    = end                   .bind(this)

        this.createAndStartNewRound = createAndStartNewRound.bind(this)
        this.endCurrentRound        = endCurrentRound       .bind(this)
        this.showUp                 = showUp                .bind(this)
        this.hide                   = hide                  .bind(this)
        this.leaveAndHide           = leaveAndHide          .bind(this)

        _init.call(this)

        console.log('【游戏运行界面】创建完毕。')
    }

    function _init() {
        _createCountDownOverlay.call(this)
        _createMoreDOMs.call(this)
    }

    function _createCountDownOverlay() {
        const { CountDownOverlay } = classes
        this.subComponents.countDownOverlay = new CountDownOverlay()
    }

    function _createMoreDOMs() {
        const {
            countDownOverlay,
        } = this.subComponents

        
        const rootElement = createDOMWithClassNames('div', [
            'ui-screen',
            'game-running-screen',
        ])

        const gameRoundsContainerElement = createDOMWithClassNames('div', [
            'game-rounds',
        ])

        rootElement.appendChild(gameRoundsContainerElement)
        rootElement.appendChild(countDownOverlay.el.root)
        

        this.el = {
            root: rootElement,
            gameRoundsContainer: gameRoundsContainerElement,
        }
    }


    async function createAndStartNewRound() {
        _createNewRoundAndShowItUp.call(this)
        await this.subComponents.countDownOverlay.countDown(3)
        _startCurrentRound.call(this)
    }

    function start() {
        this.createAndStartNewRound()
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
        } = this.data

        const historicalGameRoundsCount = historicalGameRounds.length

        const lastRunGameRound = historicalGameRounds[historicalGameRoundsCount - 1]

        const displayingIndexOfNewGameRound = historicalGameRoundsCount + 1
        const newGameRound = new GameRound(this.game, displayingIndexOfNewGameRound)
        gameRounds.current = newGameRound

        this.el.gameRoundsContainer.appendChild(newGameRound.el.root)

        if (lastRunGameRound instanceof GameRound) {
            lastRunGameRound.leaveAndHide()
        }

        newGameRound.showUp()
    }

    function _startCurrentRound() {
        const { gameRounds } = this.data
        this.status.isRunningOneRound = true
        gameRounds.current.start()
    }

    function endCurrentRound() {
        const { gameRounds, fighters } = this.data

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

        const [ fighter1, fighter2 ] = fighters.bothAttenders

        const fighter1WonRounds = historicalGameRounds.filter(
            gameRound => gameRound.fighters.winner === fighter1
        )

        const fighter2WonRounds = historicalGameRounds.filter(
            gameRound => gameRound.fighters.winner === fighter2
        )

        const shouldEndGame = fighter1WonRounds.length > minWinningRoundsPerPlayer ||
            fighter2WonRounds.length > minWinningRoundsPerPlayer ||
            historicalGameRounds.length >= gameRounds.maxRoundsToRun

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
    
    function showUp() {
        const rootElement = this.el.root
        rootElement.style.display = ''
    }

    function hide() {
        const rootElement = this.el.root
        rootElement.style.display = 'none'
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
