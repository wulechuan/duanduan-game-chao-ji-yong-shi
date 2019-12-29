window.duanduanGameChaoJiYongShi.classes.GameFightersPickingScreen = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes, data: appData } = app
    
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
        this.status = {
            fighter1HasDecided: false,
            fighter2HasDecided: false,
        }


        this.pickFightersForBothPlayers = pickFightersForBothPlayers.bind(this)
        this.onEitherFighterDecided     = onEitherFighterDecided    .bind(this)
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
        const {
            player1: player1KeyboardShortcuts,
            player2: player2KeyboardShortcuts,
        } = appData.keyboardShortcuts.gameFightersPicking

        const [
            candidatesForPlayer1,
            candidatesForPlayer2,
        ] = this.game.data.allGameFighterCandidatesForBothPlayers
        
        this.subComponents.fighterPickers = [
            new GameFighterPicker(1, {
                gameRoleCandidates: candidatesForPlayer1,
                keyForStoppingRollingRoles: player1KeyboardShortcuts.stopRolling,
                keyForPickingPrevCandidate: player1KeyboardShortcuts.prevCandidate,
                keyForPickingNextCandidate: player1KeyboardShortcuts.nextCandidate,
                // shouldNotAutoRoll: false,
            }),

            new GameFighterPicker(2, {
                gameRoleCandidates: candidatesForPlayer2,
                keyForStoppingRollingRoles: player2KeyboardShortcuts.stopRolling,
                keyForPickingPrevCandidate: player2KeyboardShortcuts.prevCandidate,
                keyForPickingNextCandidate: player2KeyboardShortcuts.nextCandidate,
                // shouldNotAutoRoll: false,
            }),
        ]
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

    function pickFightersForBothPlayers() {
        this.subComponents.fighterPickers.forEach(fp => fp.startPickingFighter())
    }

    function onEitherFighterDecided(fighterPicker) {
        const decidedFighterRoleConfig = fighterPicker.stopRollingRoles()

        const { playerId } = fighterPicker.data
        
        const pickedFighterRoleConfigs = this.game.data.pickedFighterRoleConfigurations.both
        const arrayIndex = playerId - 1
        pickedFighterRoleConfigs[arrayIndex] = decidedFighterRoleConfig

        fighterPicker.el.root.classList.add('fighter-has-decided')

        const { status } = this
        status[`fighter${arrayIndex + 1}HasDecided`] = true

        if (status.fighter1HasDecided && status.fighter2HasDecided) {
            window.onkeydown = null
            this.game.start()
        }
    }

    function showUp() {
        this.el.root.style.display = ''
        
        setTimeout(() => {
            const pickingScreen = this
            const [
                fighterPickerForPlayer1,
                fighterPickerForPlayer2,
            ] = this.subComponents.fighterPickers

            window.onkeydown = e => {
                const { key } = e
                console.log('key:', key, 'keyCode', e.keyCode)

                switch (key) {
                    case fighterPickerForPlayer1.data.keyForStoppingRollingRoles:
                        pickingScreen.onEitherFighterDecided(fighterPickerForPlayer1)
                        break

                    case fighterPickerForPlayer2.data.keyForStoppingRollingRoles:
                        pickingScreen.onEitherFighterDecided(fighterPickerForPlayer2)
                        break
                }
            }
        }, 800)
    }

    function hide() {
        window.onkeydown = null
        this.el.root.style.display = 'none'
    }

    function leaveAndHide() {
        window.onkeydown = null
        const rootElement = this.el.root

        rootElement.classList.add('leaving')
        rootElement.onanimationend = function () {
            rootElement.style.display = 'none'
            rootElement.classList.remove('leaving')
            rootElement.onanimationend = null
        }
    }
})();
