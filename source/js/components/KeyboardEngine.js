window.duanduanGameChaoJiYongShi.classes.KeyboardEngine = (function () {
    return function KeyboardEngine(initOptions) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 KeyboardEngine 构造函数。')
        }

        const thisKeyboardEngine = this

        this.data = {
            keyRegistries: null,
        }

        this.status = {
            isPaused: false,
        }



        this.eventListenerForKeyDown = function (event) {
            const { key } = event
            console.log('listener: this', this)
            thisKeyboardEngine.eventHandlerForKeyDown(key)
        }

        this.start                  = start                 .bind(this)
        this.eventHandlerForKeyDown = eventHandlerForKeyDown.bind(this)
    }

    function eventHandlerForKeyDown(key) {
        const matchedAction = this.data.keyRegistries[key]
        matchedAction && matchedAction()
    }
    
    function start(keyRawRegistries) {
        const keys = Object.keys(keyRawRegistries)
        console.log(keys)
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

        window.addEventListener('keydown', this.eventListenerForKeyDown)
    }
})();
