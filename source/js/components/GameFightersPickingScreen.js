window.duanduanGameChaoJiYongShi.classes.GameFightersPickingScreen = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes } = app
    
    const { createDOMWithClassNames } = utils

    return function GameFightersPickingScreen(game, initOptions) {
        const { Game } = classes

        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameFightersPickingScreen 构造函数。')
        }

        if (!(game instanceof Game)) {
            throw new TypeError('创建【游戏斗士选择界面】时，必须指明其应隶属于哪个【游戏】。')
        }

        if (game.status.isOver) {
            throw new Error('【游戏】已经结束。不能为已经结束的【游戏】创建【游戏斗士选择界面】。')
        }

        const {
            shouldAutoPickFightersByWeights,
            shouldForceRollingEvenIfAutoPickingByWeights,
            shouldManuallyPickFighters,
        } = initOptions

        this.game = game
        this.subComponents = {}
        this.data = {}
        this.status = {
            shouldAutoPickFightersByWeights: !!shouldAutoPickFightersByWeights,
            shouldForceRollingEvenIfAutoPickingByWeights: !!shouldForceRollingEvenIfAutoPickingByWeights,
            shouldManuallyPickFighters: !!shouldManuallyPickFighters,
            fighter1HasDecided: false,
            fighter2HasDecided: false,
        }


        this.createFighterPickersForBothPlayers = createFighterPickersForBothPlayers.bind(this)
        this.startPickingFightersForBothPlayers = startPickingFightersForBothPlayers.bind(this)
        this.onEitherFighterDecided             = onEitherFighterDecided            .bind(this)
        this.showUp                             = showUp                            .bind(this)
        this.hide                               = hide                              .bind(this)
        this.leaveAndHide                       = leaveAndHide                      .bind(this)


        _init.call(this)

        console.log('【游戏角色选择界面】创建完毕。')
    }



    function _init() {
        _createMoreDOMs                    .call(this)

        this.el.root.style = 'none'
    }

    function createFighterPickersForBothPlayers() {
        const { GameFighterPicker } = classes
        const { game } = this
        const {
            player1: player1KeyboardShortcuts,
            player2: player2KeyboardShortcuts,
        } = game.settings.keyboardShortcuts.gameFightersPicking

        const [
            candidatesForPlayer1,
            candidatesForPlayer2,
        ] = this.game.data.allGameFighterCandidatesForBothPlayers

        const {
            shouldAutoPickFightersByWeights,
            shouldForceRollingEvenIfAutoPickingByWeights,
            shouldManuallyPickFighters,
        } = this.status
        
        const fighterPickers = [
            new GameFighterPicker(1, {
                gameRoleCandidates: candidatesForPlayer1,
                keyForAcceptingFighter:     player1KeyboardShortcuts.acceptCandidate,
                keyForPickingPrevCandidate: player1KeyboardShortcuts.prevCandidate,
                keyForPickingNextCandidate: player1KeyboardShortcuts.nextCandidate,
                // shouldNotAutoRoll: false,
                shouldAutoPickFighterByWeights: shouldAutoPickFightersByWeights,
                shouldForceRollingEvenIfAutoPickingByWeights,
                shouldManuallyPickFighters,
                onFighterDecided: this.onEitherFighterDecided,
            }),

            new GameFighterPicker(2, {
                gameRoleCandidates: candidatesForPlayer2,
                keyForAcceptingFighter:     player2KeyboardShortcuts.acceptCandidate,
                keyForPickingPrevCandidate: player2KeyboardShortcuts.prevCandidate,
                keyForPickingNextCandidate: player2KeyboardShortcuts.nextCandidate,
                // shouldNotAutoRoll: false,
                shouldAutoPickFighterByWeights: shouldAutoPickFightersByWeights,
                shouldForceRollingEvenIfAutoPickingByWeights,
                shouldManuallyPickFighters,
                onFighterDecided: this.onEitherFighterDecided,
            }),
        ]

        const rootElement = this.el.root
        fighterPickers.forEach(fp => {
            rootElement.appendChild(fp.el.root)
        })

        this.subComponents.fighterPickers = fighterPickers
    }

    function _createMoreDOMs() {
        const rolePickingScreenElement = createDOMWithClassNames('div', [
            'ui-screen',
            'role-picking-screen',
        ])

        this.el = {
            root: rolePickingScreenElement,
        }
    }

    function startPickingFightersForBothPlayers() {
        const {
            fighterPickers,
        } = this.subComponents

        const keyboardEngineConfigForBothPlayers = fighterPickers.reduce((kec, fp) => {
            const {
                keyDown,
                keyUp,
            } = kec

            kec = {
                keyDown: {
                    ...keyDown,
                    ...fp.data.keyboardEngineKeyDownConfig,
                },
                keyUp: {
                    ...keyUp,
                    ...fp.data.keyboardEngineKeyUpConfig,
                }
            }

            return kec
        }, {
            keyDown: {},
            keyUp: {},
        })
        
        // console.log(keyboardEngineConfigForBothPlayers)
        
        fighterPickers.forEach(fighterPicker => fighterPicker.startPickingFighter())
        this.game.services.keyboardEngine.start(keyboardEngineConfigForBothPlayers, '角色选择界面')
    }

    function onEitherFighterDecided(playerId, decidedFighterRoleConfig) {
        const pickedFighterRoleConfigs = this.game.data.pickedFighterRoleConfigurations.both
        const arrayIndex = playerId - 1
        pickedFighterRoleConfigs[arrayIndex] = decidedFighterRoleConfig

        const { status } = this
        status[`fighter${playerId}HasDecided`] = true

        if (status.fighter1HasDecided && status.fighter2HasDecided) {
            this.game.services.keyboardEngine.stop()
            this.game.startGameRounds()
        }
    }

    function showUp() {
        this.el.root.style.display = ''
        setTimeout(() => {
            this.startPickingFightersForBothPlayers()
        }, 800)
    }

    function hide() {
        window.onkeydown = null
        this.el.root.style.display = 'none'
    }

    function leaveAndHide() {
        window.onkeydown = null
        const rootElement = this.el.root

        rootElement.classList.add('leaving')
        rootElement.onanimationend = function () {
            rootElement.style.display = 'none'
            rootElement.classList.remove('leaving')
            rootElement.onanimationend = null
        }
    }
})();
