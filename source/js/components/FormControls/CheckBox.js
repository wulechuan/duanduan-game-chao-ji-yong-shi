window.duanduanGameChaoJiYongShi.classes.FormControls.CheckBox = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils } = app
    const { createDOMWithClassNames } = utils

    return function CheckBox(labelText, isChecked, options) {
        _init.call(this, isChecked, options)
    }

    function _init(labelText, isChecked, options) {
        _createDOMs.call(this, labelText, isChecked, options)
    }

    function _createDOMs(labelText, isChecked, options) {
        const rootElement = createDOMWithClassNames('div', [
            'check-box',
        ])

        const inputId = `input-checkbox-${Math.floor(Math.random() * 100000000)}`

        const labelElement = createDOMWithClassNames('label')
        labelElement.innerText = labelText
        labelElement.setAttribute('for', inputId)

        const inputOfCheckboxElement = createDOMWithClassNames('input')
        inputOfCheckboxElement.type = 'checkbox'
        inputOfCheckboxElement.checked = !!isChecked
        inputOfCheckboxElement.id = inputId

        rootElement.appendChild(inputOfCheckboxElement)
        rootElement.appendChild(labelElement)

        this.el = {
            root: rootElement,
            input: inputOfCheckboxElement,
        }
    }
})();
