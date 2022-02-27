window.duanduanGameChaoJiYongShi.classes.GameFightersPickingScreen = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes } = app

    const {
        createDOMWithClassNames,
        createPromisesAndStoreIn,
    } = utils

    return function GameFightersPickingScreen(game) {
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

        this.game = game
        this.subComponents = {}
        this.data = {}
        this.status = {}

        this.createFighterPickers          = createFighterPickers         .bind(this)
        this.showUpAndStartPickingFighters = showUpAndStartPickingFighters.bind(this)
        this.showUp                        = showUp                       .bind(this)
        this.hide                          = hide                         .bind(this)
        this.leaveAndHide                  = leaveAndHide                 .bind(this)


        _init.call(this)

        console.log('【游戏角色选择界面】创建完毕。')
    }



    function _init() {
        _createMoreDOMs.call(this)
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





    function createFighterPickers(allGameRoleRawConfigurations) {
        console.log('正在准备游戏候选角色。')
        _prepareRoleCandidateConfigurations       .call(this, allGameRoleRawConfigurations)
        _createAllGameRoleCandidatesForBothPlayers.call(this)
        _createFighterPickersForBothPlayers       .call(this)
    }

    function _prepareRoleCandidateConfigurations(allGameRoleRawConfigurations) {
        console.log('正在准备游戏候选角色的基础数据。')

        const { game, data } = this

        const { enableFairMode } = game.settings

        const {
            allGameRoleConfigurationTransformFunction,
        } = utils

        const {
            common: roleCommonConfiguration,
        } = allGameRoleRawConfigurations

        const allGameRoleConfigurations = allGameRoleRawConfigurations.items.map(rawConfig => {
            return allGameRoleConfigurationTransformFunction(rawConfig, roleCommonConfiguration)
        })

        data.allGameRoleConfigurations = allGameRoleConfigurations

        if (enableFairMode) {
            _overwriteRoleConfigurationsDataWithFairData.call(this)
        }

        _calculateValueRatiosForRoleCandidateConfigurations.call(this)
    }

    function _overwriteRoleConfigurationsDataWithFairData() {
        console.log('由于“公平模式”已开启，现在调整游戏候选角色的基础数据。')

        const fairHealthPointBase  = 24
        const fairAttackPointBase  = 15
        const fairDefencePointBase = 10

        const randomNumberAround = function (base, span) {
            const halfSapn = span / 2
            const min = 1 - halfSapn
            const int = Math.ceil((Math.random() * span + min) * base)
            const fra = Math.random() > 0.5 ? 0.5 : 0
            return int + fra
        }

        this.data.allGameRoleConfigurations.forEach(roleConfig => {
            roleConfig.fullHealthPoint = randomNumberAround(fairHealthPointBase,  0.3) * 1000
            roleConfig.attackingPower  = randomNumberAround(fairAttackPointBase,  0.4) * 1000
            roleConfig.defencingPower  = randomNumberAround(fairDefencePointBase, 0.4) * 1000
        })
    }

    function _calculateValueRatiosForRoleCandidateConfigurations() {
        console.log('正在为游戏候选角色的基础数据添加统计信息（目前仅添加各值相对于最大值的比例值）。')

        const { allGameRoleConfigurations } = this.data

        let maxHP = 0 // health
        let maxAP = 0 // attack
        let maxDP = 0 // defence

        allGameRoleConfigurations.forEach(roleConfig => {
            const {
                fullHealthPoint,
                attackingPower,
                defencingPower,
            } = roleConfig

            maxHP = Math.max(maxHP, fullHealthPoint)
            maxAP = Math.max(maxAP, attackingPower)
            maxDP = Math.max(maxDP, defencingPower)
        })

        allGameRoleConfigurations.forEach(roleConfig => {
            const {
                fullHealthPoint,
                attackingPower,
                defencingPower,
            } = roleConfig

            roleConfig.healthPointRatio    = Math.max(0.001, + (fullHealthPoint / maxHP).toFixed(4))
            roleConfig.attackingPowerRatio = Math.max(0.001, + (attackingPower  / maxAP).toFixed(4))
            roleConfig.defencingPowerRatio = Math.max(0.001, + (defencingPower  / maxDP).toFixed(4))
        })
    }

    function _createAllGameRoleCandidatesForBothPlayers() {
        const { data } = this
        const { allGameRoleConfigurations } = data

        data.allGameFighterCandidatesForBothPlayers = [
            _prepareAllGameRoleCandidatesForSinglePlayer.call(this, 1, allGameRoleConfigurations),
            _prepareAllGameRoleCandidatesForSinglePlayer.call(this, 2, allGameRoleConfigurations),
        ]
    }

    function _prepareAllGameRoleCandidatesForSinglePlayer(playerId, allGameRoleConfigurations) {
        const { GameRoleCandidate } = classes

        // console.log('\n准备为玩家', playerId, '创建所有【角色候选人】……')

        const gameRoleCandidates = allGameRoleConfigurations.map(roleConfig => {
            return new GameRoleCandidate(playerId, roleConfig)
        })

        console.log('为玩家', playerId, '创建【角色候选人】完毕。')

        return gameRoleCandidates
    }

    function _createFighterPickersForBothPlayers() {
        const { game, data } = this

        const {
            shouldManuallyPickFighters,
            shouldAutoPickFightersByWeights,
            shouldForceRollingEvenIfAutoPickingByWeights,
            keyboardShortcuts,
        } = game.settings

        const {
            player1: player1KeyboardShortcuts,
            player2: player2KeyboardShortcuts,
        } = keyboardShortcuts.gameFightersPicking

        const [
            candidatesForPlayer1,
            candidatesForPlayer2,
        ] = data.allGameFighterCandidatesForBothPlayers

        const { GameFighterPicker } = classes

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
            }),
        ]

        const rootElement = this.el.root
        fighterPickers.forEach(fp => rootElement.appendChild(fp.el.root))

        this.subComponents.fighterPickers = fighterPickers
    }





    async function _startPickingFighters() {
        const {
            fighterPickers,
        } = this.subComponents

        const promiseOfBothFighterPickersAreDone = Promise.all(
            fighterPickers.map(fighterPicker => fighterPicker.startPickingFighter())
        )



        const shouldStartKeyboardEngine = fighterPickers.some(
            fighterPicker => fighterPicker.status.requireKeyboardInteraction
        )

        if (shouldStartKeyboardEngine) {
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

            this.game.services.keyboardEngine.start(keyboardEngineConfigForBothPlayers, '角色选择界面')
        }



        this.game.data.pickedFighterRoleConfigurations.both = await promiseOfBothFighterPickersAreDone
        // console.log(this.game.data.pickedFighterRoleConfigurations.both)

    

        if (shouldStartKeyboardEngine) {
            this.game.services.keyboardEngine.stop()
        }
    }

    async function showUpAndStartPickingFighters() {
        this.showUp()
        await _startPickingFighters.call(this)
        this.leaveAndHide()
    }

    function showUp() {
        this.el.root.style.display = ''
    }

    function hide() {
        this.el.root.style.display = 'none'
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
