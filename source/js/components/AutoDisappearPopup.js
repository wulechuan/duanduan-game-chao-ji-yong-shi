window.duanduanGameChaoJiYongShi.classes.AutoDisappearPopup = (function () {
    const { utils } = window.duanduanGameChaoJiYongShi
    const { createDOMWithClassNames } = utils

    return function AutoDisappearPopup(parentElement, initOptions) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 AutoDisappearPopup 构造函数。')
        }

        if (!(parentElement instanceof Node)) {
            throw new TypeError('构造【可自动消失的弹出层】实例时，必须指明其容器元素。')
        }

        if (!initOptions || typeof initOptions !== 'object' || !initOptions.content) {
            throw new Error('构造【可自动消失的弹出层】实例时，必须给出足够的参数。')
        }

        // const {
        //     timingForDisappearing,
        //     rootElementExtraCSSClassNames,
        //     rootElementStyle,
        //     content,
        // } = initOptions

        _init.call(this, parentElement, initOptions)

        // console.log('【可自动消失的弹出层】创建完毕。')
    }



    function _init(parentElement, initOptions) {
        _createDOMs      .call(this, parentElement, initOptions.rootElementExtraCSSClassNames)
        _setupRootElement.call(this, initOptions.rootElementStyle)
        _fillContent     .call(this, initOptions.content)
        _popup           .call(this, initOptions.timingForDisappearing)
    }

    function _createDOMs(parentElement, rootElementExtraCSSClassNames) {
        let _rootElementExtraCSSClassNames = rootElementExtraCSSClassNames
        if (!Array.isArray(_rootElementExtraCSSClassNames)) {
            _rootElementExtraCSSClassNames = [ _rootElementExtraCSSClassNames ]
        }

        const rootElement = createDOMWithClassNames('div', [
            'auto-disappear-popup',
        ].concat(_rootElementExtraCSSClassNames))

        const contentElement = createDOMWithClassNames('div', [
            'content',
        ])

        rootElement.appendChild(contentElement)

        this.el = {
            root: rootElement,
            content: contentElement,
        }

        parentElement.appendChild(rootElement)
    }

    function _setupRootElement(rootElementStyle) {
        const rootElement = this.el.root
        Object.keys(rootElementStyle).forEach(key => {
            rootElement.style[key] = rootElementStyle[key]
        })
    }

    function _fillContent(content) {
        const contentElement = this.el.content
        if (content instanceof Node) {
            contentElement.appendChild(content)
        } else if (content) {
            contentElement.innerHTML = content
        } else {
            throw new TypeError('【可自动消失的弹出层】的内容无效')
        }
    }

    function _popup(timingForDisappearing) {
        let _timingForDisappearing = + timingForDisappearing
        if (!(_timingForDisappearing > 800)) {
            _timingForDisappearing = 800
        }

        const rootElement = this.el.root
        setTimeout(() => {
            rootElement.parentElement.removeChild(rootElement)
        }, _timingForDisappearing)
    }
})();
