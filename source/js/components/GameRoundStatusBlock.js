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

        this.subComponents = {}
        this.data = {}

        this.setFighterHPBar = setFighterHPBar.bind(this)

        _init.call(this)

        console.log('【游戏局状态栏】创建完毕。')
    }



    function _init() {
        _createStatusBarForBothFighters.call(this)
        _createMoreDOMs                .call(this)
    }

    function _createStatusBarForBothFighters() {
        const { GameRoundFighterStatusBar } = classes
        console.log(this.gameRound.data.fighters)
        this.subComponents.fighterStatusBars = this.gameRound.data.fighters.both.map((fighter, index) => {
            return new GameRoundFighterStatusBar(index + 1, fighter)
        })
    }

    function _createMoreDOMs() {
        const { fighterStatusBars } = this.subComponents

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

        this.el = {
            root: rootElement,
            versusIcon: versusIconElement,
        }
    }

    function setFighterHPBar() {

    }
})();
