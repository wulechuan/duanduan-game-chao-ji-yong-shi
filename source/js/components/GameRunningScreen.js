window.duanduanGameChaoJiYongShi.classes.GameRunningScreen = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes } = app
    const { createDOMWithClassNames } = utils

    return function GameRunningScreen(game, initOptions) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameRunningScreen 构造函数。')
        }

        this.game = game

        this.subComponents = {}

        this.provideGameRoundsRunner = provideGameRoundsRunner.bind(this)
        this.showUp                  = showUp                 .bind(this)
        this.hide                    = hide                   .bind(this)
        this.leaveAndHide            = leaveAndHide           .bind(this)

        _init.call(this, initOptions)

        console.log('【游戏运行界面】创建完毕。')
    }

    function _init(initOptions) {
        _createGameRoundsRunner.call(this, initOptions)
        _createMoreDOMs        .call(this)
    }

    function _createGameRoundsRunner(initOptions) {
        const { GameRoundsRunner } = classes
        this.subComponents.gameRoundsRunner = new GameRoundsRunner(this.game, initOptions)
    }

    function _createMoreDOMs() {
        const {
            countDownOverlay,
            gameRoundsRunner,
        } = this.subComponents

        
        const rootElement = createDOMWithClassNames('div', [
            'ui-screen',
            'game-running-screen',
        ])

        rootElement.appendChild(gameRoundsRunner.el.root)

        this.el = {
            root: rootElement,
        }
    }


    function provideGameRoundsRunner() {
        return this.subComponents.gameRoundsRunner
    }

    function showUp() {
        const rootElement = this.el.root
        rootElement.style.display = ''
    }

    function hide() {
        const rootElement = this.el.root
        rootElement.style.display = 'none'
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
