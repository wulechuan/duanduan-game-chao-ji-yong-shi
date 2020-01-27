window.duanduanGameChaoJiYongShi.classes.GameRunningScreen = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes } = app
    const { createDOMWithClassNames } = utils

    return function GameRunningScreen(game) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameRunningScreen 构造函数。')
        }

        this.game = game

        this.subComponents = {}

        this.showUpAndStartGameRounds = showUpAndStartGameRounds.bind(this)
        this.showUp                   = showUp                  .bind(this)
        this.hide                     = hide                    .bind(this)
        this.leaveAndHide             = leaveAndHide            .bind(this)

        _init.call(this)

        console.log('【游戏运行界面】创建完毕。')
    }

    function _init() {
        _createDOMs.call(this)
    }

    function _createDOMs() {
        const rootElement = createDOMWithClassNames('div', [
            'ui-screen',
            'game-running-screen',
        ])

        this.el = {
            root: rootElement,
        }
    }





    function _createGameRoundsRunner() {
        const { GameRoundsRunner } = classes
        const gameRoundsRunner = new GameRoundsRunner(this.game)
        this.subComponents.gameRoundsRunner = gameRoundsRunner
        this.el.root.appendChild(gameRoundsRunner.el.root)
    }

    function showUpAndStartGameRounds() {
        _createGameRoundsRunner.call(this)
        this.showUp()
        this.subComponents.gameRoundsRunner.createAndStartNewRound()
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
