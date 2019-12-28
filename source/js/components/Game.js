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

        this.status = {
            isRunningOneRound: false,
            isOver: false,
        }


        this.prepare                   = prepare                  .bind(this)
        this.confirmFighterForPlayer   = confirmFighterForPlayer  .bind(this)
        this.onOneFighterConfirmed     = onOneFighterConfirmed    .bind(this)

        this.start                     = start                    .bind(this)
        this.end                       = end                      .bind(this)

        this.createAndStartNewRound    = createAndStartNewRound   .bind(this)
        this.endCurrentRound           = endCurrentRound          .bind(this)

        _init(this)

        console.log('【游戏】创建完毕。')
    }

    function _init(game) {
        _createCountDownOverlay(game)
        _queryAndSetupMoreDOMs(game)
    }

    function _createCountDownOverlay(game) {
        const { CountDownOverlay } = classes
        const countDownOverlay = new CountDownOverlay()
        game.countDownOverlay = countDownOverlay
    }

    function _queryAndSetupMoreDOMs(game) {
        const { fighters, countDownOverlay } = game
        const {
            candidatesForPlayer1: gameRoleCandidatesForPlayer1,
            candidatesForPlayer2: gameRoleCandidatesForPlayer2,
        } = fighters

        const rolePickingScreenElement = document.querySelector('#role-picking-screen')
        const gameRunningScreenElement = document.querySelector('#game-running-screen')

        const roleCandidatesSlot1Element = document.querySelector('.role-candidates-slot.player-1')
        const roleCandidatesSlot2Element = document.querySelector('.role-candidates-slot.player-2')
        const gameRoundsContainerElement = gameRunningScreenElement.querySelector('.game-rounds')

        gameRunningScreenElement.appendChild(countDownOverlay.el.root)


        insertGameRoleCandidatesToDocument(
            gameRoleCandidatesForPlayer1.allCandidates,
            roleCandidatesSlot1Element
        )

        insertGameRoleCandidatesToDocument(
            gameRoleCandidatesForPlayer2.allCandidates,
            roleCandidatesSlot2Element
        )

        game.el = {
            rolePickingScreen: rolePickingScreenElement,
            gameRunningScreen: gameRunningScreenElement,
            gameRoundsContainer: gameRoundsContainerElement,
        }



        function insertGameRoleCandidatesToDocument(roleCandidates, containerElement) {
            roleCandidates.forEach((grc, i) => {
                const roleCandidateRootElement = grc.el.root
                containerElement.appendChild(roleCandidateRootElement)
                roleCandidateRootElement.style.top = 0;
            })
        }
    }


    function prepare() {
        _beginChoosingFighters.call(this)
    }

    async function _beginChoosingFighters() {
        const {
            el: {
                rolePickingScreen,
                gameRunningScreen,
            },
        } = this

        rolePickingScreen.style.display = ''
        gameRunningScreen.style.display = 'none'



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


    async function createAndStartNewRound() {
        _createNewRoundAndShowItUp.call(this)
        await this.countDownOverlay.countDown(3)
        _startCurrentRound.call(this)
    }

    function start() {
        const {
            el: {
                rolePickingScreen,
                gameRunningScreen,
            },
        } = this

        rolePickingScreen.style.display = 'none'
        gameRunningScreen.style.display = ''

        this.createAndStartNewRound()
    }

    function end() {
        this.status.isOver = true
        console.log('游戏结束。')
    }

    function _createNewRoundAndShowItUp() {
        const { GameRound } = app.classes

        const game = this
        const {
            gameRounds,
            gameRounds: {
                history: historicalGameRounds,
            },
        } = game

        const historicalGameRoundsCount = historicalGameRounds.length

        const lastRunGameRound = historicalGameRounds[historicalGameRoundsCount - 1]

        const displayingIndexOfNewGameRound = historicalGameRoundsCount + 1
        const newGameRound = new GameRound(game, displayingIndexOfNewGameRound)
        gameRounds.current = newGameRound

        game.el.gameRoundsContainer.appendChild(newGameRound.el.root)


        if (lastRunGameRound instanceof GameRound) {
            lastRunGameRound.leaveAndHide()
        }

        newGameRound.showUp()
    }

    function _startCurrentRound() {
        const game = this
        const { status, gameRounds } = game

        status.isRunningOneRound = true
        gameRounds.current.start()
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
        } else {
            this.createAndStartNewRound()
        }
    }
})();
