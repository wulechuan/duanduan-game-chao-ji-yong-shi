window.duanduanGameChaoJiYongShi.classes.OverlayModal = (function () {
    const { utils } = window.duanduanGameChaoJiYongShi
    const { createDOMWithClassNames } = utils

    return function OverlayModal(initOptions) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 OverlayModal 构造函数。')
        }

        // const {
        //     titleHTML,
        //     contentHTML,
        //     modalSize,
        // } = initOptions

        this.data = {
            modalSize:        '',
            titleHTML:        '',
            contentHTML:      '',
            contentComponent: null,
        }

        this.status = {
            isShowing: false,
            isLeaving: false,
        }

        this.update       = update      .bind(this)
        this.showUp       = showUp      .bind(this)
        this.leaveAndHide = leaveAndHide.bind(this)

        _init.call(this, initOptions)

        console.log('【对话框】创建完毕。')
    }



    function _init(initOptions) {
        _createDOMs.call(this)

        const {
            root:           rootElement,
            countDownBlock: countDownBlockElement,
            footer:         footerElement,
        } = this.el

        countDownBlockElement.style.display = 'none'
        footerElement        .style.display = 'none'

        this.update(initOptions)

        rootElement.style.display = 'none'
    }

    function _createDOMs() {
        const rootElement = createDOMWithClassNames('div', [
            'overlay-modal',
        ])

        const backdropElement = createDOMWithClassNames('div', [
            'backdrop',
        ])

        const modalElement = createDOMWithClassNames('div', [
            'modal',
        ])

        const titleElement = createDOMWithClassNames('div', [
            'title',
        ])

        const contentElement = createDOMWithClassNames('div', [
            'content',
        ])

        const countDownBlockElement = createDOMWithClassNames('div', [
            'count-down',
        ])

        const countDownTipElement = createDOMWithClassNames('div', [
            'count-down-tip',
        ])

        const countDownNumberElement = createDOMWithClassNames('div', [
            'count-down-number',
        ])

        const footerElement = createDOMWithClassNames('footer', [
        ])

        countDownBlockElement.appendChild(countDownTipElement)
        countDownBlockElement.appendChild(countDownNumberElement)

        modalElement.appendChild(titleElement)
        modalElement.appendChild(contentElement)
        modalElement.appendChild(countDownBlockElement)
        modalElement.appendChild(footerElement)

        rootElement.appendChild(backdropElement)
        rootElement.appendChild(modalElement)

        this.el = {
            root: rootElement,
            modal: modalElement,
            title: titleElement,
            content: contentElement,
            countDownBlock: countDownBlockElement,
            countDownTip: countDownTipElement,
            countDownNumber: countDownNumberElement,
            footer: footerElement,
        }
    }

    function update(options) {
        if (!options || typeof options !== 'object') { return }

        const {
            titleHTML:        inputTitleHTML,
            contentHTML:      inputContentHTML,
            contentComponent: inputContentComponent,
            modalSize:        inputModalSize,
            cssClassNames:    inputCssClassNames,
            footerContentElement,
        } = options

        const { data } = this

        if (inputTitleHTML)   { data.titleHTML   = inputTitleHTML   }
        if (inputModalSize)   { data.modalSize   = inputModalSize   }

        if (inputContentComponent) {
            if (!inputContentComponent.el || !(inputContentComponent.el.root instanceof Node)) {
                throw new TypeError('OverlayModal 更新时错误：contentComponent 必须给出一个标准的组件对象，它应拥有有 el.root 元素。')
            }

            data.contentComponent = inputContentComponent
            data.contentHTML      = ''
        } else if (inputContentHTML) {
            data.contentHTML      = inputContentHTML
            data.contentComponent = null
        }

        if (Array.isArray(inputCssClassNames)) {
            this.el.root.className = [
                'overlay-modal',
                ...inputCssClassNames,
            ].join(' ')
        }

        const {
            modalSize,
            titleHTML,
            contentHTML,
            contentComponent,
        } = data

        const {
            modal:   modalElement,
            title:   titleElement,
            content: contentElement,
            footer:  footerElement,
        } = this.el

        if (modalSize === 'huge') {
            modalElement.classList.add('huge')
        } else {
            modalElement.classList.remove('huge')
        }

        titleElement  .innerHTML = titleHTML

        if (contentComponent) {
            contentElement.innerHTML = ''
            contentElement.appendChild(contentComponent.el.root)
        } else {
            contentElement.innerHTML = contentHTML
        }

        if (footerContentElement) {
            footerElement.innerHTML = ''
            footerElement.appendChild(footerContentElement)
            footerElement.style.display = ''
        } else if (footerContentElement === null) {
            footerElement.innerHTML = ''
            footerElement.style.display = 'none'
        }
    }

    function _timing(timing) {
        return new Promise(resolve => setTimeout(resolve, timing || 1000))
    }

    async function _countDown(countDownSettings) {
        let {
            seconds,
            tipHTML,
        } = countDownSettings

        seconds = parseInt(seconds, 10)
        if (!(seconds > 1)) { seconds = 3 }

        if (!tipHTML) { tipHTML = '关闭对话框倒计时' }

        const {
            countDownBlock: countDownBlockElement,
        } = this.el

        countDownBlockElement.style.display = ''

        let remainedSeconds = seconds
        while (remainedSeconds > 0 && this.status.isShowing) {
            _countDownOnce.call(this, remainedSeconds, tipHTML)
            await _timing(1000)
            remainedSeconds--
        }
    }

    function _countDownOnce(remainedSeconds, tipHTML) {
        const {
            countDownNumber: countDownNumberElement,
            countDownTip:    countDownTipElement,
        } = this.el

        countDownNumberElement.innerText = remainedSeconds
        countDownTipElement   .innerHTML = tipHTML
    }

    async function showUp(options, callback) {
        this.update(options)

        let countDownSettings

        if (options && typeof options === 'object') {
            const {
                countDown,
            } = options

            if (countDown && typeof countDown === 'object')

            countDownSettings = countDown
        }

        const rootElement = this.el.root
        rootElement.style.display = ''
        this.status.isShowing = true
        this.status.isLeaving = false

        if (!countDownSettings) {
            this.el.countDownBlock.style.display = 'none'
        }

        if (typeof callback === 'function') {
            callback(this)
        }

        if (countDownSettings) {
            await _countDown.call(this, countDownSettings)
            this.leaveAndHide()
        }
    }

    async function leaveAndHide() {
        const { status } = this

        if (!status.isShowing || status.isLeaving) { return }

        const {
            root:            rootElement,
            countDownNumber: countDownNumberElement,
            countDownTip:    countDownTipElement,
        } = this.el

        rootElement.classList.add('is-leaving')
        status.isLeaving = true

        await _timing(320)

        rootElement.classList.remove('is-leaving')
        rootElement.style.display = 'none'

        countDownNumberElement.innerText = ''
        countDownTipElement   .innerHTML = ''

        status.isLeaving = false
        status.isShowing = false
    }
})();
