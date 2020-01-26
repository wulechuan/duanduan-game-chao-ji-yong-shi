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
    }

    function _defineControlsConfig(gameSetingsToModify) {
        gameSetingsToModify = gameSetingsToModify || {}

        const {
            maxRoundsToRun,
            enableFairMode,
            allowToCheat,
            shouldManuallyPickFighters,
            shouldAutoPickFightersByWeights,
            shouldForceRollingEvenIfAutoPickingByWeights,

            keyboardShortcuts,
        } = gameSetingsToModify

        const {
            namedControlInstances,
        } = this

        return [
            [
                {
                    label: '最多对战', type: 'number-box',
                    options: {
                        label2: '局',
                        description: '',
                        initValue: maxRoundsToRun || 3,
                        isDisabled: false,
                        uniqueCSSClassName: 'settings-max_rounds_to_run',
                        extraCSSClassNames: '',
                        onChange: (e) => {
                            const newValue = e.target.value
                            gameSetingsToModify.maxRoundsToRun = + newValue
                        }
                    }
                },
            ],

            [
                {
                    label: '开启公平模式', type: 'check-box',
                    options: {
                        description: '',
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

        rootElement.appendChild(contentElement)

        this.el = {
            root: rootElement,
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
})();
