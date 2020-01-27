window.duanduanGameChaoJiYongShi.classes.GamePreferencesPanel = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes } = app
    const { createDOMWithClassNames } = utils

    return function GamePreferencesPanel(gameSetingsToModify) {
        this.allControlInstances = []
        this.namedControlInstances = {}
        
        _init.call(this, gameSetingsToModify)
    }

    function _init(gameSetingsToModify) {
        const domCreationConfigurationsArray = _defineControlsConfig.call(this, gameSetingsToModify)
        _createDOMs.call(this, domCreationConfigurationsArray)
        _setupDOMS.call(this)
    }

    function _defineControlsConfig(gameSetingsToModify) {
        gameSetingsToModify = gameSetingsToModify || {}

        const {
            maxRoundsToRun,
            enableFairMode,
            allowToCheat,
            shouldManuallyPickFighters,
            shouldAutoPickFightersByWeights,
            // shouldForceRollingEvenIfAutoPickingByWeights,

            // keyboardShortcuts,
        } = gameSetingsToModify

        const {
            namedControlInstances,
        } = this

        return [
            [
                {
                    label: '最多对战', type: 'number-box',
                    options: {
                        label2: '局（必须大于零，且必须为单数）',
                        description: '',
                        initValue: maxRoundsToRun || 3,
                        isDisabled: false,
                        uniqueCSSClassName: 'settings-max_rounds_to_run',
                        extraCSSClassNames: '',
                        onChange: (e) => {
                            const newValue = + e.target.value
                            let newValueIsValid = true
                            if (!(newValue >= 1))   { newValueIsValid = false }
                            if (newValue % 2 === 0) { newValueIsValid = false }

                            if (newValueIsValid) {
                                gameSetingsToModify.maxRoundsToRun = + newValue
                                e.target.value = + newValue
                            } else {
                                e.target.value = gameSetingsToModify.maxRoundsToRun
                            }
                        }
                    }
                },
            ],

            [
                {
                    label: '开启公平模式', type: 'check-box',
                    options: {
                        description: '本游戏幕后有一个角色配置文件，写明了每个角色的生命值和能力。这样的配置太过随意，可能出现人为强化或弱化某个角色的情况。当开启“公平模式”时，游戏将忽略上述人为配置，改为自动随机决定每个战士的生命值和能力，且每个战士的各项指标差别不会太大。故名。',
                        isChecked: !!enableFairMode,
                        isDisabled: false,
                        uniqueCSSClassName: 'settings-enable_fair_mode',
                        extraCSSClassNames: '',
                        onChange: (e) => {
                            const newValue = e.target.checked
                            gameSetingsToModify.enableFairMode = newValue
                            const affectedControl = namedControlInstances['settings-allow_to_cheat']
                            affectedControl.setDisabledAs(newValue)
                        }
                    }
                },
            ],

            [
                {
                    label: '允许作弊', type: 'check-box',
                    options: {
                        description: '',
                        isChecked:  !!allowToCheat,
                        isDisabled: !!enableFairMode,
                        uniqueCSSClassName: 'settings-allow_to_cheat',
                        extraCSSClassNames: '',
                        onChange: (e) => {
                            const newValue = e.target.checked
                            gameSetingsToModify.allowToCheat = newValue
                        }
                    }
                },
            ],

            [
                {
                    label: '允许玩家们自行选择战士', type: 'check-box',
                    options: {
                        description: '',
                        isChecked:  !!shouldManuallyPickFighters,
                        isDisabled: false,
                        uniqueCSSClassName: 'settings-should_manually_pick_fighters',
                        extraCSSClassNames: '',
                        onChange: (e) => {
                            const newValue = e.target.checked
                            gameSetingsToModify.shouldManuallyPickFighters = newValue
                            const affectedControl = namedControlInstances['settings-should_auto_pick_fighters_by_weights']
                            affectedControl.setDisabledAs(newValue)
                        }
                    }
                },
            ],

            [
                {
                    label: '启用权重征选战士', type: 'check-box',
                    options: {
                        description: '在令计算机自动选择战士时，以预先在幕后配置好的权重来决定战士被征选的概率。',
                        isChecked:  !!shouldAutoPickFightersByWeights,
                        isDisabled: !!shouldManuallyPickFighters,
                        uniqueCSSClassName: 'settings-should_auto_pick_fighters_by_weights',
                        extraCSSClassNames: '',
                        onChange: (e) => {
                            const newValue = e.target.checked
                            gameSetingsToModify.shouldAutoPickFightersByWeights = newValue
                        }
                    }
                },
            ],
        ]
    }

    function _createDOMs(domCreationConfigurationsArray) {
        const rootElement = createDOMWithClassNames('div', [
            'game-preferences-panel',
        ])

        const formElement = createDOMWithClassNames('form', [
            'form',
        ])

        const contentElement = createDOMWithClassNames('div', [
            'content',
        ])

        const result = classes.FormControls.createFormControlDOMs(domCreationConfigurationsArray)
        const {
            allFormRowsDOM,
            allControlInstances,
            namedControlInstances,
        } = result

        allFormRowsDOM.forEach(dom => contentElement.appendChild(dom))

        formElement.appendChild(contentElement)
        rootElement.appendChild(formElement)

        this.el = {
            root: rootElement,
            form: formElement,
        }

        const el = this.el

        el.allControlInstances = allControlInstances.map(c => c.el.root)

        el.namedControlInstances = Object.keys(namedControlInstances).reduce((dict, key) => {
            this.namedControlInstances[key] = namedControlInstances[key]
            dict[key] = namedControlInstances[key].el.root
            return dict
        }, {})

        this.allControlInstances.push(...allControlInstances)
    }

    function _setupDOMS() {
        const formElement = this.el.form

        formElement.onkeydown = function(e) {
            const { key } = e
            if (!key.match(/Escape|Enter/i)) {
                e.stopPropagation()
            }
        }

        formElement.onkeyup = function(e) {
            const { key } = e
            e.stopPropagation()
            if (!key.match(/Escape|Enter/i)) {
                e.stopPropagation()
            }
        }
    }
})();
