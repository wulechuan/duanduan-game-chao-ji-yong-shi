window.duanduanGameChaoJiYongShi.classes.GameRole = (function () {
    const gameRoleAllPossiblePoseCSSClassNames = [
        'is-moving-leftwards',
        'is-moving-rightwards',
        'is-attacking',
        'is-defencing',
        'is-suffering',
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

        // const {
        //     initialPositionLeft,
        // } = initOptions

        this.logString = `玩家 ${playerId} 的【${name}】`
        this.displayString = `玩家 ${playerId} 的【${name}】`

        this.subComponents = {}

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
            isFacingLeftwards: false,

            hasLost: false, // 输了自己所加入的那一局

            isMovingLeftwards: false,
            isMovingRightwards: false,

            movementDeltaPerInterval: 10, // % instead of px

            movementInterval: 200, // milliseconds
            movementIntervalId: NaN,

            isInAttackingMode: false,
            attackingPoseDuration: 180,
            attackingPoseTimerId: NaN,

            isInDefencingMode: false,
            isActualDefencing: false,
            continuousSuffersCountBeforeDisablingDefence: 5,

            continuousSuffersCount: 0,

            countOfContinuousWeakAttacksIvReceived: 0,
            allowToDeSe: true,
            minTimeSpanBetweenTwoDeSe: 5015, // milliseconds
        }


        this.joinGameRound          = joinGameRound         .bind(this)
        this.faceLeftwards          = faceLeftwards         .bind(this)
        this.faceRightwards         = faceRightwards        .bind(this)
        this.setPoseTo              = setPoseTo             .bind(this)
        this.showEffects            = showEffects           .bind(this)

        this.stopAllPossibleActions = stopAllPossibleActions.bind(this)

        this.startMovingLeftwards   = startMovingLeftwards  .bind(this)
        this.startMovingRightwards  = startMovingRightwards .bind(this)
        this.stopMovingLeftwards    = stopMovingLeftwards   .bind(this)
        this.stopMovingRightwards   = stopMovingRightwards  .bind(this)
        this.enterAttackMode        = enterAttackMode       .bind(this)
        this.quitAttackMode         = quitAttackMode        .bind(this)
        this.enterDefenceMode       = enterDefenceMode      .bind(this)
        this.quitDefenceMode        = quitDefenceMode       .bind(this)

        this.win                    = win                   .bind(this)
        this.lose                   = lose                  .bind(this)
        this.cheat                  = cheat                 .bind(this)

        this.$suffer                = $suffer               .bind(this)


        _init.call(this, initOptions)

        console.log(`${this.logString}创建完毕。`)
    }



    function _init(initOptions) {
        _createKeyboardEngineConfig.call(this, initOptions)
        _createDOMs                .call(this)

        const {
            initialPositionLeft = '25%',
        } = initOptions

        this.el.locator1.style.left = initialPositionLeft
        this.el.locator2.style.left = initialPositionLeft

        this.showEffects('')
        this.setPoseTo('')
    }

    function _createDOMs() {
        const {
            playerId,
            // typeIdInFilePathAndCSSClassName,
            images: {
                poses,
            },
        } = this.data

        const rootElement1 = createDOMWithClassNames('div', [
            `player-${playerId}`,
            'role',
        ])

        const rootElement2 = createDOMWithClassNames('div', [
            `player-${playerId}`,
            'role',
        ])

        const locatorElement1 = createDOMWithClassNames('div', [
            'locator',
        ])

        const locatorElement2 = createDOMWithClassNames('div', [
            'locator',
        ])

        const theLooksElement = createDOMWithClassNames('div', [
            'role-looks',
            // `role-candidate-${typeIdInFilePathAndCSSClassName}`,
        ])

        const effectElementOfDefencing = createDOMWithClassNames('div', [
            'effects',
            'is-defencing',
        ])

        const popupsContainerElement = createDOMWithClassNames('div', [
            'popups',
        ])

        theLooksElement.style.backgroundImage = `url(${poses['default'].filePath})`

        theLooksElement.appendChild(effectElementOfDefencing)

        locatorElement1.appendChild(theLooksElement)
        locatorElement2.appendChild(popupsContainerElement)
        
        rootElement1.appendChild(locatorElement1)
        rootElement2.appendChild(locatorElement2)

        this.el = {
            root:  rootElement1,
            root2: rootElement2,
            locator1: locatorElement1,
            locator2: locatorElement2,
            popupsContainer: popupsContainerElement,
            theLooks: theLooksElement,
            effects: {
                'is-defencing': effectElementOfDefencing,
            },
        }


        const keyboardTipsElement = createDOMWithClassNames('div', [
            'keyboard-tips',
        ])

        rootElement1.appendChild(keyboardTipsElement)

        const {
            keyboardHintForMovingLeftwards,
            keyboardHintForMovingRightwards,
            keyboardHintForAttack,
            keyboardHintForDefence,
        } = this.subComponents

        keyboardTipsElement.appendChild(keyboardHintForMovingLeftwards.el.root)
        keyboardTipsElement.appendChild(keyboardHintForMovingRightwards.el.root)
        keyboardTipsElement.appendChild(keyboardHintForAttack.el.root)
        keyboardTipsElement.appendChild(keyboardHintForDefence.el.root)
    }

    function _createKeyboardEngineConfig(options) {
        if (!options || typeof options !== 'object') { return }

        const {
            keyForMovingLeftwards,
            keyForMovingRightwards,
            keyForAttack,
            keyForDefence,
            keyForCheating,
        } = options

        const { KeyboardHint } = classes

        const keyboardHintForMovingLeftwards = new KeyboardHint({
            keyName: keyForMovingLeftwards,
            keyDescription: '向左',
        })

        const keyboardHintForMovingRightwards = new KeyboardHint({
            keyName: keyForMovingRightwards,
            keyDescription: '向右',
        })

        const keyboardHintForAttack = new KeyboardHint({
            keyName: keyForAttack,
            keyDescription: '进攻',
        })

        const keyboardHintForDefence = new KeyboardHint({
            keyName: keyForDefence,
            keyDescription: '防御',
        })

        this.subComponents.keyboardHintForMovingLeftwards = keyboardHintForMovingLeftwards
        this.subComponents.keyboardHintForMovingRightwards = keyboardHintForMovingRightwards
        this.subComponents.keyboardHintForAttack = keyboardHintForAttack
        this.subComponents.keyboardHintForDefence = keyboardHintForDefence

        const { data } = this

        data.keyboardMapping = {
            keyForMovingLeftwards,
            keyForMovingRightwards,
            keyForAttack,
            keyForDefence,
            keyForCheating,
        }

        const keyboardEngineKeyDownConfig = {
            [keyForMovingLeftwards]:  this.startMovingLeftwards,
            [keyForMovingRightwards]: this.startMovingRightwards,
            [keyForAttack]:           this.enterAttackMode,
            [keyForDefence]:          this.enterDefenceMode,
            [keyForCheating]:         this.cheat,
        }

        const keyboardEngineKeyUpConfig = {
            [keyForMovingLeftwards]:  this.stopMovingLeftwards,
            [keyForMovingRightwards]: this.stopMovingRightwards,
            [keyForAttack]:           this.quitAttackMode,
            [keyForDefence]:          this.quitDefenceMode,
        }

        data.keyboardEngineKeyDownConfig = keyboardEngineKeyDownConfig
        data.keyboardEngineKeyUpConfig   = keyboardEngineKeyUpConfig
    }

    function joinGameRound(gameRound) {
        const { GameRound } = classes

        if (!(gameRound instanceof GameRound)) {
            throw new TypeError('【角色】只能加入 GameRound 的实例对象。')
        }

        this.joinedGameRound = gameRound
    }

    function cheat() {
        const cheatingAttacksCount = Math.floor(Math.random() * 515)
        this.joinedGameRound.cheatedBy(this, cheatingAttacksCount)
    }

    function faceLeftwards() {
        if (this.status.isFacingLeftwards) { return }
        this.status.isFacingLeftwards = true
        this.el.root.classList.add('should-face-leftwards')
    }

    function faceRightwards() {
        if (!this.status.isFacingLeftwards) { return }
        this.status.isFacingLeftwards = false
        this.el.root.classList.remove('should-face-leftwards')
    }

    function setPoseTo(poseCSSClassNameToApply) {
        if (this.status.hasLost && poseCSSClassNameToApply !== 'has-lost') { return }

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

    function showEffects(propertyNameOfEffectsToShow) {
        const effectsElements = this.el.effects
        const allPossibleEffectsNames = Object.keys(effectsElements)

        allPossibleEffectsNames.forEach(effectsPropertyName => {
            const el = effectsElements[effectsPropertyName]
            if (effectsPropertyName === propertyNameOfEffectsToShow) {
                el.style.display = ''
            } else {
                el.style.display = 'none'
            }
        })
    }

    function _isNotTakingAnyAction() {
        const {
            isMovingLeftwards,
            isMovingRightwards,
            isInAttackingMode,
            isInDefencingMode,
        } = this.status
        return !isMovingLeftwards && !isMovingRightwards && !isInAttackingMode && !isInDefencingMode
    }

    function _takeAnAction(actionFlagPropertyName, poseName) {
        const { status } = this
        const actionIsAllowed = _isNotTakingAnyAction.call(this) && !status.hasLost

        if (actionIsAllowed) {
            status[actionFlagPropertyName] = true
            this.setPoseTo(poseName)
            // console.log(`玩家 ${this.data.playerId}`, actionFlagPropertyName)
        }

        return actionIsAllowed
    }

    function _makeOneMovement(shouldMoveLeftwards) {
        const {
            movementDeltaPerInterval,
        } = this.status

        const locator1ElementStyle = this.el.locator1.style
        const locator2ElementStyle = this.el.locator2.style

        const oldLeft = parseInt(locator1ElementStyle.left, 10)

        const step = (Math.random() * 0.2 + 0.8) * movementDeltaPerInterval
        const desiredNewLeft = oldLeft + step * (shouldMoveLeftwards ? -1 : 1)

        const decidedNewLeft = Math.min(100, Math.max(0, desiredNewLeft))
        // console.log('oldLeft', oldLeft, 'desiredNewLeft', desiredNewLeft, 'decidedNewLeft', decidedNewLeft)

        locator1ElementStyle.left = `${decidedNewLeft}%`
        locator2ElementStyle.left = `${decidedNewLeft}%`
    }

    function startMovingLeftwards() {
        if (_takeAnAction.call(this, 'isMovingLeftwards', 'is-moving-leftwards')) {
            const { status } = this

            if (!status.isFacingLeftwards) {
                this.faceLeftwards()
            } else {
                _makeOneMovement.call(this, true)
    
                status.movementIntervalId = setInterval(() => {
                    _makeOneMovement.call(this, true)
                }, status.movementInterval)
            }
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

            if (status.isFacingLeftwards) {
                this.faceRightwards()
            } else {
                _makeOneMovement.call(this, false)
    
                status.movementIntervalId = setInterval(() => {
                    _makeOneMovement.call(this, false)
                }, status.movementInterval)
            }
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

    function enterAttackMode() {
        if (_takeAnAction.call(this, 'isInAttackingMode', 'is-attacking')) {
            this.joinedGameRound.acceptOneAttackFromPlayer({
                attackerPlayerId: this.data.playerId,
            })

            const { status } = this
            status.attackingPoseTimerId = setTimeout(() => {
                this.setPoseTo('')
            }, Math.floor(status.attackingPoseDuration))
        }
    }

    function quitAttackMode() {
        const { status } = this
        if (!status.isInAttackingMode) { return }

        if (status.attackingPoseTimerId) {
            clearTimeout(status.attackingPoseTimerId)
            status.attackingPoseTimerId = NaN
        }

        this.setPoseTo('')

        status.isInAttackingMode = false
    }

    function enterDefenceMode() {
        if (_takeAnAction.call(this, 'isInDefencingMode', 'is-defencing')) {
            const { status } = this
            status.isActualDefencing = true
            status.continuousSuffersCount = 0
            this.showEffects('is-defencing')
            this.setPoseTo('is-defencing')
        }
    }

    function quitDefenceMode() {
        const { status } = this
        if (!status.isInDefencingMode) { return }
        status.isInDefencingMode = false
        status.isActualDefencing = true
        status.continuousSuffersCount = 0
        this.showEffects('')
        this.setPoseTo('')
    }

    function $suffer(desiredHPDecrease) {
        const { status, data } = this

        const oldHP = data.healthPoint
        const actualHPDecrease = Math.min(oldHP, desiredHPDecrease)

        const newHP = oldHP - actualHPDecrease
        this.data.healthPoint = newHP

        // console.log(this.logString, '实际扣除', actualHPDecrease, '点血值，变为', newHP)

        status.continuousSuffersCount ++

        if (status.continuousSuffersCount >= status.continuousSuffersCountBeforeDisablingDefence) {
            status.isActualDefencing = false            
            this.showEffects('')
        }


        createOneAutoDisappearPopup.call(this, {
            timingForDisappearing: 2000,
            rootElementExtraCSSClassNames: 'health-point-decrease',
            content: - actualHPDecrease,
        })

        // TODO: console.warn('缺少挨揍的姿态图片和相关的视图变化逻辑')
        // if (!status.isActualDefencing) {
        //     this.setPoseTo('is-suffering')
        // }

        const isAWeakAttack = desiredHPDecrease < data.defencingPower * 0.2
        if (isAWeakAttack) {
            status.countOfContinuousWeakAttacksIvReceived ++
            if (status.countOfContinuousWeakAttacksIvReceived >= 3) {
                setTimeout(_deSe.bind(this), 79)
            }
        }
    }

    function _deSe() { // 嘚瑟
        const { status, data } = this
        const {
            countOfContinuousWeakAttacksIvReceived,
            allowToDeSe,
            minTimeSpanBetweenTwoDeSe,
        } = status

        if (!allowToDeSe) { return }

        const realTimeHP = data.healthPoint
        // console.log('准备嘚瑟了，此时的实际 HP 为' , realTimeHP)
        if (realTimeHP / data.fullHealthPoint < 0.38) { return }


        status.allowToDeSe = false
        setTimeout(() => {
            status.allowToDeSe = true
        }, minTimeSpanBetweenTwoDeSe)

        const wordsCandidates = [
            `你太弱了！连续攻击了我 ${countOfContinuousWeakAttacksIvReceived} 次，<br>对我也没什么伤害！哈哈哈哈！`,
            '使劲儿打呀，我的小绵羊！',
            '你就这点本事吗？哈哈哈哈！',
            '你是哪位“名师”指的出来&nbsp;<br>的“高徒”？哈哈哈哈！',
            '够了！别再给我挠痒痒了！',
            '哼！没用的家伙！',
        ]

        const words = wordsCandidates[Math.floor(Math.random() * wordsCandidates.length)]

        this.status.countOfContinuousWeakAttacksIvReceived = 0

        // console.log(`${this.logString}：“${words}”`)

        createOneAutoDisappearPopup.call(this, {
            timingForDisappearing: 5100,
            rootElementExtraCSSClassNames: 'words',
            content: _createContentForWords.call(this, words),
        })
    }

    function stopAllPossibleActions() {
        this.quitAttackMode()
        this.quitDefenceMode()
        this.stopMovingLeftwards()
        this.stopMovingRightwards()
    }

    function createOneAutoDisappearPopup(options) {
        const {
            timingForDisappearing,
            rootElementExtraCSSClassNames,
            content,
            noInlineCSSPositioning,
        } = options

        const { AutoDisappearPopup } = classes

        const inlineCSSPositioning = {}

        if (!noInlineCSSPositioning) {
            const rootElementLeftRatio   = (Math.random() * 0.5 - 0.2).toFixed(2)
            const rootElementBottomRatio = (Math.random() * 0.5 + 0.32).toFixed(2)
    
            inlineCSSPositioning.left   = `calc( var(--fighter-visual-box-width ) * ${rootElementLeftRatio})`
            inlineCSSPositioning.bottom = `calc( var(--fighter-visual-box-height) * ${rootElementBottomRatio})`
        }

        new AutoDisappearPopup(
            this.el.popupsContainer,
            {
                timingForDisappearing,
                rootElementExtraCSSClassNames,
                rootElementStyle: inlineCSSPositioning,
                content,
            }
        )
    }

    function _createContentForWords(words) {
        return [
            `<div class="player-id">${this.data.playerId}</div>`,
            '<div class="avatar"',
            ` style="background-image: url('${this.data.images.avatar.filePath}');"`,
            `></div>`,
            `<span>${words}</span>`,
        ].join('')
    }

    function win() {
        this.stopAllPossibleActions()
        this.setPoseTo('has-won')
        this.el.root.classList.add('has-won')

        const wordsCandidates = [
            '你真是弱爆了！',
            '回去再练几年吧！',
            '就你这水平还跟我较量？<br>哼！不自量力！',
            '我是无敌的！',
            '很可惜你今天遇到的是我！哼。',
            '我这个人在战场上是从来不给敌人留情面的！',
            '真想尝尝失败的滋味啊！哈哈哈哈！',
        ]

        const words = wordsCandidates[Math.floor(Math.random() * wordsCandidates.length)]
        console.log(`${this.logString}：“${words}”`)

        createOneAutoDisappearPopup.call(this, {
            timingForDisappearing: 12280,
            rootElementExtraCSSClassNames: 'words winning-words',
            content: _createContentForWords.call(this, words),
            noInlineCSSPositioning: true,
        })
    }

    function lose() {
        this.stopAllPossibleActions()
        this.setPoseTo('has-lost')
        this.el.root.classList.add('has-lost')
        this.status.hasLost = true

        const wordsCandidates = [
            '我一定会报仇的！',
            '今日一战是我的耻辱！',
            '君子报仇，十年不晚！',
            '我要卧薪尝胆！',
            '总有一天我会夺回荣耀！',
        ]

        const words = wordsCandidates[Math.floor(Math.random() * wordsCandidates.length)]
        console.log(`${this.logString}：“${words}”`)

        createOneAutoDisappearPopup.call(this, {
            timingForDisappearing: 12280,
            rootElementExtraCSSClassNames: 'words last-words',
            content: _createContentForWords.call(this, words),
            noInlineCSSPositioning: true,
        })
    }
})();
