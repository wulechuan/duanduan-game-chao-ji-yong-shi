window.duanduanGameChaoJiYongShi.classes.KeyboardEngine = (function () {
    return function KeyboardEngine(initOptions) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 KeyboardEngine 构造函数。')
        }

        this.el = {
            eventHostElement: document,
        }

        this.data = {
            keyRegistries: null,
        }

        this.status = {
            isRunning: false,
        }


        this.start                  = start                 .bind(this)
        this.stop                   = stop                  .bind(this)
        this.destroy                = destroy               .bind(this)
        this.eventHandlerForKeyDown = eventHandlerForKeyDown.bind(this)
        this.eventHandlerForKeyUp   = eventHandlerForKeyUp  .bind(this)


        const thisKeyboardEngine = this


        this.fireFoxEventsHandler = function (event) { event.preventDefault() }
        window.addEventListener('keydown', this.fireFoxEventsHandler)
        window.addEventListener('keyup',   this.fireFoxEventsHandler)


        this.eventListenerForKeyDown = function (event) {
            // 该函数没有 bind this 对象。故意保留事件侦听函数原本的 this 对象。
            event.stopPropagation()

            const { key } = event
            // console.log('按键引擎监测到键被按下：', key)

            if (!key.match(/^F\d{1,2}$/)) {
                event.preventDefault() // 火狐浏览器必须使用这一句。
                thisKeyboardEngine.eventHandlerForKeyDown(key)
            }

        }

        this.eventListenerForKeyUp = function (event) {
            // 该函数没有 bind this 对象。故意保留事件侦听函数原本的 this 对象。
            event.stopPropagation()

            const { key } = event
            // console.log('按键引擎监测到键被松开：', key)

            if (!key.match(/^F\d{1,2}$/)) {
                event.preventDefault() // 火狐浏览器必须使用这一句。
                thisKeyboardEngine.eventHandlerForKeyUp(event.key)
            }
        }
    }

    function eventHandlerForKeyDown(key) {
        const upperCaseKey = key.toUpperCase()
        const matchedAction = this.data.keyRegistries.keyDown[upperCaseKey]
        matchedAction && matchedAction()
    }

    function eventHandlerForKeyUp(key) {
        const upperCaseKey = key.toUpperCase()
        const matchedAction = this.data.keyRegistries.keyUp[upperCaseKey]
        matchedAction && matchedAction()
    }

    function start(keyRawRegistries, requester) {
        function processOneTypeOfEventRegisters(rawReg) {
            if (!rawReg || typeof rawReg !== 'object') { return }

            const keys = Object.keys(rawReg)
            if (keys.length === 0) { return }

            const validRegistries = keys.reduce((validReg, key) => {
                const providedAction = rawReg[key]

                if (providedAction) {
                    if (typeof providedAction !== 'function') {
                        throw new TypeError('注册按键的动作必须使用一个函数。')
                    }

                    validReg[key] = providedAction
                }

                return validReg
            }, {})

            return validRegistries
        }



        if (!keyRawRegistries || typeof keyRawRegistries !== 'object') {
            console.log('没有指定新的按键侦听配置。遂将沿用旧有配置。')
        } else {
            const { keyDown: rawKeyDown, keyUp: rawKeyUp } = keyRawRegistries
            // console.log('rawKeyDown', rawKeyDown)
            // console.log('rawKeyUp',   rawKeyUp)

            const validRegistriesForKeyDown = processOneTypeOfEventRegisters(rawKeyDown)
            const validRegistriesForKeyUp   = processOneTypeOfEventRegisters(rawKeyUp)

            if (!validRegistriesForKeyDown && !validRegistriesForKeyUp) {
                throw new TypeError('没有指定任何有效的按键侦听配置。')
            }

            const validRegistries = {}

            if (validRegistriesForKeyDown) {
                validRegistries.keyDown = validRegistriesForKeyDown
            }

            if (validRegistriesForKeyUp) {
                validRegistries.keyUp = validRegistriesForKeyUp
            }

            this.data.keyRegistries = validRegistries
        }


        if (!this.data.keyRegistries) {
            throw new ReferenceError('从未配置过按键侦听引擎。')
        }


        this.stop()

        const {
            eventHostElement,
        } = this.el

        const {
            keyDown,
            keyUp,
        } = this.data.keyRegistries

        if (keyDown) {
            eventHostElement.addEventListener('keydown', this.eventListenerForKeyDown)
        }

        if (keyUp) {
            eventHostElement.addEventListener('keyup', this.eventListenerForKeyUp)
        }

        this.status.isRunning = true
        let currentServiceInfo = !requester ? '' : `服务于“${requester}”。`
        console.log('按键侦听引擎已经启动。', currentServiceInfo)
    }

    function stop() {
        if (this.status.isRunning) {
            const {
                eventHostElement,
            } = this.el

            eventHostElement.removeEventListener('keydown', this.eventListenerForKeyDown)
            eventHostElement.removeEventListener('keyup',   this.eventListenerForKeyUp)

            this.status.isRunning = false
            console.log('按键侦听引擎已经停止。')
        }
    }

    function destroy() {
        window.removeEventListener('keydown', this.fireFoxEventsHandler)
        window.removeEventListener('keyup',   this.fireFoxEventsHandler)
    }
})();
