window.duanduanGameChaoJiYongShi.classes.Game = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { classes } = app

    return function Game(rootElement, initOptions) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 Game 构造函数。')
        }

        const {
            allGameFighterCandidatesForBothPlayers,
            allGameFightingStageConfigurations,
            // maxRoundsToRun,
        } = initOptions

        this.subComponents = {
            uiScreens: {},
            parts: {},
        }

        this.data = {
            allGameFighterCandidatesForBothPlayers,
            allGameFightingStageConfigurations,
            pickedFighterRoleConfigurations: {
                both: null,
                finalWinnerRoleConfig: null,
                finalLoserRoleConfig: null,
                winningPlayerId: NaN,
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


        this.start = start.bind(this)
        this.end   = end  .bind(this)

        _init.call(this, initOptions)

        console.log('【游戏】创建完毕。')
    }

    function _init(initOptions) {
        _createFightersPickingScreen.call(this, initOptions)
        _createRunningScreen.call(this, initOptions)
        console.log(this)
        _queryAndSetupMoreDOMs.call(this)
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

        const rootElement = this.el.root
        rootElement.appendChild(fightersPickingScreen.el.root)
        rootElement.appendChild(gameRunningScreen    .el.root)
    }


    async function start() {
        const {
            uiScreens: {
                fightersPickingScreen,
                gameRunningScreen,
            },
            parts: {
                gameRoundsRunner,
            },
        } = this.subComponents

        gameRunningScreen.hide()
        fightersPickingScreen.showUp()

        await fightersPickingScreen.pickFightersForBothPlayers()

        fightersPickingScreen.leaveAndHide()
        gameRunningScreen.showUp()

        gameRoundsRunner.createAndStartNewRound()
    }

    function end() {
        this.status.isOver = true
        console.log('游戏结束。')
    }
})();
