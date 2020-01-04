window.duanduanGameChaoJiYongShi.classes.OverlayModal = (function () {
    const { utils } = window.duanduanGameChaoJiYongShi
    const { createDOMWithClassNames } = utils

    return function OverlayModal(initOptions) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 OverlayModal 构造函数。')
        }

        const {
            titleHTML,
            contentHTML,
            modalSize,
        } = initOptions

        this.data = {
            titleHTML,
            contentHTML,
            modalSize,
        }

        this.showUp       = showUp      .bind(this)
        this.leaveAndHide = leaveAndHide.bind(this)

        _init.call(this)

        console.log('【对话框】创建完毕。')
    }



    function _init() {
        _createDOMs.call(this)
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

        const {
            titleHTML,
            contentHTML,
            modalSize,
        } = this.data

        if (modalSize === 'huge') { modalElement.classList.add('huge') }

        titleElement  .innerHTML = titleHTML
        contentElement.innerHTML = contentHTML

        modalElement.appendChild(titleElement)
        modalElement.appendChild(contentElement)

        rootElement.appendChild(backdropElement)
        rootElement.appendChild(modalElement)

        this.el = {
            root: rootElement,
            // title: titleElement,
            // content: contentElement,
        }
    }

    function _timing(timing) {
        return new Promise(resolve => {
            setTimeout(resolve, timing || 1000)
        })
    }

    async function showUp() {
        const rootElement = this.el.root
        rootElement.style.display = ''

    }
    
    async function leaveAndHide() {
        const rootElement = this.el.root

        rootElement.classList.add('is-leaving')

        await _timing(320)
        
        rootElement.classList.remove('is-leaving')
        rootElement.style.display = 'none'
    }
})();
