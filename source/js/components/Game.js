window.duanduanGameChaoJiYongShi.classes.Game = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { classes } = app

    return function Game(initOptions) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 Game 构造函数。')
        }

        const {
            allGameFighterCandidatesForBothPlayers,
            allGameFightingStageConfigurations,
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
            attender1HasConfirmed: false,
            attender2HasConfirmed: false,
            bothAttenders: [],
            finalWinner: null,
            finalLoser: null,
        }

        this.allGameFightingStageConfigurations = [
            ...allGameFightingStageConfigurations,
        ]

        this.gameRounds = {
            minWinningRoundsPerPlayer,
            maxRoundsToRun: _maxRoundsToRun,
            history: [],
            current: null,
        }

        this.el = {}

        this.status = {
            isRunningOneRound: false,
            isOver: false,
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

        const rolePickingScreenElement = document.querySelector('#role-picking-screen')
        const gameRunningScreenElement = document.querySelector('#game-running-screen')

        const roleCandidatesSlot1Element = document.querySelector('.role-candidates-slot.player-1')
        const roleCandidatesSlot2Element = document.querySelector('.role-candidates-slot.player-2')
        const gameRoundsContainerElement = gameRunningScreenElement.querySelector('.game-rounds')

        // el.roleCandidatesSlot1Element = roleCandidatesSlot1Element
        // el.roleCandidatesSlot2Element = roleCandidatesSlot2Element
        el.rolePickingScreenElement = rolePickingScreenElement
        el.gameRunningScreenElement = gameRunningScreenElement
        el.gameRoundsContainerElement = gameRoundsContainerElement

        insertGameRoleCandidatesToDocument(gameRoleCandidatesForPlayer1.allCandidates, roleCandidatesSlot1Element)
        insertGameRoleCandidatesToDocument(gameRoleCandidatesForPlayer2.allCandidates, roleCandidatesSlot2Element)


        function insertGameRoleCandidatesToDocument(roleCandidates, containerElement) {
            roleCandidates.forEach((grc, i) => {
                const roleCandidateRootElement = grc.el.root
                containerElement.appendChild(roleCandidateRootElement)
                roleCandidateRootElement.style.top = 0; // `${100 * i}%`
            })
        }
    }


    function prepare() {
        _beginChoosingFighters.call(this)
    }

    async function _beginChoosingFighters() {
        const {
            el: {
                rolePickingScreenElement,
                gameRunningScreenElement,
            },
        } = this

        rolePickingScreenElement.style.display = ''
        gameRunningScreenElement.style.display = 'none'



        console.warn('虚假逻辑开始。')
        const randomInt = window.duanduanGameChaoJiYongShi.utils.randomPositiveIntegerLessThan

        function fakePickingFighter(playerId, fighterData) {
            const candidates = fighterData.allCandidates
            const ms = Math.floor(Math.random() * 4000)

            return new Promise(resolve => {
                setTimeout(() => {
                    fighterData.currentChoice = candidates[randomInt(candidates.length)]
                    console.log(`${playerId}: ${ms}ms`, fighterData.currentChoice.name)
                    resolve(fighterData.currentChoice)
                }, ms)
            })
        }
        
        await Promise.all([
            fakePickingFighter(1, this.fighters.candidatesForPlayer1),
            fakePickingFighter(2, this.fighters.candidatesForPlayer2),
        ])
        console.warn('虚假逻辑结束。')
        
        
        
        this.confirmFighterForPlayer(1)
        this.confirmFighterForPlayer(2)
    }

    function confirmFighterForPlayer(playerId) {
        const {
            fighters,
        } = this

        const gameRoleCandidates = fighters[`candidatesForPlayer${playerId}`]
        _setFighter.call(this, playerId, gameRoleCandidates.currentChoice)

        fighters[`attender${playerId}HasConfirmed`] = true

        this.onOneFighterConfirmed()
    }

    function _setFighter(playerId, fighterCandidate) {
        const { GameRole } = classes

        const game = this
        const arrayIndex = playerId - 1
        game.fighters.bothAttenders[arrayIndex] = new GameRole(game, playerId, fighterCandidate)
    }

    function onOneFighterConfirmed() {
        const {
            attender1HasConfirmed,
            attender2HasConfirmed,
        } = this.fighters

        if (attender1HasConfirmed && attender2HasConfirmed) {
            this.start()
        }
    }


    async function showStartingCountDown() {
        async function countDown(countDownSeconds) {
            return new Promise((resolve, reject) => {
                console.log(countDownSeconds)
                setTimeout(() => {
                    resolve()
                }, 1000)
            })
        }

        await countDown(3)
        await countDown(2)
        await countDown(1)
    }

    async function start() {
        const {
            el: {
                rolePickingScreenElement,
                gameRunningScreenElement,
            },
        } = this

        rolePickingScreenElement.style.display = 'none'
        gameRunningScreenElement.style.display = ''

        await showStartingCountDown()
        this.startNewRound()
    }

    function end() {
        this.status.isOver = true
        console.log('游戏结束。')
    }

    function startNewRound() {
        const { GameRound } = app.classes

        const game = this
        const {
            gameRounds,
        } = game

        
        const gameRoundIndex = gameRounds.history.length + 1
        const newGameRound = new GameRound(game, gameRoundIndex)
        gameRounds.current = newGameRound

        game.el.gameRoundsContainerElement.appendChild(newGameRound.el.root)

        game.status.isRunningOneRound = true
        newGameRound.start()
    }

    function endCurrentRound() {
        const game = this
        const { status, gameRounds, fighters } = game
        
        status.isRunningOneRound = false
        
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
        }
    }
})();
