window.duanduanGameChaoJiYongShi.classes.Game = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes } = app
    const {
        buildOneSplashLineForConsoleLog,
        formattedDateStringOf,
        formattedTimeDurationStringOf,
        createDOMWithClassNames,
    } = utils

    return function Game(gameRootContainer, initOptions) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 Game 构造函数。')
        }

        const gameCreationTime = new Date()
        const gameCreationTimeString = formattedDateStringOf(gameCreationTime)
        const gameCreationTimeValue = gameCreationTime.getTime()
        _logGameFirstReport(gameCreationTimeString)

        const {
            gameGlobalSettings,
            allGameRoleRawConfigurations,
            allGameFightingStageRawConfigurations,

            onGameEnd,
            justBeforeGameDestroying,
            afterGameDestroyed,
        } = initOptions

        this.subComponents = {
            uiScreens: {},
            parts: {},
        }

        this.services = { modals: {} }

        this.globalSettings = gameGlobalSettings
        this.settings = gameGlobalSettings.perGameSettings

        this.data = {
            allGameRoleRawConfigurations,
            allGameFightingStageRawConfigurations,

            allGameFighterCandidatesForBothPlayers: [],
            allGameFightingStageConfigurations: [],
            pickedFighterRoleConfigurations: {
                both: [],
                finalWinnerRoleConfig: null,
                finalLoserRoleConfig: null,
                finalWinnerPlayerId: NaN,
            },
            gameRounds: {
                minWinningRoundsPerPlayer: NaN,
                maxRoundsToRun: this.settings.maxRoundsToRun,
                history: [],
                current: null,
            },
        }

        this.el = {
            gameRootContainer,
        }



        const promiseOf = {}
        const resolvePromiseOf = {}

        ;[
            'game intro modal closed',
            'game settings decided',
        ].forEach(promiseName => {
            promiseOf[promiseName] = new Promise((resolve) => {
                resolvePromiseOf[promiseName] = resolve
            })
        })



        this.status = {
            gameCreationTimeString,
            gameCreationTimeValue,
            gameCreationTime,

            isOver: false,

            promiseOf,
            resolvePromiseOf,
        }

        this.listenersOfMyEvents = {
            onGameEnd,
            justBeforeGameDestroying,
            afterGameDestroyed,
        }


        this.start           = start          .bind(this)
        this.startGameRounds = startGameRounds.bind(this)
        this.end             = end            .bind(this)
        this.destroy         = destroy        .bind(this)

        _init.call(this, initOptions)

        console.log('\n\n【游戏】创建完毕。\n\n\n')
        // console.log('\n', this, '\n\n')
    }

    async function _init(initOptions) {
        _createKeyboardEngine         .call(this)
        _createGameIntro              .call(this)
        _createGamePreferencesPanel   .call(this)
        _createOverlayModalForGameOver.call(this)
        _createCountDownOverlay       .call(this)
        _createFightersPickingScreen  .call(this)
        _createRunningScreen          .call(this)
        _createMoreDOMs               .call(this)

        this.subComponents.uiScreens.gameRunningScreen.hide()
    }



    function _createKeyboardEngine() {
        const { KeyboardEngine } = classes
        this.services.keyboardEngine = new KeyboardEngine()
    }

    function _createGameIntro() {
        const { OverlayModal } = classes
        this.services.modals.overlayModalOfGameIntro = new OverlayModal({
            ...this.globalSettings.gameIntro,
            modalSize: 'huge',
            cssClassNames: [ 'game-intro' ],
        })
    }

    function _createGamePreferencesPanel() {
        const { GamePreferencesPanel, OverlayModal } = classes
        const gamePreferencesPanel = new GamePreferencesPanel(this.settings)
        this.subComponents.parts.gamePreferencesPanel = gamePreferencesPanel
        this.services.modals.overlayModalOfGamePreferencesPanel = new OverlayModal({
            modalSize: 'huge',
            titleHTML: '游戏配置项',
            contentComponent: gamePreferencesPanel,
            cssClassNames: [ 'game-preferences-panel' ],
        })
    }

    function _createOverlayModalForGameOver() {
        const { OverlayModal } = classes
        this.services.modals.overlayModalOfGameOverAnnouncement = new OverlayModal({
            titleHTML: '游戏结束',
            cssClassNames: [ 'game-over-announcement' ],
        })
    }

    function _createCountDownOverlay() {
        const { CountDownOverlay } = classes
        this.services.countDownOverlay = new CountDownOverlay()
    }

    function _createFightersPickingScreen() {
        const { GameFightersPickingScreen } = classes
        const fightersPickingScreen = new GameFightersPickingScreen(this, {

        })

        // this.data.pickedFighterRoleConfigurations.both = fightersPickingScreen.data.pickedFighterRoleConfigurations
        this.subComponents.uiScreens.fightersPickingScreen = fightersPickingScreen
    }

    function _createRunningScreen(initOptions) {
        const { GameRunningScreen } = classes
        const gameRunningScreen = new GameRunningScreen(this, initOptions)

        this.subComponents.uiScreens.gameRunningScreen = gameRunningScreen
        this.subComponents.parts.gameRoundsRunner = gameRunningScreen.provideGameRoundsRunner()
    }

    function _createMoreDOMs() {
        const {
            fightersPickingScreen,
            gameRunningScreen,
        } = this.subComponents.uiScreens

        const {
            countDownOverlay,
            modals: {
                overlayModalOfGameIntro,
                overlayModalOfGamePreferencesPanel,
                overlayModalOfGameOverAnnouncement,
            },
        } = this.services

        const rootElement = createDOMWithClassNames('div', [
            'game',
        ])

        rootElement.dataset.creationTime = this.status.gameCreationTimeString

        rootElement.appendChild(fightersPickingScreen             .el.root)
        rootElement.appendChild(gameRunningScreen                 .el.root)
        rootElement.appendChild(countDownOverlay                  .el.root)
        rootElement.appendChild(overlayModalOfGameIntro           .el.root)
        rootElement.appendChild(overlayModalOfGamePreferencesPanel.el.root)
        rootElement.appendChild(overlayModalOfGameOverAnnouncement.el.root)

        this.el.gameRootContainer.appendChild(rootElement)

        this.el.root = rootElement
    }





    function _prepareGameAfterSettingsDecided() {
        console.log('正在准备游戏通用数据（候选角色、候选游戏对战舞台数据等）。')
        _prepareAllGameRoleCandidatesForBothPlayers.call(this)
        _prepareAllGameFightingStageCandidates     .call(this)
        this.subComponents.uiScreens.fightersPickingScreen.createFighterPickersForBothPlayers()
    }

    function _prepareAllGameRoleCandidatesForBothPlayers() {
        const { settings, data } = this
        const { enableFairMode } = settings

        const {
            allGameRoleRawConfigurations,
        } = data

        const {
            allGameRoleConfigurationTransformFunction,
        } = utils

        const {
            common: roleCommonConfiguration,
        } = allGameRoleRawConfigurations

        const allGameRoleConfigurations = allGameRoleRawConfigurations.items.map(rawConfig => {
            return allGameRoleConfigurationTransformFunction(rawConfig, roleCommonConfiguration)
        })

        if (enableFairMode) {
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

            allGameRoleConfigurations.forEach(roleConfig => {
                roleConfig.fullHealthPoint = randomNumberAround(fairHealthPointBase,  0.3) * 1000
                roleConfig.attackingPower  = randomNumberAround(fairAttackPointBase,  0.4) * 1000
                roleConfig.defencingPower  = randomNumberAround(fairDefencePointBase, 0.4) * 1000
            })
        }

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

            roleConfig.healthPointRatio    = + Math.max(0.01, (fullHealthPoint / maxHP).toFixed(4))
            roleConfig.attackingPowerRatio = + Math.max(0.01, (attackingPower  / maxAP).toFixed(4))
            roleConfig.defencingPowerRatio = + Math.max(0.01, (defencingPower  / maxDP).toFixed(4))
        })

        data.allGameRoleConfigurations = allGameRoleConfigurations

        data.allGameFighterCandidatesForBothPlayers = [
            _prepareAllGameRoleCandidatesForPlayer.call(this, 1, allGameRoleConfigurations),
            _prepareAllGameRoleCandidatesForPlayer.call(this, 2, allGameRoleConfigurations),
        ]
    }

    function _prepareAllGameRoleCandidatesForPlayer(playerId, allGameRoleConfigurations) {
        const { GameRoleCandidate } = classes

        // console.log('\n准备为玩家', playerId, '创建所有【角色候选人】……')

        const gameRoleCandidates = allGameRoleConfigurations.map(roleConfig => {
            return new GameRoleCandidate(playerId, roleConfig)
        })

        console.log('为玩家', playerId, '创建【角色候选人】完毕。')

        return gameRoleCandidates
    }

    function _prepareAllGameFightingStageCandidates() {
        const { data } = this

        const {
            allGameFightingStageRawConfigurations,
        } = data

        const {
            allGameFightingStageConfigurationTransformFunction,
        } = utils

        const {
            common: stageCommonConfigurations,
        } = allGameFightingStageRawConfigurations

        const allGameFightingStageConfigurations = allGameFightingStageRawConfigurations.items.map(rawConfig => {
            return allGameFightingStageConfigurationTransformFunction(rawConfig, stageCommonConfigurations)
        })

        data.allGameFightingStageConfigurations = allGameFightingStageConfigurations

        console.log('所有候选【对战舞台数据】就绪。')
    }

    async function start() {
        const { promiseOf, resolvePromiseOf } = this.status

        const {
            keyboardEngine,
            modals: {
                overlayModalOfGameIntro,
                overlayModalOfGamePreferencesPanel,
            },
        } = this.services


        overlayModalOfGameIntro.showUp()
        keyboardEngine.start({
            keyUp: {
                '*': () => {
                    overlayModalOfGameIntro.leaveAndHide()
                    resolvePromiseOf['game intro modal closed']()
                },
            },
        }, '游戏说明对话框')



        await promiseOf['game intro modal closed']
        keyboardEngine.stop()



        const {
            gamePreferencesPanel,
        } = this.subComponents.parts
        overlayModalOfGamePreferencesPanel.showUp(null, () => {
            gamePreferencesPanel.allControlInstances[0].el.input.focus()
        })
        keyboardEngine.start({
            keyUp: {
                'ESCAPE': () => {
                    overlayModalOfGamePreferencesPanel.leaveAndHide()
                    resolvePromiseOf['game settings decided']()
                },
            },
        }, '游戏配置项对话框')



        await promiseOf['game settings decided']
        keyboardEngine.stop()



        _prepareGameAfterSettingsDecided.call(this)



        this.subComponents.uiScreens.fightersPickingScreen.showUp()
    }

    async function startGameRounds() {
        const {
            uiScreens: {
                fightersPickingScreen,
                gameRunningScreen,
            },
            parts: {
                gameRoundsRunner,
            },
        } = this.subComponents

        fightersPickingScreen.leaveAndHide()
        gameRunningScreen.showUp()
        gameRoundsRunner.createAndStartNewRound()
    }

    async function end() {
        this.status.isOver = true

        const {
            finalWinnerRoleConfig,
            finalWinnerPlayerId,
            winnerWonRoundsCount,
            winnerLostRoundsCount,
        } = this.data.pickedFighterRoleConfigurations

        // console.log(finalWinnerRoleConfig, finalWinnerPlayerId)

        const isDrawGame = isNaN(finalWinnerPlayerId)

        let resultDescHTML

        if (isDrawGame) {

            console.log('游戏结束。平局。')
            resultDescHTML = '<p>平局<p>'

        } else {

            const winnerDesc = `玩家 ${finalWinnerPlayerId} 的【${finalWinnerRoleConfig.name}】`
            console.log(`游戏结束。胜利者：${winnerDesc}。`, '其胜', winnerWonRoundsCount, '局；', '负', winnerLostRoundsCount, '局。')

            resultDescHTML = [
                '<p>',
                '<span class="label">胜利者：</span>',
                '<span class="detail">',
                winnerDesc,
                '</span>',
                '</p>',
                '<p>',
                `其胜 ${winnerWonRoundsCount} 局；负 ${winnerLostRoundsCount} 局。`,
                '</p>',
            ].join('')
        }


        const {
            onGameEnd,
            justBeforeGameDestroying,
            afterGameDestroyed,
        } = this.listenersOfMyEvents

        if (typeof onGameEnd === 'function') {
            await onGameEnd(this)
        }


        if (typeof justBeforeGameDestroying === 'function') {
            await justBeforeGameDestroying(this)
        }


        const theLastModal = this.services.modals.overlayModalOfGameOverAnnouncement

        setTimeout(() => {
            this.services.keyboardEngine.start({
                keyDown: {
                    '*': theLastModal.leaveAndHide,
                },
            })
        }, 800)

        await theLastModal.showUp({
            contentHTML: resultDescHTML,
            countDown: {
                seconds: 30,
                tipHTML: '<span>即将游戏退出<span>',
            },
        })

        this.services.keyboardEngine.destroy()

        _logGameLastReport.call(this)

        this.destroy()

        if (typeof afterGameDestroyed === 'function') {
            afterGameDestroyed()
        }
    }

    function destroy() {
        this.el.gameRootContainer.removeChild(this.el.root)
    }

    function _logGameFirstReport(gameCreationTime) {
        const splashWidth = 32
        console.log([
            '\n'.repeat(3),
            '*'.repeat(splashWidth),
            buildOneSplashLineForConsoleLog(splashWidth),
            buildOneSplashLineForConsoleLog(splashWidth, '游戏现在启动', 11),
            buildOneSplashLineForConsoleLog(splashWidth),
            buildOneSplashLineForConsoleLog(splashWidth, gameCreationTime),
            buildOneSplashLineForConsoleLog(splashWidth),
            '*'.repeat(splashWidth),
            '\n'.repeat(4),
        ].join('\n'))
    }

    function _logGameLastReport() {
        const gameDestroyTime = Date.now()

        const spentMilliseconds = gameDestroyTime - this.status.gameCreationTimeValue
        const {
            string: spentTimeString,
            visualLength: spentTimeStringViusalWidth,
        } = formattedTimeDurationStringOf(spentMilliseconds)

        const splashWidth = 32

        console.log([
            '\n'.repeat(5),
            '*'.repeat(splashWidth),
            buildOneSplashLineForConsoleLog(splashWidth),
            buildOneSplashLineForConsoleLog(splashWidth, '游戏结束！', 9),
            buildOneSplashLineForConsoleLog(splashWidth),
            buildOneSplashLineForConsoleLog(splashWidth, `全程用时：${spentTimeString}`, spentTimeStringViusalWidth + 9),
            buildOneSplashLineForConsoleLog(splashWidth),
            '*'.repeat(splashWidth),
            '\n'.repeat(6),
        ].join('\n'))
    }
})();
