window.duanduanGameChaoJiYongShi.classes.Game = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { classes, data: appData } = app

    return function Game(rootElement, initOptions) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 Game 构造函数。')
        }

        const {
            allGameFighterCandidatesForBothPlayers,
            allGameFightingStageConfigurations,
            // maxRoundsToRun,
            // shouldAutoPickFightersByWeights,
        } = initOptions

        this.subComponents = {
            uiScreens: {},
            parts: {},
        }

        this.services = { modals: {} }

        this.data = {
            allGameFighterCandidatesForBothPlayers,
            allGameFightingStageConfigurations,
            pickedFighterRoleConfigurations: {
                both: [],
                finalWinnerRoleConfig: null,
                finalLoserRoleConfig: null,
                finalWinnerPlayerId: NaN,
            },
            gameRounds: {
                minWinningRoundsPerPlayer: NaN,
                maxRoundsToRun: NaN,
                history: [],
                current: null,
            },
        }

        this.el = {
            root: rootElement,
        }

        this.status = {
            isOver: false,
        }


        this.prepare = prepare.bind(this)
        this.start   = start  .bind(this)
        this.end     = end    .bind(this)

        _init.call(this, initOptions)

        console.log('【游戏】创建完毕。\n\n', this, '\n\n')
    }

    function _init(initOptions) {
        _createKeyboardEngine         .call(this)
        _createGameIntro              .call(this)
        _createOverlayModalForGameOver.call(this)
        _createCountDownOverlay       .call(this)
        _createFightersPickingScreen  .call(this, initOptions)
        _createRunningScreen          .call(this, initOptions)
        _queryAndSetupMoreDOMs        .call(this)
    }

    function _createKeyboardEngine() {
        const { KeyboardEngine } = classes
        this.services.keyboardEngine = new KeyboardEngine()
    }

    function _createGameIntro() {
        const { OverlayModal } = classes
        this.services.modals.overlayModalOfGameIntro = new OverlayModal({
            ...appData.gameGlobalSettings.gameIntro,
            modalSize: 'huge',
            cssClassNames: [ 'game-intro' ],
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

    function _createFightersPickingScreen(initOptions) {
        const { GameFightersPickingScreen } = classes
        const fightersPickingScreen = new GameFightersPickingScreen(this, initOptions)

        // this.data.pickedFighterRoleConfigurations.both = fightersPickingScreen.data.pickedFighterRoleConfigurations
        this.subComponents.uiScreens.fightersPickingScreen = fightersPickingScreen
    }

    function _createRunningScreen(initOptions) {
        const { GameRunningScreen } = classes
        const gameRunningScreen = new GameRunningScreen(this, initOptions)

        this.subComponents.uiScreens.gameRunningScreen = gameRunningScreen
        this.subComponents.parts.gameRoundsRunner = gameRunningScreen.provideGameRoundsRunner()
    }

    function _queryAndSetupMoreDOMs() {
        const {
            fightersPickingScreen,
            gameRunningScreen,
        } = this.subComponents.uiScreens

        const {
            countDownOverlay,
            modals: {
                overlayModalOfGameIntro,
                overlayModalOfGameOverAnnouncement,
            },
        } = this.services

        const rootElement = this.el.root
        rootElement.appendChild(fightersPickingScreen             .el.root)
        rootElement.appendChild(gameRunningScreen                 .el.root)
        rootElement.appendChild(countDownOverlay                  .el.root)
        rootElement.appendChild(overlayModalOfGameIntro           .el.root)
        rootElement.appendChild(overlayModalOfGameOverAnnouncement.el.root)
    }


    function prepare() {
        const {
            uiScreens: {
                fightersPickingScreen,
                gameRunningScreen,
            },
        } = this.subComponents

        gameRunningScreen.hide()

        const {
            keyboardEngine,
            modals: { overlayModalOfGameIntro },
        } = this.services

        const closeGameIntroAndStartGame = () => {
            overlayModalOfGameIntro.leaveAndHide()
            keyboardEngine.stop()
            fightersPickingScreen.showUp()
        }

        overlayModalOfGameIntro.showUp()
        keyboardEngine.start({
            keyUp: {
                'ENTER':  closeGameIntroAndStartGame,
                ' ':      closeGameIntroAndStartGame,
                'ESCAPE': closeGameIntroAndStartGame,
            },
        })

    }

    function start() {
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

    function end() {
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

        this.services.modals.overlayModalOfGameOverAnnouncement.showUp({
            contentHTML: resultDescHTML,
        })
    }
})();
