window.duanduanGameChaoJiYongShi.classes.Button = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils } = app
    const { createDOMWithClassNames } = utils

    return function Button(labelText, options) {
        this.disable       = disable      .bind(this)
        this.enable        = enable       .bind(this)
        this.setDisabledAs = setDisabledAs.bind(this)

        _init.call(this, labelText, options)
    }

    function disable() {
        // this.el.root.classList.add('is-disabled')
        this.el.root.disabled = true
    }

    function enable() {
        // this.el.root.classList.remove('is-disabled')
        this.el.root.disabled = false
    }

    function setDisabledAs(disabled) {
        // this.el.root.classList.toggle('is-disabled', !!disabled)
        this.el.root.disabled = !!disabled
    }

    function _init(labelText, options) {
        _createDOMs.call(this, labelText, options)
    }

    function _createDOMs(labelText, options) {
        const {
            // description,
            onClick,
            buttonType, // 'submit' 'reset' 'button' etc
            uniqueCSSClassName,
            extraCSSClassNames,
        } = options

        let _extraCSSClassNames = extraCSSClassNames
        if (!Array.isArray(_extraCSSClassNames)) {
            _extraCSSClassNames = [ _extraCSSClassNames ]
        }

        const buttonElement = createDOMWithClassNames('button', [
            'the-control',
            uniqueCSSClassName,
            ..._extraCSSClassNames,
        ])

        buttonElement.innerText = labelText || '未知按钮'

        if (buttonType) {
            buttonElement.type = inputType
        }


        if (typeof onClick === 'function') {
            buttonElement.onclick = onClick
        }

        this.el = {
            root: buttonElement,
        }
    }
})();
