window.duanduanGameChaoJiYongShi.classes.Game = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { GameRound } = app.classes

    return function Game(initOptions) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 Game 构造函数。')
        }

        const {
            allGameFighterCandidates,
            allGameFightingStageCandidates,
        } = initOptions

        this.fighters = {
            allCandidates: allGameFighterCandidates,
            bothAttenders: [],
            finalWinner: null,
            finalLoser: null,
        }

        this.allGameFightingStageCandidates = allGameFightingStageCandidates

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

        console.log('【游戏】创建完毕。')
    }

    function setFighter(fighterCandidate, playerId) {
        const game = this
        const index = playerId
        game.fighters.bothAttenders[index] = new GameRole(game, playerId, fighterCandidate)
    }

    function setFighter1(fighterCandidate) {
        setFighter.call(this, fighterCandidate, 0)
    }

    function setFighter2(fighterCandidate) {
        setFighter.call(this, fighterCandidate, 1)
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
