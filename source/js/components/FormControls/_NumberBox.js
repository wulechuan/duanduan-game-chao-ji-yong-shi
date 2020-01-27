window.duanduanGameChaoJiYongShi.classes.FormControls.NumberBox = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes } = app
    
    return function NumberBox(labelText, options) {
        this.setValue = setValue.bind(this)

        _init.call(this, labelText, options)
    }

    function _init(labelText, options) {
        options = options || {}

        _createDOMs.call(this, labelText, options)
        classes.FormControls.mixinCommonFeaturesToSingleFormControl(this)

        this.setValue(options.initValue)
        if (options.isDisabled) { this.disable() }
    }

    function _createDOMs(labelText, options) {
        classes.FormControls.createDOMsForSingleFormControl(this, 'text', 'number-box', labelText, options)
    }

    function setValue(newValue) {
        newValue = + newValue
        if (isNaN(newValue)) { return }
        this.el.input.value = `${newValue}`
    }
})();
