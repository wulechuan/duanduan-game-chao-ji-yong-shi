window.duanduanGameChaoJiYongShi.classes.GameFighterPicker = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils } = app

    const {
        randomPositiveIntegerLessThan,
        createDOMWithClassNames,
    } = utils
    
    return function GameFighterPicker(playerId, initOptions) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameFighterPicker 构造函数。')
        }

        let {
            keyForPickingPrevCandidate,
            keyForPickingNextCandidate,
        } = initOptions

        const {
            gameRoleCandidates,
            keyForStoppingRollingRoles,
            shouldNotAutoRoll,
        } = initOptions

        if (typeof keyForStoppingRollingRoles !== 'string') {
            throw new TypeError('keyForStoppingRollingRoles 字符串值，且必须为单个字符。')
        } else if (keyForStoppingRollingRoles.length !== 1) {
            throw new RangeError('keyForStoppingRollingRoles 字符串仅允许包含单个字符。')
        }

        if (!shouldNotAutoRoll && (keyForPickingPrevCandidate === undefined || keyForPickingPrevCandidate === null)) {
            keyForPickingPrevCandidate = undefined
        } else {
            if (typeof keyForPickingPrevCandidate !== 'string') {
                throw new TypeError('keyForPickingPrevCandidate 字符串值，且必须为单个字符。')
            } else if (keyForPickingPrevCandidate.length !== 1) {
                throw new RangeError('keyForPickingPrevCandidate 字符串仅允许包含单个字符。')
            }
        }


        if (!shouldNotAutoRoll && (keyForPickingNextCandidate === undefined || keyForPickingNextCandidate === null)) {
            keyForPickingNextCandidate = undefined
        } else {
            if (typeof keyForPickingNextCandidate !== 'string') {
                throw new TypeError('keyForPickingNextCandidate 字符串值，且必须为单个字符。')
            } else if (keyForPickingNextCandidate.length !== 1) {
                throw new RangeError('keyForPickingNextCandidate 字符串仅允许包含单个字符。')
            }
        }

        this.data = {
            playerId,

            keyForStoppingRollingRoles,
            keyForPickingPrevCandidate,
            keyForPickingNextCandidate,

            fighter: {
                candidates: gameRoleCandidates,
                arrayIndexOfCurrentCandidate: 0,
                decidedCandidate: null,
                decidedRoleConfig: null,
            },
        }

        this.status = {
            isRollingRoles: false,
            rollingIntervalId: NaN,
            fighterHasDecided: false,
            shouldNotAutoRoll: !!shouldNotAutoRoll,
        }

        this.startPickingFighter      = startPickingFighter     .bind(this)
        this.startRollingRoles        = startRollingRoles       .bind(this)
        this.stopRollingRoles         = stopRollingRoles        .bind(this)
        this.pickOneCandidate         = pickOneCandidate        .bind(this)
        this.pickOneCandidateRandomly = pickOneCandidateRandomly.bind(this)
        this.decideFighter            = decideFighter           .bind(this)

        _init.call(this)

        console.log('【游戏角色选择器】创建完毕。')
    }



    function _init() {
        _createDOMs.call(this)
        this.pickOneCandidateRandomly()
    }
    
    function _createDOMs() {
        const {
            playerId,
            keyForStoppingRollingRoles,
            keyForPickingPrevCandidate,
            keyForPickingNextCandidate,
            fighter,
        } = this.data
        
        const {
            candidates: fighterCandidates,
        } = fighter

        const rootElement = createDOMWithClassNames('div', [
            'role-candidates-slot',
            `player-${playerId}`,
        ])

        const keyboardTipsContainerElement = createDOMWithClassNames('div', [
            'keyboard-tips',
        ])

        const keyboardTipElement1 = createDOMWithClassNames('div', [
            'keyboard-tip',
            'decision-maker',
        ])

        const keyboardTipElement2 = createDOMWithClassNames('div', [
            'keyboard-tip',
            'pick-prev-candidate',
        ])

        const keyboardTipElement3 = createDOMWithClassNames('div', [
            'keyboard-tip',
            'pick-next-candidate',
        ])

        keyboardTipElement1.innerText = keyForStoppingRollingRoles

        if (keyForPickingPrevCandidate) {
            keyboardTipElement2.innerText = keyForPickingPrevCandidate
        } else {
            keyboardTipElement2.style.display = 'none'
        }

        if (keyForPickingNextCandidate) {
            keyboardTipElement3.innerText = keyForPickingNextCandidate
        } else {
            keyboardTipElement3.style.display = 'none'
        }

        keyboardTipsContainerElement.appendChild(keyboardTipElement1)
        keyboardTipsContainerElement.appendChild(keyboardTipElement2)
        keyboardTipsContainerElement.appendChild(keyboardTipElement3)

        rootElement.appendChild(keyboardTipsContainerElement)

        fighterCandidates.forEach(fc => rootElement.appendChild(fc.el.root))

        this.el = {
            root: rootElement,
        }
    }

    function startPickingFighter() {
        if (this.status.shouldNotAutoRoll) {
            console.warn('暂未实现手工选择战士的功能！')
        } else {
            this.startRollingRoles()
        }
    }

    function startRollingRoles(intervalInMilliseconds) {
        intervalInMilliseconds = Math.floor(intervalInMilliseconds)
        if (!intervalInMilliseconds || intervalInMilliseconds < 10) {
            intervalInMilliseconds = 125
        }

        const { status } = this
        if (status.isRollingRoles) { return }

        status.isRollingRoles = true
        status.rollingIntervalId = setInterval(() => {
            this.pickOneCandidateRandomly()
        }, intervalInMilliseconds)
    }

    function stopRollingRoles() {
        const { status } = this
        if (!status.isRollingRoles) { return }

        clearInterval(status.rollingIntervalId)
        status.rollingIntervalId = NaN
        status.isRollingRoles = false

        return this.decideFighter()
    }

    function pickOneCandidate(arrayNewIndex) {
        const {
            fighter,
            fighter: {
                candidates,
                arrayIndexOfCurrentCandidate: arrayOldIndex,
            },
        } = this.data

        arrayNewIndex = Math.floor(arrayNewIndex)

        if (!(arrayNewIndex >= 0 && arrayNewIndex < candidates.length)) {
            console.warn(`玩家 ${this.data.playerId} 的角色候选人索引越界。`)
            return
        }

        if (this.status.fighterHasDecided) {
            console.warn(`玩家 ${this.data.playerId} 的角色已经选定了，不能再改。`)
            return
        }

        if (arrayOldIndex === arrayNewIndex) {
            return
        }
        
        fighter.arrayIndexOfCurrentCandidate = arrayNewIndex

        candidates.forEach((c, i) => {
            if (i === arrayNewIndex) {
                c.showUp()
            } else {
                c.leaveAndHide()
            }
        })
    }

    function pickOneCandidateRandomly() {
        this.pickOneCandidate(
            randomPositiveIntegerLessThan(this.data.fighter.candidates.length)
        )
    }

    function decideFighter() {
        if (this.status.fighterHasDecided) {
            return fighter.decidedRoleConfig
        }

        const { fighter } = this.data
        const decidedCandidate = fighter.candidates[fighter.arrayIndexOfCurrentCandidate]

        fighter.decidedCandidate  = decidedCandidate
        fighter.decidedRoleConfig = decidedCandidate.roleConfig

        this.status.fighterHasDecided = true

        return fighter.decidedRoleConfig
    }
})();
