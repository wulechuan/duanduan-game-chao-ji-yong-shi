window.duanduanGameChaoJiYongShi.classes.GameFighterPicker = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes } = app

    const {
        randomPositiveIntegerLessThan,
        createDOMWithClassNames,
        createPromisesAndStoreIn,
    } = utils

    return function GameFighterPicker(playerId, initOptions) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameFighterPicker 构造函数。')
        }

        const {
            shouldManuallyPickFighters,
            shouldAutoPickFighterByWeights,
            shouldForceRollingEvenIfAutoPickingByWeights,
            gameRoleCandidates,
        } = initOptions

        const _shouldManuallyPickFighters                   = !!shouldManuallyPickFighters
        const _shouldAutoPickFighterByWeights               = !_shouldManuallyPickFighters && !!shouldAutoPickFighterByWeights
        const _shouldForceRollingEvenIfAutoPickingByWeights = !_shouldManuallyPickFighters && !!shouldForceRollingEvenIfAutoPickingByWeights

        const shouldNotAutoRoll = _shouldManuallyPickFighters ||
            (_shouldAutoPickFighterByWeights && !_shouldForceRollingEvenIfAutoPickingByWeights)

        const requireKeyboardInteraction = _shouldManuallyPickFighters || !shouldNotAutoRoll

        this.subComonents = {}

        this.data = {
            playerId,

            // keyForPickingPrevCandidate,
            // keyForPickingNextCandidate,
            // keyForAcceptingFighter,

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
            shouldManuallyPickFighters:                   _shouldManuallyPickFighters,
            shouldAutoPickFighterByWeights:               _shouldAutoPickFighterByWeights,
            shouldForceRollingEvenIfAutoPickingByWeights: _shouldForceRollingEvenIfAutoPickingByWeights,
            shouldNotAutoRoll,
            requireKeyboardInteraction,
            isRollingRoles: false,
            rollingIntervalId: NaN,
            fighterHasDecided: false,
        }

        createPromisesAndStoreIn(this.status, [
            'fighter is decided',
        ])

        this.startPickingFighter = startPickingFighter.bind(this)

        _init.call(this, initOptions)

        // console.log('【游戏角色选择器】创建完毕。')
    }



    function _init(initOptions) {
        _generateWeightedRandomizedCandidates.call(this)
        _createKeyboardHints                 .call(this, initOptions)
        _createDOMs                          .call(this)
        _createKeyboardEngineConfig          .call(this)

        _hide.call(this)
    }

    function _createKeyboardHints(options) {
        let {
            keyForPickingPrevCandidate,
            keyForPickingNextCandidate,
            keyForAcceptingFighter,
        } = options

        const { KeyboardHint } = classes
        const {
            shouldNotAutoRoll,
            requireKeyboardInteraction,
        } = this.status

        const keyboardHintForPickingPrevCandidate = new KeyboardHint({
            isOptional: !shouldNotAutoRoll,
            keyName: keyForPickingPrevCandidate,
            keyDescription: '上一位',
            labelSouldLayBelowHint: true,
            cssClassNames: [
                'pick-prev-candidate',
            ]
        })

        const keyboardHintForPickingNextCandidate = new KeyboardHint({
            isOptional: !shouldNotAutoRoll,
            keyName: keyForPickingNextCandidate,
            keyDescription: '下一位',
            labelSouldLayBelowHint: true,
            cssClassNames: [
                'pick-next-candidate',
            ]
        })

        const keyboardHintForAcceptingFighter = new KeyboardHint({
            isOptional: !requireKeyboardInteraction,
            keyName: keyForAcceptingFighter,
            keyDescription: '接受',
            labelSouldLayBelowHint: true,
            cssClassNames: [
                'decision-maker',
            ]
        })

        this.subComonents.keyboardHintForPickingPrevCandidate = keyboardHintForPickingPrevCandidate
        this.subComonents.keyboardHintForPickingNextCandidate = keyboardHintForPickingNextCandidate
        this.subComonents.keyboardHintForAcceptingFighter     = keyboardHintForAcceptingFighter

        this.data.keyForAcceptingFighter     = keyForAcceptingFighter
        this.data.keyForPickingPrevCandidate = keyForPickingPrevCandidate
        this.data.keyForPickingNextCandidate = keyForPickingNextCandidate
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
            accumWeightPointSoFar += candidate.data.selectionWeightWhileAutoPicking
            candidate.data.accumSelectionWeightPoint = accumWeightPointSoFar
        })

        const totalWeightingPoint = accumWeightPointSoFar
        randomizedCandidates.forEach(candidate => {
            candidate.data.normalizedSelectionWeight      = + (candidate.data.selectionWeightWhileAutoPicking / totalWeightingPoint).toFixed(4)
            candidate.data.normalizedAccumSelectionWeight = + (candidate.data.accumSelectionWeightPoint       / totalWeightingPoint).toFixed(4)
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
            shouldNotAutoRoll,
        } = this.status

        const {
            keyboardHintForPickingPrevCandidate,
            keyboardHintForPickingNextCandidate,
            keyboardHintForAcceptingFighter,
        } = this.subComonents

        const {
            candidates: fighterCandidates,
        } = fighter

        const rootElement = createDOMWithClassNames('div', [
            'role-candidates-slot',
            `player-${playerId}`,
            shouldNotAutoRoll ? '' : 'should-auto-roll-candidates',
        ])

        const keyboardTipsContainerElement = createDOMWithClassNames('div', [
            'keyboard-tips',
        ])

        keyboardTipsContainerElement.appendChild(keyboardHintForPickingPrevCandidate.el.root)
        keyboardTipsContainerElement.appendChild(keyboardHintForPickingNextCandidate.el.root)
        keyboardTipsContainerElement.appendChild(keyboardHintForAcceptingFighter    .el.root)
        fighterCandidates.forEach(fc => rootElement.appendChild(fc.el.root))

        rootElement.appendChild(keyboardTipsContainerElement)

        this.el = {
            root: rootElement,
        }
    }

    function _createKeyboardEngineConfig() {
        const {
            keyForAcceptingFighter,
            keyForPickingPrevCandidate,
            keyForPickingNextCandidate,
        } = this.data

        const {
            shouldManuallyPickFighters,
        } = this.status

        const keyboardEngineKeyDownConfig = {}

        if (shouldManuallyPickFighters) {
            keyboardEngineKeyDownConfig[keyForAcceptingFighter] = _decideToUseCurrentCandidate.bind(this)
        } else {
            keyboardEngineKeyDownConfig[keyForAcceptingFighter] = _stopRollingRolesAndAcceptCurrentRole.bind(this)
        }

        if (shouldManuallyPickFighters && keyForPickingPrevCandidate) {
            keyboardEngineKeyDownConfig[keyForPickingPrevCandidate] = _pickPrevCandidate.bind(this)
        }

        if (shouldManuallyPickFighters && keyForPickingNextCandidate) {
            keyboardEngineKeyDownConfig[keyForPickingNextCandidate] = _pickNextCandidate.bind(this)
        }

        this.data.keyboardEngineKeyDownConfig = keyboardEngineKeyDownConfig
    }





    function _showUp() {
        this.el.root.style.display = ''
    }

    function _hide() {
        this.el.root.style.display = 'none'
    }

    function startPickingFighter() {
        const {
            shouldAutoPickFighterByWeights,
            shouldForceRollingEvenIfAutoPickingByWeights,
            shouldNotAutoRoll,
            // shouldManuallyPickFighters,
        } = this.status


        _pickOneCandidateRandomly.call(this)
        _showUp.call(this)


        const shouldAutoRollAnyway = !shouldNotAutoRoll ||
            (shouldAutoPickFighterByWeights && shouldForceRollingEvenIfAutoPickingByWeights)

        if (shouldAutoPickFighterByWeights && !shouldForceRollingEvenIfAutoPickingByWeights) {
            _decideToUseCurrentCandidate.call(this)
        } else if (shouldAutoRollAnyway) {
            _startRollingRoles.call(this)
        } else {
            if (!this.data.keyboardEngineKeyDownConfig) {
                throw new Error('尚未创建【按键引擎】的配置，无法进行人机交互。因此不应启动【战士选择】进程。')
            }
        }


        return this.status.promiseOf['fighter is decided']
    }

    function _pickOneCandidateRandomly() {
        if (this.status.shouldAutoPickFighterByWeights) {
            _pickOneCandidateRandomlyByWeights.call(this)
        } else {
            _pickOneCandidateRandomlyEvenly   .call(this)
        }
    }

    function _startRollingRoles(intervalInMilliseconds) {
        intervalInMilliseconds = Math.floor(intervalInMilliseconds)
        if (!intervalInMilliseconds || intervalInMilliseconds < 10) {
            intervalInMilliseconds = 125
        }

        const { status } = this
        if (status.isRollingRoles) { return }

        _pickOneCandidateRandomly.call(this)

        status.isRollingRoles = true
        status.rollingIntervalId = setInterval(() => {
            _pickOneCandidateRandomly.call(this)
        }, intervalInMilliseconds)
    }

    function _stopRollingRolesAndAcceptCurrentRole() {
        const { status } = this
        if (!status.isRollingRoles) { return }

        clearInterval(status.rollingIntervalId)
        status.rollingIntervalId = NaN
        status.isRollingRoles = false

        _decideToUseCurrentCandidate.call(this)
    }

    function _pickOneCandidate(arrayNewIndex) {
        const { playerId } = this.data

        if (this.status.fighterHasDecided) {
            console.warn(`玩家 ${playerId} 的角色已经选定了，不能再改。`)
            return 'rejected'
        }

        const {
            fighter,
            fighter: {
                candidates,
                arrayIndexOfCurrentCandidate: arrayOldIndex,
            },
        } = this.data

        arrayNewIndex = Math.floor(arrayNewIndex)

        if (!(arrayNewIndex >= 0 && arrayNewIndex < candidates.length)) {
            console.warn(`玩家 ${playerId} 的角色候选人索引越界。`)
            return 'failed'
        }

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

        _pickOneCandidate.call(this, arrayNewIndex)
    }

    function _pickPrevCandidate() {
        _pickCandidateByIndexDelta.call(this, -1)
    }

    function _pickNextCandidate() {
        _pickCandidateByIndexDelta.call(this, 1)
    }

    function _pickOneCandidateRandomlyByWeights() {
        const { candidates } = this.data.fighter

        const randomPickingWeight = Math.random()
        let matchedCandidateArrayIndex = 0

        for (let i = 1; i < candidates.length; i++) {
            if (randomPickingWeight <= candidates[i].data.normalizedAccumSelectionWeight) {
                matchedCandidateArrayIndex = i
                break
            }
        }

        _pickOneCandidate.call(this, matchedCandidateArrayIndex)
    }

    function _pickOneCandidateRandomlyEvenly() {
        const { candidates } = this.data.fighter
        let result
        do {
            result = _pickOneCandidate.call(this, randomPositiveIntegerLessThan(candidates.length))
        } while (
            result !== 'rejected' &&
            result !== 'succeeded' // 随机选择的战士不应该与上一次选择的结果相同
        )
    }

    function _decideToUseCurrentCandidate() {
        const { status } = this
        if (status.fighterHasDecided) { return }

        const { fighter } = this.data

        const decidedCandidate = fighter.candidates[fighter.arrayIndexOfCurrentCandidate]

        fighter.decidedCandidate  = decidedCandidate
        fighter.decidedRoleConfig = decidedCandidate.roleConfig

        status.fighterHasDecided = true

        this.el.root.classList.add('fighter-has-decided')

        status.resolvePromiseOf['fighter is decided'](fighter.decidedRoleConfig)
    }
})();
