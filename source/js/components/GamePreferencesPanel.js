window.duanduanGameChaoJiYongShi.classes.GamePreferencesPanel = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes, data } = app
    const { createDOMWithClassNames } = utils

    return function GamePreferencesPanel() {
        const { gameGlobalSettings } = data
        _init.call(this, gameGlobalSettings)
    }

    function _init(gameGlobalSettings) {
        _createDOMs.call(this, gameGlobalSettings)
    }

    function _createDOMs(isChecked, options) {
        const {
            CheckBox,
        } = classes.FormControls

        const rootElement = createDOMWithClassNames('div', [
            'game-preferences-panel',
        ])

        const checkbox1 = new CheckBox('测试', true)

        rootElement.appendChild(checkbox1.el.root)

        this.el = {
            root: rootElement,
        }
    }
})();
