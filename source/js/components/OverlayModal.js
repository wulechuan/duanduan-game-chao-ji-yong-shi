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
            titleHTML: '',
            contentHTML: '',
            modalSize: '',
        }

        this.update       = update      .bind(this)
        this.showUp       = showUp      .bind(this)
        this.leaveAndHide = leaveAndHide.bind(this)

        _init.call(this, initOptions)

        console.log('【对话框】创建完毕。')
    }



    function _init(initOptions) {
        _createDOMs.call(this)
        this.update(initOptions)
        this.el.root.style.display = 'none'
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

        modalElement.appendChild(titleElement)
        modalElement.appendChild(contentElement)

        rootElement.appendChild(backdropElement)
        rootElement.appendChild(modalElement)

        this.el = {
            root: rootElement,
            modal: modalElement,
            title: titleElement,
            content: contentElement,
        }
    }

    function update(options) {
        if (!options || typeof options !== 'object') { return }

        const {
            titleHTML:   inputTitleHTML,
            contentHTML: inputContentHTML,
            modalSize:   inputModalSize,
            cssClassNames: inputCssClassNames,
        } = options

        const { data } = this

        if (inputTitleHTML)   { data.titleHTML   = inputTitleHTML   }
        if (inputContentHTML) { data.contentHTML = inputContentHTML }
        if (inputModalSize)   { data.modalSize   = inputModalSize   }

        if (Array.isArray(inputCssClassNames)) {
            this.el.root.className = [
                'overlay-modal',
                ...inputCssClassNames,
            ].join(' ')
        }

        const {
            titleHTML,
            contentHTML,
            modalSize,
        } = data

        const {
            modal:   modalElement,
            title:   titleElement,
            content: contentElement,
        } = this.el

        if (modalSize === 'huge') {
            modalElement.classList.add('huge')
        } else {
            modalElement.classList.remove('huge')
        }

        titleElement  .innerHTML = titleHTML
        contentElement.innerHTML = contentHTML
    }

    async function showUp(options) {
        this.update(options)
        const rootElement = this.el.root
        rootElement.style.display = ''

    }

    function _timing(timing) {
        return new Promise(resolve => {
            setTimeout(resolve, timing || 1000)
        })
    }
    
    async function leaveAndHide() {
        const rootElement = this.el.root

        rootElement.classList.add('is-leaving')

        await _timing(320)
        
        rootElement.classList.remove('is-leaving')
        rootElement.style.display = 'none'
    }
})();
