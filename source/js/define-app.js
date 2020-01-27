window.duanduanGameChaoJiYongShi = {
    games: [],
    currentGame: null,

    classes: {}, // 各种构造函数统一存放于此。

    networkData: {}, // 故意模拟来自网络的数据集。

    data: {
        chineseNumbers: [ '〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十' ],
    },

    el: {
        appRoot: null,
        authorWishes: null,
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

    fetachAllData() {
        console.log('正在等待从网络接受游戏数据（实际上这种说法是虚假的，该游戏目前没有任何网络请求）。')

        return Promise.all([
            this.fetchGameGlobalSettings(),
            this.fetchGameRoleRawConfigurations(),
            this.fetchGameFightingStageRawConfigurations(),
        ])
    },



    hideAppAndShowAuthorWishes(lastRunGameDurationInfoObject) {
        const { appRoot, authorWishes } = this.el

        appRoot.style.display = 'none'

        if (authorWishes instanceof Node) {
            if (lastRunGameDurationInfoObject) {
                const {
                    // rawValueInMilliseconds,
                    string2: lastRunGameDurationString,
                } = lastRunGameDurationInfoObject

                const durationDOM = authorWishes.querySelector('.js-last-run-game-duration')
                if (durationDOM instanceof Node) {
                    durationDOM.innerText = `${lastRunGameDurationString}`
                }
            }

            authorWishes.style.display = ''
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

    async start(options) {
        this.reportAppLaunch()



        const {
            appRootElementSelector,
            authorWishesElementSelector,
        } = options

        const appElement = document.querySelector(appRootElementSelector)

        if (!(appElement instanceof Node)) {
            throw new ReferenceError(`凭借选择器“${appRootElementSelector}”找不到 DOM 元素。`)
        }

        const authorWishesElement = document.querySelector(authorWishesElementSelector)

        this.el.appRoot      = appElement
        this.el.authorWishes = authorWishesElement



        const [
            gameGlobalSettings,
            allGameRoleRawConfigurations,
            allGameFightingStageRawConfigurations,
        ] = await this.fetachAllData()



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

            afterGameDestroyed = () => {
                this.currentGame = null
                this.createNewGameAndStartIt()
            }
        } else {
            afterGameDestroyed = (lastRunGameDurationInfoObject) => {
                this.currentGame = null
                this.hideAppAndShowAuthorWishes(lastRunGameDurationInfoObject)
            }
        }



        this.createNewGameAndStartIt({
            gameGlobalSettings,
            allGameRoleRawConfigurations,
            allGameFightingStageRawConfigurations,

            // onGameEnd,
            // justBeforeGameDestroying,
            afterGameDestroyed,
        })
    },

    createNewGameAndStartIt(gameOptions) {
        const {
            appRoot:      appElement,
            authorWishes: authorWishesElement,
        } = this.el

        if (authorWishesElement instanceof Node) {
            authorWishesElement.style.display = 'none'
        }

        console.log('\n准备创建新游戏\n\n')
        const { Game } = this.classes
        const game = new Game(appElement, gameOptions)
        this.currentGame = game
        this.games.push(game)
        game.start()
    },
}
