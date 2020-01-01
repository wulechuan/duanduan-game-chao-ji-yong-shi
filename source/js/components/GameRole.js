window.duanduanGameChaoJiYongShi.classes.GameRole = (function () {
    const gameRoleAllPossiblePoseCSSClassNames = [
        'is-attacking',
        'is-suffering',
        'has-won',
        'has-lost',
    ]


    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes } = app
    const { createDOMWithClassNames } = utils

    return function GameRole(game, playerId, gameRoleConfig, initOptions) {
        const { Game } = classes

        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameRole 构造函数。')
        }

        if (!(game instanceof Game)) {
            throw new TypeError('创建【游戏角色】时，必须指明其应隶属于哪个【游戏】。')
        }

        if (game.status.isOver) {
            throw new Error('【游戏】已经结束。不能为已经结束的【游戏】创建【游戏角色】。')
        }



        this.game = game
        this.gameRoleConfig = gameRoleConfig
        this.joinedGameRound = null

        const {
            name,
            typeIdInFilePathAndCSSClassName,
            fullHealthPoint,
            attackingPower,
            defencingPower,
            images,
        } = gameRoleConfig

        this.logString = `玩家 ${playerId} 的【游戏角色】“${name}”`

        this.data = {
            playerId,
            name,
            typeIdInFilePathAndCSSClassName,
            fullHealthPoint,
            healthPoint: fullHealthPoint,
            attackingPower,
            defencingPower,
            images,

            keyboardMapping: null,             // 动作称呼 映射到 具体按键，用于对应到 DOM 的 innerText
            keyboardEngineKeyDownConfig: null, // 具体按键 映射到 具体动作，用于配置按键引擎
            keyboardEngineKeyUpConfig:   null, // 具体按键 映射到 具体动作，用于配置按键引擎
        }

        this.status = {
            isMovingLeftwards: false,
            isMovingRightwards: false,
            movementDeltaPerInterval: 30, // pixels
            movementInterval: 200, // milliseconds
            movementIntervalId: NaN,

            isAttacking: false,
            attackInterval: 500, // milliseconds
            attackIntervalId: NaN,
            attackHalfIntervalTimerId: NaN,

            isDefencing: false,
        }


        this.updateKeyboardEngineConfig = updateKeyboardEngineConfig.bind(this)
        this.createKeyboardEngineConfig = this.updateKeyboardEngineConfig

        this.joinGameRound              = joinGameRound             .bind(this)
        this.setPoseTo                  = setPoseTo                 .bind(this)

        this.startMovingLeftwards       = startMovingLeftwards      .bind(this)
        this.startMovingRightwards      = startMovingRightwards     .bind(this)
        this.stopMovingLeftwards        = stopMovingLeftwards       .bind(this)
        this.stopMovingRightwards       = stopMovingRightwards      .bind(this)
        this.startAttack                = startAttack               .bind(this)
        this.stopAttack                 = stopAttack                .bind(this)
        this.startDefence               = startDefence              .bind(this)
        this.stopDefence                = stopDefence               .bind(this)
        this.$suffer                    = $suffer                   .bind(this)

        this.win                        = win                       .bind(this)
        this.lose                       = lose                      .bind(this)


        _init.call(this, initOptions)

        console.log(`${this.logString}”创建完毕。`)
    }



    function _init(initOptions) {
        _createDOMs.call(this)
        this.createKeyboardEngineConfig(initOptions)
    }

    function _createDOMs() {
        const {
            playerId,
            // typeIdInFilePathAndCSSClassName,
            images: {
                poses,
            },
        } = this.data

        const rootElement = createDOMWithClassNames('div', [
            `player-${playerId}`,
            'role',
        ])

        const originElement = createDOMWithClassNames('div', [
            'origin',
        ])

        const locatorElement = createDOMWithClassNames('div', [
            'locator',
        ])
        locatorElement.style.left = '0px'

        const theLooksElement = createDOMWithClassNames('div', [
            'role-looks',
            // `role-candidate-${typeIdInFilePathAndCSSClassName}`,
        ])

        theLooksElement.style.backgroundImage = `url(${poses['default'].filePath})`

        locatorElement.appendChild(theLooksElement)
        originElement.appendChild(locatorElement)
        rootElement.appendChild(originElement)

        this.el = {
            root: rootElement,
            origin: originElement,
            locator: locatorElement,
            theLooks: theLooksElement,
        }


        const keyboardTipsElement = createDOMWithClassNames('div', [
            'keyboard-tips',
        ])

        rootElement.appendChild(keyboardTipsElement)

        ;[
            { keyLabel: '向左', elRefPropertyName: 'keyboardTipForMovingLeftwards' },
            { keyLabel: '向右', elRefPropertyName: 'keyboardTipForMovingRightwards' },
            { keyLabel: '攻击', elRefPropertyName: 'keyboardTipForAttack' },
            { keyLabel: '防御', elRefPropertyName: 'keyboardTipForDefence' },
        ].forEach(({ keyLabel, elRefPropertyName }) => {
            const keyboardTipContainerElement = createDOMWithClassNames('div', [
                'keyboard-tip-container',
            ])

            const keyboardTipElement = createDOMWithClassNames('div', [
                'keyboard-tip',
            ])

            const keyboardTipLabelElement = createDOMWithClassNames('div', [
                'keyboard-tip-label',
            ])

            keyboardTipLabelElement.innerText = keyLabel

            keyboardTipContainerElement.appendChild(keyboardTipLabelElement)
            keyboardTipContainerElement.appendChild(keyboardTipElement)

            keyboardTipsElement.appendChild(keyboardTipContainerElement)

            this.el[elRefPropertyName] = keyboardTipElement
        })
    }

    function updateKeyboardEngineConfig(options) {
        if (!options || typeof options !== 'object') { return }

        const {
            keyForMovingLeftwards,
            keyForMovingRightwards,
            keyForAttack,
            keyForDefence,
        } = options

        const {
            keyboardTipForMovingLeftwards:  keyboardTipForMovingLeftwardsElement,
            keyboardTipForMovingRightwards: keyboardTipForMovingRightwardsElement,
            keyboardTipForAttack:           keyboardTipForAttackElement,
            keyboardTipForDefence:          keyboardTipForDefenceElement,
        } = this.el

        const { data } = this

        data.keyboardMapping = {
            keyForMovingLeftwards,
            keyForMovingRightwards,
            keyForAttack,
            keyForDefence,
        }

        const keyboardEngineKeyDownConfig = {
            [keyForMovingLeftwards]:  this.startMovingLeftwards,
            [keyForMovingRightwards]: this.startMovingRightwards,
            [keyForAttack]:           this.startAttack,
            [keyForDefence]:          this.startDefence,
        }

        const keyboardEngineKeyUpConfig = {
            [keyForMovingLeftwards]:  this.stopMovingLeftwards,
            [keyForMovingRightwards]: this.stopMovingRightwards,
            [keyForAttack]:           this.stopAttack,
            [keyForDefence]:          this.stopDefence,
        }

        data.keyboardEngineKeyDownConfig = keyboardEngineKeyDownConfig
        data.keyboardEngineKeyUpConfig   = keyboardEngineKeyUpConfig

        keyboardTipForMovingLeftwardsElement .innerText = keyForMovingLeftwards
        keyboardTipForMovingRightwardsElement.innerText = keyForMovingRightwards
        keyboardTipForAttackElement          .innerText = keyForAttack
        keyboardTipForDefenceElement         .innerText = keyForDefence
    }

    function joinGameRound(gameRound) {
        const { GameRound } = classes

        if (!(gameRound instanceof GameRound)) {
            throw new TypeError('【角色】只能加入 GameRound 的实例对象。')
        }

        this.joinedGameRound = gameRound
    }

    function setPoseTo(poseCSSClassNameToApply) {
        const {
            root: rootElement,
            theLooks: theLooksElement,
        } = this.el

        const rootElementClassList = rootElement.classList

        gameRoleAllPossiblePoseCSSClassNames.forEach(poseCSSClassName => {
            if (poseCSSClassName !== poseCSSClassNameToApply && rootElementClassList.contains(poseCSSClassName)) {
                rootElementClassList.remove(poseCSSClassName)
            }
        })

        if (poseCSSClassNameToApply && !rootElementClassList.contains(poseCSSClassNameToApply)) {
            rootElementClassList.add(poseCSSClassNameToApply)
        }

        const { poses } = this.data.images
        const poseConfig = poses[poseCSSClassNameToApply]

        if (poseConfig) {
            // console.log(`className: "${poseCSSClassNameToApply}"; imageFilePath: "${poseConfig.filePath}"`)
            theLooksElement.style.backgroundImage = `url(${poseConfig.filePath})`
        } else if (!poseCSSClassNameToApply) {
            theLooksElement.style.backgroundImage = `url(${poses.default.filePath})`
        }
    }

    function _isNotTakingAnyAction() {
        const {
            isMovingLeftwards,
            isMovingRightwards,
            isAttacking,
            isDefencing,
        } = this.status
        return !isMovingLeftwards && !isMovingRightwards && !isAttacking && !isDefencing
    }

    function _takeAnAction(actionFlagPropertyName, poseName) {
        const actionIsAllowed = _isNotTakingAnyAction.call(this)

        if (actionIsAllowed) {
            this.status[actionFlagPropertyName] = true
            this.setPoseTo(poseName)
            // console.log(`玩家 ${this.data.playerId}`, actionFlagPropertyName)
        }

        return actionIsAllowed
    }

    function _makeOneMovement(shouldMoveLeftwards) {
        const locatorElementStyle = this.el.locator.style
        const oldLeft = parseInt(locatorElementStyle.left)
        const newLeft = oldLeft + this.status.movementDeltaPerInterval * (shouldMoveLeftwards ? -1 : 1)
        locatorElementStyle.left = `${newLeft}px`
    }

    function startMovingLeftwards() {
        if (_takeAnAction.call(this, 'isMovingLeftwards', 'is-moving-leftwards')) {
            const { status } = this

            _makeOneMovement.call(this, true)

            status.movementIntervalId = setInterval(() => {
                _makeOneMovement.call(this, true)
            }, status.movementInterval)
        }
    }

    function stopMovingLeftwards() {
        const { status } = this
        if (!status.isMovingLeftwards) { return }
        clearInterval(status.movementIntervalId)
        status.movementIntervalId = NaN
        status.isMovingLeftwards = false
        this.setPoseTo('')
    }

    function startMovingRightwards() {
        if (_takeAnAction.call(this, 'isMovingRightwards', 'is-moving-rightwards')) {
            const { status } = this

            _makeOneMovement.call(this, false)

            status.movementIntervalId = setInterval(() => {
                _makeOneMovement.call(this, false)
            }, status.movementInterval)
        }
    }

    function stopMovingRightwards() {
        const { status } = this
        if (!status.isMovingRightwards) { return }
        clearInterval(status.movementIntervalId)
        status.movementIntervalId = NaN
        status.isMovingRightwards = false
        this.setPoseTo('')
    }

    function startAttack() {
        if (_takeAnAction.call(this, 'isAttacking', 'is-attacking')) {
            const { status } = this
            status.attackIntervalId = setInterval(() => {
                this.setPoseTo('')

                if (status.attackHalfIntervalTimerId) {
                    clearTimeout(status.attackHalfIntervalTimerId)
                    status.attackHalfIntervalTimerId = NaN
                }

                status.attackHalfIntervalTimerId = setTimeout(() => {
                    this.setPoseTo('is-attacking')
                }, Math.floor(status.attackInterval / 2))
            }, status.attackInterval)
        }
    }

    function stopAttack() {
        const { status } = this
        if (!status.isAttacking) { return }
        clearInterval(status.attackIntervalId)
        status.attackIntervalId = NaN

        if (status.attackHalfIntervalTimerId) {
            clearTimeout(status.attackHalfIntervalTimerId)
            status.attackHalfIntervalTimerId = NaN
        }

        status.isAttacking = false
        this.setPoseTo('')
    }

    function startDefence() {
        if (_takeAnAction.call(this, 'isDefencing', 'is-defencing')) {
            // Nothing more.
        }
    }

    function stopDefence() {
        const { status } = this
        if (!status.isDefencing) { return }
        status.isDefencing = false
        this.setPoseTo('')
    }

    function $suffer(hpDecreasement) {
        const oldHP = this.data.healthPoint
        const newHP = Math.max(0, oldHP - hpDecreasement)
        this.data.healthPoint = newHP
    }

    function _stopAllPossibleActions() {
        this.stopAttack()
        this.stopDefence()
        this.stopMovingLeftwards()
        this.stopMovingRightwards()
    }

    function win() {
        _stopAllPossibleActions.call(this)
        this.setPoseTo('has-won')
    }

    function lose() {
        _stopAllPossibleActions.call(this)
        this.setPoseTo('has-lost')
    }
})();
