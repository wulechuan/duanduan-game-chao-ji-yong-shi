window.duanduanGameChaoJiYongShi.classes.KeyboardEngine = (function () {
    return function KeyboardEngine(initOptions) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 KeyboardEngine 构造函数。')
        }

        this.data = {
            keyRegistries: null,
        }

        this.status = {
            isRunning: false,
        }

        const thisKeyboardEngine = this
        this.eventListenerForKeyDown = function (event) {
            // 该函数没有 bind this 对象。故意保留事件侦听函数原本的 this 对象。
            thisKeyboardEngine.eventHandlerForKeyDown(event.key)
        }

        this.start                  = start                 .bind(this)
        this.stop                   = stop                  .bind(this)
        this.eventHandlerForKeyDown = eventHandlerForKeyDown.bind(this)
    }

    function eventHandlerForKeyDown(key) {
        console.log('按键引擎监测到按键：', key)
        const upperCaseKey = key.toUpperCase()
        const matchedAction = this.data.keyRegistries[upperCaseKey]
        matchedAction && matchedAction()
    }
    
    function start(keyRawRegistries) {
        if (!keyRawRegistries || typeof keyRawRegistries !== 'object') {
            console.log('没有指定新的按键侦听配置。遂将沿用旧有配置。')
        } else {
            const keys = Object.keys(keyRawRegistries)
            const validRegistries = keys.reduce((validReg, key) => {
                const providedAction = keyRawRegistries[key]
    
                if (providedAction) {
                    if (typeof providedAction !== 'function') {
                        throw new TypeError('注册按键的动作必须使用一个函数。')
                    }
    
                    validReg[key] = providedAction
                }
    
                return validReg
            }, {})

            this.data.keyRegistries = validRegistries
        }

        if (!this.data.keyRegistries) {
            throw new ReferenceError('从未配置过按键侦听引擎。')
        }

        if (!this.status.isRunning) {
            window.addEventListener('keydown', this.eventListenerForKeyDown)
            this.status.isRunning = true
            console.log('按键侦听引擎已经启动。')
        }
    }

    function stop() {
        if (this.status.isRunning) {
            window.removeEventListener('keydown', this.eventListenerForKeyDown)
            this.status.isRunning = false
            console.log('按键侦听引擎已经停止。')
        }
    }
})();
