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

    function endCurrentRound() {
        const { gameRounds, pickedFighterRoleConfigurations } = this.game.data

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

        const [ fighterRoleConfig1, fighterRoleConfig2 ] = pickedFighterRoleConfigurations.both

        const fighterRole1WonRounds = historicalGameRounds.filter(
            gameRound => gameRound.data.fighters.winnerRoleConfig === fighterRoleConfig1
        )

        const fighterRole2WonRounds = historicalGameRounds.filter(
            gameRound => gameRound.data.fighters.winnerRoleConfig === fighterRoleConfig2
        )

        const shouldEndGame = historicalGameRounds.length >= gameRounds.maxRoundsToRun ||
            fighterRole1WonRounds.length >= minWinningRoundsPerPlayer ||
            fighterRole2WonRounds.length >= minWinningRoundsPerPlayer


        if (shouldEndGame) {
            let finalWinnerRoleConfig
            let finalLoserRoleConfig
            let winningPlayerId = 0

            if (fighterRole1WonRounds.length > fighterRole2WonRounds.length) {
                finalWinnerRoleConfig = fighterRoleConfig1
                finalLoserRoleConfig  = fighterRoleConfig2
                winningPlayerId = 1
            } else {
                finalWinnerRoleConfig = fighterRoleConfig2
                finalLoserRoleConfig  = fighterRoleConfig1
                winningPlayerId = 2
            }

            pickedFighterRoleConfigurations.finalWinnerRoleConfig = finalWinnerRoleConfig
            pickedFighterRoleConfigurations.finalLoserRoleConfig  = finalLoserRoleConfig
            pickedFighterRoleConfigurations.winningPlayerId       = winningPlayerId

            this.end()
        } else {
            this.createAndStartNewRound()
        }
    }
})();
