window.duanduanGameChaoJiYongShi.classes.Game = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes } = app
    const {
        buildOneSplashLineForConsoleLog,
        formattedDateStringOf,
        formattedTimeDurationStringOf,
        createDOMWithClassNames,
        createPromisesAndStoreIn,
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
                history: [],
                current: null,
            },
        }

        this.el = {
            gameRootContainer,
        }

        this.status = {
            gameCreationTimeString,
            gameCreationTimeValue,
            gameCreationTime,

            isOver: false,
        }

        createPromisesAndStoreIn(this.status, [
            'game intro modal closed',
            'game settings decided',
        ])

        this.listenersOfMyEvents = {
            onGameEnd,
            justBeforeGameDestroying,
            afterGameDestroyed,
        }


        this.start   = start  .bind(this)
        this.end     = end    .bind(this)
        this.destroy = destroy.bind(this)

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

        const {
            fightersPickingScreen,
            gameRunningScreen,
        } = this.subComponents.uiScreens

        fightersPickingScreen.hide()
        gameRunningScreen.hide()
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
        this.subComponents.uiScreens.fightersPickingScreen = new GameFightersPickingScreen(this)
    }

    function _createRunningScreen(initOptions) {
        const { GameRunningScreen } = classes
        this.subComponents.uiScreens.gameRunningScreen = new GameRunningScreen(this, initOptions)
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





    function _closeModalOfGameIntro() {
        this.services.keyboardEngine.stop()
        this.services.modals.overlayModalOfGameIntro.leaveAndHide()
        this.status.resolvePromiseOf['game intro modal closed']()
    }
    
    function _closeModalOfGamePreferencesPanel() {
        this.services.keyboardEngine.stop()
        this.services.modals.overlayModalOfGamePreferencesPanel.leaveAndHide()
        this.status.resolvePromiseOf['game settings decided']()
    }

    function _prepareAllGameFightingStageCandidates() {
        console.log('正在准备游戏对战候选舞台。')

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
                '*': () => _closeModalOfGameIntro.call(this),
            },
        }, '游戏说明对话框')



        await promiseOf['game intro modal closed']



        overlayModalOfGamePreferencesPanel.showUp(null, () => {
            this.subComponents.parts.gamePreferencesPanel.allControlInstances[0].el.input.focus()
        })
        keyboardEngine.start({
            keyUp: {
                'ESCAPE': () => _closeModalOfGamePreferencesPanel.call(this),
            },
        }, '游戏配置项对话框')



        await promiseOf['game settings decided']



        _prepareAllGameFightingStageCandidates.call(this)



        const {
            fightersPickingScreen,
            gameRunningScreen,
        } = this.subComponents.uiScreens



        const { allGameRoleRawConfigurations } = this.data
        fightersPickingScreen.createFighterPickers(allGameRoleRawConfigurations)
        await fightersPickingScreen.showUpAndStartPickingFighters()



        gameRunningScreen.showUpAndStartGameRounds()
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

        this.destroy()

        const gameDestroyTime = Date.now()

        const spentMilliseconds = gameDestroyTime - this.status.gameCreationTimeValue
        const spentTimeInfoObject = formattedTimeDurationStringOf(spentMilliseconds)
        
        _logGameLastReport.call(this, spentTimeInfoObject)

        if (typeof afterGameDestroyed === 'function') {
            afterGameDestroyed(spentTimeInfoObject)
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

    function _logGameLastReport(spentTimeInfoObject) {
        const {
            string1:             spentTimeString,
            string1VisualLength: spentTimeStringViusalWidth,
        } = spentTimeInfoObject

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
