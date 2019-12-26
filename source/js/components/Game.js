window.duanduanGameChaoJiYongShi.classes.Game = (function () {
    const globalDataRoot = window.duanduanGameChaoJiYongShi
    const { GameRound } = globalDataRoot.classes
    const {
        allFighterCandidates,
        allFightingStageCandidates,
    } = globalDataRoot.data


    return function Game() {
        if (!new.target) {
            throw new Error('必须使用 new 运算来调用 Game 构造函数。')
        }

        this.fighters = {
            allCandidates: [],
            bothAttenders: [],
            finalWinner: null,
            finalLoser: null,
        }

        this.gameRounds = {
            maxRoundsToRun: 3,
            history: [],
            current: null,
        }

        this.status = {
            isRunning: false,
        }

        this.setFighter1      = setFighter1     .bind(this)
        this.setFighter2      = setFighter2     .bind(this)

        this.prepare          = prepare         .bind(this)
        this.start            = start           .bind(this)
        this.startNewRound    = startNewRound   .bind(this)
        this.endCurrentRound  = endCurrentRound .bind(this)
        this.end              = end             .bind(this)
    }

    function setFighter1(fighter) {
        this.fighters.bothAttenders[0] = fighter
    }

    function setFighter2(fighter) {
        this.fighters.bothAttenders[1] = fighter
    }

    function prepare() {
    }

    function start() {
        this.status.isRunning = true
        this.startNewRound()
    }

    function end() {
        console.log('游戏结束。')
    }

    function startNewRound() {
        const newGameRound = new GameRound(this)
        this.gameRounds.current = newGameRound
        newGameRound.start()
    }

    function endCurrentRound() {
        const { gameRounds, fighters } = this
        const { history: historicalGameRounds } = gameRounds

        if (!gameRounds.current) {
            throw new ReferenceError('还没有开始过任何游戏局！')
        }

        historicalGameRounds.push(gameRounds.current)
        gameRounds.current = null

        const [ fighter1, fighter2 ] = fighters.both

        const fighter1WonRounds = historicalGameRounds.filter(
            gameRound => gameRound.fighters.winner === fighter1
        )

        const fighter2WonRounds = historicalGameRounds.filter(
            gameRound => gameRound.fighters.winner === fighter2
        )

        const minWinningRounds = Math.ceil(gameRounds.maxRoundsToRun / 2)

        const shouldEndGame = fighter1WonRounds.length > minWinningRounds ||
            fighter2WonRounds.length > minWinningRounds ||
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
        }
    }
})();
