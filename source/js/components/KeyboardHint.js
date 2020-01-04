window.duanduanGameChaoJiYongShi.classes.KeyboardHint = (function () {
    const { utils } = window.duanduanGameChaoJiYongShi
    const { createDOMWithClassNames } = utils

    return function KeyboardHint(initOptions) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 KeyboardHint 构造函数。')
        }

        const {
            isOptional,
            // keyName,
            // keyDescription,
            labelSouldLayBelowHint,
            // cssClassNames
        } = initOptions

        this.data = {
            keyDisplayName: '',
            labelSouldLayBelowHint: !!labelSouldLayBelowHint,
        }

        this.status = {
            isOptional: !!isOptional,
        }

        this.update = update.bind(this)
        _init.call(this, initOptions)
        // console.log('【按键提示器】创建完毕。')
    }



    function _init(initOptions) {
        _createDOMs.call(this, initOptions)
        this.update(initOptions)
    }

    function _createDOMs(options) {
        const {
            cssClassNames = [],
        } = options
        
        const {
            labelSouldLayBelowHint,
        } = this.data

        if (labelSouldLayBelowHint) {
            cssClassNames.unshift('label-lays-below-hint')
        }

        const rootElement = createDOMWithClassNames('div', [
            'keyboard-tip-container',
            ...cssClassNames,
        ])

        const tipElement = createDOMWithClassNames('div', [
            'keyboard-tip',
        ])

        const labelElement = createDOMWithClassNames('div', [
            'keyboard-tip-label',
        ])

        rootElement.appendChild(labelElement)
        rootElement.appendChild(tipElement)

        this.el = {
            root: rootElement,
            tip: tipElement,
            label: labelElement,
        }
    }

    function update(options) {
        const {
            keyName,
            keyDescription,
        } = options

        const { isOptional } = this.status

        let _keyName = keyName

        if (isOptional && (_keyName === undefined || _keyName === null || _keyName === '')) {
            _keyName = undefined
        } else {
            if (typeof _keyName !== 'string') {
                throw new TypeError('字符名称必须是非空字符串。')
            }

            _keyName = _keyName.toUpperCase()
        }

        let keyDisplayName = _keyName

        switch (_keyName) {
            case ' ':         keyDisplayName = '空格'; break
            case 'ENTER':     keyDisplayName = '回车'; break
            case 'BACKSPACE': keyDisplayName = '退格'; break
            // case '\'':        keyDisplayName = '单引号'; break
        }

        this.data.keyDisplayName = keyDisplayName

        const { data, el } = this
        const {
            tip: keyNameElement,
            label: labelElement,
        } = el

        if (_keyName) {
            data.keyName = _keyName
            keyNameElement.innerText = keyDisplayName
            keyNameElement.style.display = ''
        } else {
            keyNameElement.innerText = ''
            keyNameElement.style.display = 'none'
        }

        if (keyDescription && typeof keyDescription === 'string') {
            data.keyDescription = keyDescription
            labelElement.innerText = keyDescription
            labelElement.style.display = ''
        } else {
            labelElement.style.display = 'none'
        }
    }
})();
