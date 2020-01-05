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
            noMoreGameRoundsNeeded: false,
        }


        this.createAndStartNewRound                       = createAndStartNewRound                      .bind(this)
        this.evaluateGameStatusJustBeforeOneGameRoundEnds = evaluateGameStatusJustBeforeOneGameRoundEnds.bind(this)
        this.endCurrentRound                              = endCurrentRound                             .bind(this)

        _init.call(this)

        console.log('【游戏局运行引擎】创建完毕。')
    }

    function _init() {
        _createMoreDOMs.call(this)
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
        const {
            countDownOverlay,
        } = this.game.services

        _createNewRoundAndShowItUp.call(this)
        const currentGameRoundCaption = this.game.data.gameRounds.current.gameRoundCaption
        await countDownOverlay.countDown(3, currentGameRoundCaption)
        _startCurrentRound.call(this)
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

        const newGameRound = new GameRound(
            this.game,
            displayingIndexOfNewGameRound,
            this.game.data.gameRounds.maxRoundsToRun
        )

        gameRounds.current = newGameRound

        this.el.root.appendChild(newGameRound.el.root)

        if (lastRunGameRound instanceof GameRound) {
            lastRunGameRound.leaveAndHide()
        }

        newGameRound.showUp()
    }

    function _startCurrentRound() {
        this.status.isRunningOneRound = true
        this.game.data.gameRounds.current.start()
    }
    
    function _evaluateGameStatusJustBeforeOneGameRoundEnds() {
        const { gameRounds, pickedFighterRoleConfigurations } = this.game.data

        const {
            minWinningRoundsPerPlayer,
            history: historicalGameRounds,
            current: currentGameRound,
        } = gameRounds

        const allGameRoundsSoFar = [
            ...historicalGameRounds,
            currentGameRound,
        ]

        const player1WonRounds = allGameRoundsSoFar.filter(
            gameRound => gameRound.data.fighters.winnerPlayerId === 1
        )

        const player2WonRounds = allGameRoundsSoFar.filter(
            gameRound => gameRound.data.fighters.winnerPlayerId === 2
        )

        const player1WonRoundsCount = player1WonRounds.length
        const player2WonRoundsCount = player2WonRounds.length
        const totalRunRoundsCount = allGameRoundsSoFar.length

        const noMoreGameRoundsNeeded = totalRunRoundsCount >= gameRounds.maxRoundsToRun ||
            player1WonRoundsCount >= minWinningRoundsPerPlayer ||
            player2WonRoundsCount >= minWinningRoundsPerPlayer

        // console.log('Player1:', player1WonRoundsCount, '局胜')
        // console.log('Player2:', player2WonRoundsCount, '局胜')
        // console.log('应该结束整个游戏？', noMoreGameRoundsNeeded)

        const [ fighterRoleConfig1, fighterRoleConfig2 ] = pickedFighterRoleConfigurations.both

        if (noMoreGameRoundsNeeded) {
            let finalWinnerRoleConfig
            let finalLoserRoleConfig
            let finalWinnerPlayerId
            let winnerWonRoundsCount
            let winnerLostRoundsCount

            if (player1WonRoundsCount > player2WonRoundsCount) {
                finalWinnerRoleConfig = fighterRoleConfig1
                finalLoserRoleConfig  = fighterRoleConfig2
                finalWinnerPlayerId   = 1
                winnerWonRoundsCount  = player1WonRoundsCount
                winnerLostRoundsCount = totalRunRoundsCount - player1WonRoundsCount
            } else if (player1WonRoundsCount < player2WonRoundsCount)  {
                finalWinnerRoleConfig = fighterRoleConfig2
                finalLoserRoleConfig  = fighterRoleConfig1
                finalWinnerPlayerId   = 2
                winnerWonRoundsCount  = player2WonRoundsCount
                winnerLostRoundsCount = totalRunRoundsCount - player2WonRoundsCount
            } else {
                finalWinnerRoleConfig = null
                finalLoserRoleConfig  = null
                finalWinnerPlayerId   = NaN
                winnerWonRoundsCount  = NaN
                winnerLostRoundsCount = NaN
            }

            pickedFighterRoleConfigurations.finalWinnerRoleConfig = finalWinnerRoleConfig
            pickedFighterRoleConfigurations.finalLoserRoleConfig  = finalLoserRoleConfig
            pickedFighterRoleConfigurations.finalWinnerPlayerId   = finalWinnerPlayerId
            pickedFighterRoleConfigurations.winnerWonRoundsCount  = winnerWonRoundsCount
            pickedFighterRoleConfigurations.winnerLostRoundsCount = winnerLostRoundsCount
        }

        this.status.noMoreGameRoundsNeeded = noMoreGameRoundsNeeded
    }

    function evaluateGameStatusJustBeforeOneGameRoundEnds() {
        if (!this.game.data.gameRounds.current) {
            throw new ReferenceError('还没有开始过任何游戏局！')
        }

        _evaluateGameStatusJustBeforeOneGameRoundEnds.call(this)

        return this.status.noMoreGameRoundsNeeded
    }

    function endCurrentRound() {
        const { status } = this
        const { gameRounds } = this.game.data

        status.isRunningOneRound = false

        const {
            history: historicalGameRounds,
            current: currentGameRound,
        } = gameRounds

        if (!currentGameRound) {
            throw new ReferenceError('还没有开始过任何游戏局！')
        }

        historicalGameRounds.push(currentGameRound)
        gameRounds.current = null

        if (status.noMoreGameRoundsNeeded) {
            _end.call(this)
        } else {
            this.createAndStartNewRound()
        }
    }

    function _end() {
        this.status.isOver = true
        this.game.end()
    }
})();
