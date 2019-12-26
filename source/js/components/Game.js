window.duanduanGameChaoJiYongShi.classes.Game = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { GameRound } = app.classes

    return function Game(initOptions) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 Game 构造函数。')
        }

        const {
            allGameFighterCandidatesForBothPlayers,
            allGameFightingStageCandidates,
            maxRoundsToRun,
        } = initOptions

        let _maxRoundsToRun
        
        if (maxRoundsToRun === undefined) {
            _maxRoundsToRun = 3
        } else {
            _maxRoundsToRun = Math.floor(maxRoundsToRun)
            if (_maxRoundsToRun !== maxRoundsToRun || _maxRoundsToRun % 2 === 0) {
                throw new Error('maxRoundsToRun 必须为正奇数。')
            }
        }

        const minWinningRoundsPerPlayer = Math.ceil(_maxRoundsToRun / 2)

        const [
            player1RoleCandidates,
            player2RoleCandidates,
        ] = allGameFighterCandidatesForBothPlayers

        this.fighters = {
            candidatesForPlayer1: {
                currentChoice: player1RoleCandidates[0],
                allCandidates: player1RoleCandidates,
            },
            candidatesForPlayer2: {
                currentChoice: player2RoleCandidates[0],
                allCandidates: player2RoleCandidates,
            },
            bothAttenders: [],
            finalWinner: null,
            finalLoser: null,
        }

        this.allGameFightingStageCandidates = allGameFightingStageCandidates

        this.gameRounds = {
            minWinningRoundsPerPlayer,
            maxRoundsToRun: _maxRoundsToRun,
            history: [],
            current: null,
        }

        this.el = {}

        this.status = {
            isRunning: false,
        }


        this.prepare                 = prepare                .bind(this)
        this.confirmFighterForPlayer = confirmFighterForPlayer.bind(this)
        this.onOneFighterConfirmed   = onOneFighterConfirmed  .bind(this)

        this.start                   = start                  .bind(this)
        this.end                     = end                    .bind(this)

        this.startNewRound           = startNewRound          .bind(this)
        this.endCurrentRound         = endCurrentRound        .bind(this)

        _init(this)

        console.log('【游戏】创建完毕。')
    }

    function _init(game) {
        const { el, fighters } = game
        const {
            candidatesForPlayer1: gameRoleCandidatesForPlayer1,
            candidatesForPlayer2: gameRoleCandidatesForPlayer2,
        } = fighters

        const roleCandidatesSlot1Element = document.querySelector('.role-candidates-slot-1')
        const roleCandidatesSlot2Element = document.querySelector('.role-candidates-slot-2')

        el.roleCandidatesSlot1Element = roleCandidatesSlot1Element
        el.roleCandidatesSlot2Element = roleCandidatesSlot2Element

        

        insertGameRoleCandidatesToDocument(gameRoleCandidatesForPlayer1.allCandidates, roleCandidatesSlot1Element)
        insertGameRoleCandidatesToDocument(gameRoleCandidatesForPlayer2.allCandidates, roleCandidatesSlot2Element)

    

        function insertGameRoleCandidatesToDocument(roleCandidates, slotElement) {
            roleCandidates.forEach((grc, i) => {
                const roleCandidateRootElement = grc.el.root
                slotElement.appendChild(roleCandidateRootElement)
                roleCandidateRootElement.style.top = `${100 * i}%`
            })
        }
    }


    function prepare() {
        _beginChoosingFighters.call(this)
    }

    function _beginChoosingFighters() {

    }

    function confirmFighterForPlayer(playerId) {
        const gameRoleCandidates = this.fighters[`candidatesForPlayer${playerId}`]
        _setFighter.call(this, playerId, gameRoleCandidates.currentChoice)

        this.onOneFighterConfirmed()
    }

    function _setFighter(playerId, fighterCandidate) {
        const game = this
        const arrayIndex = playerId - 1
        game.fighters.bothAttenders[arrayIndex] = new GameRole(game, playerId, fighterCandidate)
    }

    function onOneFighterConfirmed() {
        const bothFightersAreConfirmed = true
        if (bothFightersAreConfirmed) {
            this.start()
        }
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
        }
    }
})();
