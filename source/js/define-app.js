window.duanduanGameChaoJiYongShi = {
    games: [],

    classes: {}, // 各种构造函数统一存放于此。

    networkData: {}, // 故意模拟来自网络的数据集。

    data: {
        chineseNumbers: [ '〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十' ],
    },

    async fetchGameGlobalSettings() {
        return Promise.resolve(this.networkData.gameGlobalSettings)
    },

    async fetchGameRoleRawConfigurations() {
        return Promise.resolve(this.networkData.allGameRoleRawConfigurations)
    },

    async fetchGameFightingStageRawConfigurations() {
        return Promise.resolve(this.networkData.allGameFightingStageRawConfigurations)
    },


    ShowAuthorInfo() {
        const authorInfoElement = document.querySelector('#info-when-no-more-games')
        if (authorInfoElement) {
            appElement       .style.display = 'none'
            authorInfoElement.style.display = ''
        }
    },

    reportAppLaunch() {
        const splashWidth = 32

        const { buildOneSplashLineForConsoleLog } = this.utils

        console.log([
            '\n'.repeat(0),
            '*'.repeat(splashWidth),
            buildOneSplashLineForConsoleLog(splashWidth),
            buildOneSplashLineForConsoleLog(splashWidth, '应用现在启动', 11),
            buildOneSplashLineForConsoleLog(splashWidth),
            '*'.repeat(splashWidth),
            '\n'.repeat(1),
        ].join('\n'))
    },

    start(rootElementSelector) {
        this.reportAppLaunch()

        console.log('正在等待从网络接受游戏数据（实际上目前这种说法是虚假的，没有网络请求）。')
        Promise.all([
            rootElementSelector,
            this.fetchGameGlobalSettings(),
            this.fetchGameRoleRawConfigurations(),
            this.fetchGameFightingStageRawConfigurations(),
        ]).then(this.createNewGameAndRunIt.bind(this))
    },

    createNewGameAndRunIt(allPromisedData) {
        const [
            rootElementSelector,
            gameGlobalSettings,
            allGameRoleRawConfigurations,
            allGameFightingStageRawConfigurations,
        ] = allPromisedData

        const appElement = document.querySelector(rootElementSelector)
        
        let afterGameDestroyed
        if (gameGlobalSettings.SHOULD_START_NEW_GAME_WHEN_A_GAME_ENDS) {
            console.log('')
            console.warn([
                '',
                '游戏已经配置成循环模式。',
                '',
                '谨慎！我们真的有必要令游戏无止境的进行吗？',
                '谨慎！我们真的有必要令游戏无止境的进行吗？',
                '谨慎！我们真的有必要令游戏无止境的进行吗？',
                '',
                '',
            ].join('\n'))

            afterGameDestroyed = _createNewGameAndRunIt.bind(this)
        } else {
            afterGameDestroyed = this.ShowAuthorInfo
        }

        const { Game } = this.classes

        function _createNewGameAndRunIt() {
            console.log('\n准备创建新游戏\n\n')

            const game = new Game(
                appElement,
    
                {
                    gameGlobalSettings,
                    allGameRoleRawConfigurations,
                    allGameFightingStageRawConfigurations,
    
                    // onGameEnd,
                    // justBeforeGameDestroying,
                    afterGameDestroyed,
                }
            )
    
            this.games.push(game)
    
            game.start()
        }

        _createNewGameAndRunIt.call(this)
    },
}
