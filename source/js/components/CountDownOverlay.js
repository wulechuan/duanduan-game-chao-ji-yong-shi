window.duanduanGameChaoJiYongShi.classes.CountDownOverlay = (function () {
    const { utils } = window.duanduanGameChaoJiYongShi
    const { createDOMWithClassNames } = utils

    return function CountDownOverlay() {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 CountDownOverlay 构造函数。')
        }

        this.remainedSeconds = 0

        this.countDown     = countDown    .bind(this)
        this.countDownOnce = countDownOnce.bind(this)
        
        _init(this)

        console.log('【倒计时覆盖层】创建完毕。')
    }



    function _init(countDownOverlay) {
        _createDOMs(countDownOverlay)
        countDownOverlay.el.root.style.display = 'none'
    }

    function _createDOMs(countDownOverlay) {
        const rootElement = createDOMWithClassNames('div', [
            'count-down-overlay',
        ])

        const modalElement = createDOMWithClassNames('div', [
            'modal',
        ])

        const digitElement = createDOMWithClassNames('div', [
            'digit',
        ])

        modalElement.appendChild(digitElement)

        rootElement.appendChild(modalElement)
        
        countDownOverlay.el = {
            root: rootElement,
            digit: digitElement,
        }
    }

    function countDownOnce() {
        return new Promise(resolve => {
            this.el.digit.innerText = this.remainedSeconds
            setTimeout(() => {
                this.remainedSeconds--
                resolve()
            }, 1000)
        })
    }

    async function countDown(secondsToCountDown) {
        this.remainedSeconds = secondsToCountDown

        if (!(this.remainedSeconds > 0)) {
            return
        }

        this.el.root.style.display = ''

        while (this.remainedSeconds > 0) {
            await this.countDownOnce()
        }

        this.el.root.style.display = 'none'
    }
})();
