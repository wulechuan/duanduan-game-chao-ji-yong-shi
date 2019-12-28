window.duanduanGameChaoJiYongShi.classes.GameRoundStatusBlock = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes } = app
    const { createDOMWithClassNames } = utils

    return function GameRoundStatusBlock(gameRound) {
        const { GameRound } = classes

        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameRoundStatusBlock 构造函数。')
        }

        if (!(gameRound instanceof GameRound)) {
            throw new TypeError('创建【游戏局状态栏】时，必须指明其应隶属于哪个【游戏局】。')
        }

        this.gameRound = gameRound

        this.fighters = gameRound.fighters.both

        this.setFighterHPBar = setFighterHPBar.bind(this)

        _init(this)

        console.log('【游戏局状态栏】创建完毕。')
    }



    function _init(gameRoundStatusBlock) {
        _createStatusBarForBothFighters(gameRoundStatusBlock)
        _createMoreDOMs(gameRoundStatusBlock)
    }

    function _createStatusBarForBothFighters(gameRoundStatusBlock) {
        const { GameRoundFighterStatusBar } = classes
        gameRoundStatusBlock.fighterStatusBars = gameRoundStatusBlock.fighters.map((fighter, index) => {
            return new GameRoundFighterStatusBar(index + 1, fighter)
        })
    }

    function _createMoreDOMs(gameRoundStatusBlock) {
        const { gameRoundIndex, fighterStatusBars } = gameRoundStatusBlock

        const rootElement = createDOMWithClassNames('div', [
            'game-round-status-block',
        ])


        const versusIconElement = createDOMWithClassNames('div', [
            'icon-versus',
        ])

        const fightersStatusBarRootElement = fighterStatusBars.map(bar => bar.el.root)

        rootElement.appendChild(fightersStatusBarRootElement[0])
        rootElement.appendChild(versusIconElement)
        rootElement.appendChild(fightersStatusBarRootElement[1])

        gameRoundStatusBlock.el = {
            root: rootElement,
            versusIcon: versusIconElement,
            fighterStatusBars: fightersStatusBarRootElement,
        }
    }

    function setFighterHPBar() {

    }
})();
