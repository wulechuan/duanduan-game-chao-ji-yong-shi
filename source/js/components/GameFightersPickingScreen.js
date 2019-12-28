window.duanduanGameChaoJiYongShi.classes.GameFightersPickingScreen = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes } = app

    const { createDOMWithClassNames } = utils

    return function GameFightersPickingScreen(game, initOptions) {
        const { Game } = classes

        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameFightersPickingScreen 构造函数。')
        }

        if (!(game instanceof Game)) {
            throw new TypeError('创建【游戏斗士选择界面】时，必须指明其应隶属于哪个【游戏】。')
        }

        if (game.status.isOver) {
            throw new Error('【游戏】已经结束。不能为已经结束的【游戏】创建【游戏斗士选择界面】。')
        }

        this.game = game
        this.subComponents = {}
        this.data = {}
        this.status = {}


        this.pickFightersForBothPlayers = pickFightersForBothPlayers.bind(this)
        this.showUp                     = showUp                    .bind(this)
        this.hide                       = hide                      .bind(this)
        this.leaveAndHide               = leaveAndHide              .bind(this)


        _init.call(this)

        console.log('【游戏角色选择界面】创建完毕。')
    }



    function _init() {
        _createFighterPickersForBothPlayers.call(this)
        _createMoreDOMs                    .call(this)

        this.el.root.style = 'none'
    }

    function _createFighterPickersForBothPlayers() {
        const { GameFighterPicker } = classes
        const twoArraysOfCandidates = this.game.data.allGameFighterCandidatesForBothPlayers
        this.subComponents.fighterPickers = twoArraysOfCandidates.map(
            (candidates, i) => new GameFighterPicker(i + 1, candidates)
        )
    }

    function _createMoreDOMs() {
        const rolePickingScreenElement = createDOMWithClassNames('div', [
            'ui-screen',
            'role-picking-screen',
        ])

        this.subComponents.fighterPickers.forEach(fp => {
            rolePickingScreenElement.appendChild(fp.el.root)
        })

        this.el = {
            root: rolePickingScreenElement,
        }
    }

    async function pickFightersForBothPlayers() {
        const {
            fighterPickers,
        } = this.subComponents

        fighterPickers.forEach(fp => fp.startPickingFighter())

        console.warn('虚假逻辑开始。')
        function fakePickingFighter(playerId, fighterPicker) {
            const ms = Math.floor(Math.random() * 4000)

            return new Promise(resolve => {
                const fighterCandidate = fighterPicker.decideFighter()

                setTimeout(() => {
                    console.log(`${playerId}: ${ms}ms`, )
                    resolve(fighterCandidate)
                }, ms)
            })
        }

        const fighterCandidates = await Promise.all(fighterPickers.map((fp, i) => {
            return fakePickingFighter(i + 1, fp)
        }))

        const bothFighters = fighterCandidates.map((fc, i) => {
            const { GameRole } = classes
            return new GameRole(this.game, i + 1, fc)
        })

        console.warn('虚假逻辑结束。')

        this.game.data.fighters.both = bothFighters
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
