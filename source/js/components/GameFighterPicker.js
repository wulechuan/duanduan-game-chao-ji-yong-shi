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
            keyForStoppingRollingRoles,
        } = initOptions

        const {
            shouldAutoPickFighterByWeights,
            shouldForceRollingEvenIfAutoPickingByWeights,
            shouldManuallyPickFighters,
            gameRoleCandidates,
            onFighterDecided,
        } = initOptions

        const shouldNotAutoRoll = !!shouldManuallyPickFighters || (!!shouldAutoPickFighterByWeights && !shouldForceRollingEvenIfAutoPickingByWeights)

        if (typeof keyForStoppingRollingRoles !== 'string') {
            throw new TypeError('keyForStoppingRollingRoles 字符串值，且必须为单个字符。')
        } else if (keyForStoppingRollingRoles.length !== 1) {
            throw new RangeError('keyForStoppingRollingRoles 字符串仅允许包含单个字符。')
        }

        keyForStoppingRollingRoles = keyForStoppingRollingRoles.toUpperCase()

        if (!shouldManuallyPickFighters && (keyForPickingPrevCandidate === undefined || keyForPickingPrevCandidate === null)) {
            keyForPickingPrevCandidate = undefined
        } else {
            if (typeof keyForPickingPrevCandidate !== 'string') {
                throw new TypeError('keyForPickingPrevCandidate 字符串值，且必须为单个字符。')
            } else if (keyForPickingPrevCandidate.length !== 1) {
                throw new RangeError('keyForPickingPrevCandidate 字符串仅允许包含单个字符。')
            }

            keyForPickingPrevCandidate = keyForPickingPrevCandidate.toUpperCase()
        }


        if (!shouldManuallyPickFighters && (keyForPickingNextCandidate === undefined || keyForPickingNextCandidate === null)) {
            keyForPickingNextCandidate = undefined
        } else {
            if (typeof keyForPickingNextCandidate !== 'string') {
                throw new TypeError('keyForPickingNextCandidate 字符串值，且必须为单个字符。')
            } else if (keyForPickingNextCandidate.length !== 1) {
                throw new RangeError('keyForPickingNextCandidate 字符串仅允许包含单个字符。')
            }

            keyForPickingNextCandidate = keyForPickingNextCandidate.toUpperCase()
        }

        this.data = {
            playerId,

            keyForStoppingRollingRoles,
            keyForPickingPrevCandidate,
            keyForPickingNextCandidate,

            keyboardEngineKeyDownConfig: null,

            fighter: {
                candidatesInOriginalOrder: gameRoleCandidates,
                candidates: [],
                arrayIndexOfCurrentCandidate: NaN,
                decidedCandidate: null,
                decidedRoleConfig: null,
            },
        }

        this.status = {
            shouldManuallyPickFighters:                  !!shouldManuallyPickFighters,
            shouldAutoPickFighterByWeights:               !shouldManuallyPickFighters && !!shouldAutoPickFighterByWeights,
            shouldForceRollingEvenIfAutoPickingByWeights: !shouldManuallyPickFighters && !!shouldForceRollingEvenIfAutoPickingByWeights,
            shouldNotAutoRoll: shouldNotAutoRoll,
            isRollingRoles: false,
            rollingIntervalId: NaN,
            fighterHasDecided: false,
        }

        this.events = {
            onFighterDecided,
        }

        this.updateKeyboardEngineConfig        = updateKeyboardEngineConfig       .bind(this)
        this.createKeyboardEngineConfig        = this.updateKeyboardEngineConfig

        this.startPickingFighter               = startPickingFighter              .bind(this)
        this.startRollingRoles                 = startRollingRoles                .bind(this)
        this.stopRollingRoles                  = stopRollingRoles                 .bind(this)
        this.pickOneCandidate                  = pickOneCandidate                 .bind(this)
        this.pickPrevCandidate                 = pickPrevCandidate                .bind(this)
        this.pickNextCandidate                 = pickNextCandidate                .bind(this)
        this.pickOneCandidateRandomlyByWeights = pickOneCandidateRandomlyByWeights.bind(this)
        this.pickOneCandidateRandomly          = pickOneCandidateRandomly         .bind(this)
        this.decideFighter                     = decideFighter                    .bind(this)

        _init.call(this)

        // console.log('【游戏角色选择器】创建完毕。')
    }



    function _init() {
        _generateWeightedRandomizedCandidates.call(this)
        _createDOMs.call(this)
        this.createKeyboardEngineConfig()

        if (this.status.shouldAutoPickFighterByWeights) {
            this.pickOneCandidateRandomlyByWeights()

            if (!this.status.shouldForceRollingEvenIfAutoPickingByWeights) {
                this.el.root.classList.add('fighter-has-decided')
            }
        } else {
            // this.pickOneCandidateRandomly()
            this.pickOneCandidateRandomlyByWeights()
        }
    }

    function _generateWeightedRandomizedCandidates() {
        const originArray = this.data.fighter.candidatesInOriginalOrder
        const _allRestCandidates = [ ...originArray ]
        const randomizedCandidates = []
        while (_allRestCandidates.length > 0) {
            const pickingIndex = Math.floor(Math.random() * _allRestCandidates.length)
            // console.log('picking', pickingIndex, 'between', 0, _allRestCandidates.length - 1)
            randomizedCandidates.push(
                _allRestCandidates.splice(pickingIndex, 1)[0]
            )
        }

        let accumWeightPointSoFar = 0
        randomizedCandidates.forEach(candidate => {
            accumWeightPointSoFar += candidate.data.selectionWeightDuringAutoRolling
            candidate.data.accumSelectionWeightPoint = accumWeightPointSoFar
        })

        const totalWeightingPoint = accumWeightPointSoFar
        randomizedCandidates.forEach(candidate => {
            candidate.data.normalizedSelectionWeight      = + (candidate.data.selectionWeightDuringAutoRolling / totalWeightingPoint).toFixed(4)
            candidate.data.normalizedAccumSelectionWeight = + (candidate.data.accumSelectionWeightPoint        / totalWeightingPoint).toFixed(4)
        })

        const lastCandidate = randomizedCandidates[randomizedCandidates.length - 1]
        lastCandidate.data.accumSelectionWeightPoint      = totalWeightingPoint
        lastCandidate.data.normalizedAccumSelectionWeight = 1

        // console.log(randomizedCandidates.map(c => [c.data.name, c.data.normalizedAccumSelectionWeight]))

        this.data.fighter.candidates = randomizedCandidates
    }
    
    function _createDOMs() {
        const {
            playerId,
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

        keyboardTipsContainerElement.appendChild(keyboardTipElement1)
        keyboardTipsContainerElement.appendChild(keyboardTipElement2)
        keyboardTipsContainerElement.appendChild(keyboardTipElement3)

        rootElement.appendChild(keyboardTipsContainerElement)

        fighterCandidates.forEach(fc => rootElement.appendChild(fc.el.root))

        this.el = {
            root: rootElement,
            keyboardTipStoppingRollingRoles: keyboardTipElement1,
            keyboardTipPickPrevCandidate: keyboardTipElement2,
            keyboardTipPickNextCandidate: keyboardTipElement3,
        }
    }

    function updateKeyboardEngineConfig() {
        const {
            keyboardTipStoppingRollingRoles,
            keyboardTipPickPrevCandidate,
            keyboardTipPickNextCandidate,
        } = this.el

        const {
            keyForStoppingRollingRoles,
            keyForPickingPrevCandidate,
            keyForPickingNextCandidate,
        } = this.data

        const {
            shouldManuallyPickFighters,
        } = this.status

        const keyboardEngineKeyDownConfig = {}

        if (shouldManuallyPickFighters) {
            keyboardEngineKeyDownConfig[keyForStoppingRollingRoles] = this.decideFighter
        } else {
            keyboardEngineKeyDownConfig[keyForStoppingRollingRoles] = this.stopRollingRoles
        }

        keyboardTipStoppingRollingRoles.innerText = keyForStoppingRollingRoles

        if (shouldManuallyPickFighters && keyForPickingPrevCandidate) {
            keyboardTipPickPrevCandidate.innerText = keyForPickingPrevCandidate
            keyboardTipPickPrevCandidate.style.display = ''
            keyboardEngineKeyDownConfig[keyForPickingPrevCandidate] = this.pickPrevCandidate
        } else {
            keyboardTipPickPrevCandidate.style.display = 'none'
        }

        if (shouldManuallyPickFighters && keyForPickingNextCandidate) {
            keyboardTipPickNextCandidate.innerText = keyForPickingNextCandidate
            keyboardTipPickNextCandidate.style.display = ''
            keyboardEngineKeyDownConfig[keyForPickingNextCandidate] = this.pickNextCandidate
        } else {
            keyboardTipPickNextCandidate.style.display = 'none'
        }

        this.data.keyboardEngineKeyDownConfig = keyboardEngineKeyDownConfig
    }

    function startPickingFighter() {
        const {
            shouldAutoPickFighterByWeights,
            shouldForceRollingEvenIfAutoPickingByWeights,
            shouldNotAutoRoll,
            // shouldManuallyPickFighters,
        } = this.status

        if (shouldAutoPickFighterByWeights) {
            /*
                当考虑选择权重时，随机选择战士的动作没必要执行，仅执行一次即可。
                而为了及时初始化，该唯一的一次选择战士的动作早在 _init 函数中就已经执行了。

                下方的 decideFighter 必须在此处调用，不能提早到 _init 函数中，
                因为过早调用该方法时，其余类（例如 Game 类）或许还没有完成初始化。
            */
            if (!shouldForceRollingEvenIfAutoPickingByWeights) {
                this.decideFighter()
                return
            }
        }

        if (!shouldNotAutoRoll) {
            if (!this.data.keyboardEngineKeyDownConfig) {
                throw new Error('尚未创建【按键引擎】的配置，无法进行人机交互。因此不应启动【战士选择】进程。')
            }

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

        let pickingFunction
        if (this.status.shouldAutoPickFighterByWeights) {
            pickingFunction = this.pickOneCandidateRandomlyByWeights
        } else {
            pickingFunction = this.pickOneCandidateRandomly
        }

        pickingFunction()

        status.isRollingRoles = true
        status.rollingIntervalId = setInterval(() => {
            pickingFunction()
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
            return 'failed'
        }

        if (this.status.fighterHasDecided) {
            console.warn(`玩家 ${this.data.playerId} 的角色已经选定了，不能再改。`)
            return 'rejected'
        }

        // console.log(arrayOldIndex, arrayNewIndex)

        if (arrayOldIndex === arrayNewIndex) {
            return 'nothing-to-do'
        }
        
        fighter.arrayIndexOfCurrentCandidate = arrayNewIndex

        candidates.forEach((c, i) => {
            if (i === arrayNewIndex) {
                c.showUp()
            } else {
                c.leaveAndHide()
            }
        })

        return 'succeeded'
    }

    function _pickCandidateByIndexDelta(indexDelta) {
        const {
            fighter: {
                candidates,
                arrayIndexOfCurrentCandidate: arrayOldIndex,
            },
        } = this.data

        const candidatesCount = candidates.length
    
        let arrayNewIndex = arrayOldIndex + indexDelta
        while (arrayNewIndex < 0) {
            arrayNewIndex += candidatesCount
        }

        arrayNewIndex = arrayNewIndex % candidatesCount

        this.pickOneCandidate(arrayNewIndex)
    }

    function pickPrevCandidate() {
        _pickCandidateByIndexDelta.call(this, -1)
    }

    function pickNextCandidate() {
        _pickCandidateByIndexDelta.call(this, 1)
    }

    function pickOneCandidateRandomlyByWeights() {
        const { candidates } = this.data.fighter

        const randomPickingWeight = Math.random()
        let matchedCandidateArrayIndex = 0

        for (let i = 1; i < candidates.length; i++) {
            if (randomPickingWeight <= candidates[i].data.normalizedAccumSelectionWeight) {
                matchedCandidateArrayIndex = i
                break
            }
        }

        this.pickOneCandidate(matchedCandidateArrayIndex)
    }

    function pickOneCandidateRandomly() {
        // 不考虑选择权重时，随机选择的战士不应该与上一次选择的结果相同
        
        const { candidates } = this.data.fighter
        let result
        do {
            result = this.pickOneCandidate(randomPositiveIntegerLessThan(candidates.length))
        } while (result !== 'succeeded' && result !== 'rejected')
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

        this.el.root.classList.add('fighter-has-decided')

        const {
            onFighterDecided,
        } = this.events

        if (typeof onFighterDecided === 'function') {
            onFighterDecided(this.data.playerId, fighter.decidedRoleConfig)
        }

        return fighter.decidedRoleConfig
    }
})();
