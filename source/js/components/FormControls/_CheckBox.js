window.duanduanGameChaoJiYongShi.classes.FormControls.CheckBox = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes } = app

    return function CheckBox(labelText, options) {
        this.check    = check  .bind(this)
        this.uncheck  = uncheck.bind(this)
        this.setValue = setValue.bind(this)

        _init.call(this, labelText, options)
    }

    function _init(labelText, options) {
        options = options || {}

        _createDOMs.call(this, labelText, options)
        classes.FormControls.mixinCommonFeaturesToSingleFormControl(this)

        if (options.isChecked)  { this.check() }
        if (options.isDisabled) { this.disable() }
    }

    function _createDOMs(labelText, options) {
        classes.FormControls.createDOMsForSingleFormControl(this, 'checkbox', 'check-box', labelText, options)
    }

    function check() {
        this.el.input.checked = true
    }

    function uncheck() {
        this.el.input.checked = false
    }

    function setValue(newValue) {
        this.el.input.checked = !!newValue
    }
})();
