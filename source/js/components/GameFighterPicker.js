window.duanduanGameChaoJiYongShi.classes.GameFighterPicker = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils } = app

    const {
        randomPositiveIntegerLessThan,
        createDOMWithClassNames,
    } = utils
    
    return function GameFighterPicker(playerId, gameRoleCandidates) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameFighterPicker 构造函数。')
        }

        this.data = {
            playerId,

            fighter: {
                candidates: gameRoleCandidates,
                arrayIndexOfCurrentCandidate: 0,
                decidedCandidate: null,
                decidedRoleConfig: null,
            },
        }

        this.status = {
            fighterHasDecided: false,
        }

        this.startPickingFighter      = startPickingFighter     .bind(this)
        this.pickOneCandidate         = pickOneCandidate        .bind(this)
        this.pickOneCandidateRandomly = pickOneCandidateRandomly.bind(this)
        this.decideFighter            = decideFighter           .bind(this)

        _init.call(this)

        console.log('【游戏角色选择器】创建完毕。')
    }



    function _init() {
        _createDOMs.call(this)
    }
    
    function _createDOMs() {
        const { playerId, fighter } = this.data
        const {
            candidates: fighterCandidates,
        } = fighter

        const rootElement = createDOMWithClassNames('div', [
            'role-candidates-slot',
            `player-${playerId}`,
        ])

        fighterCandidates.forEach(fc => rootElement.appendChild(fc.el.root))

        this.el = {
            root: rootElement,
        }
    }

    function startPickingFighter() {
        this.pickOneCandidateRandomly()
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
            console.warn(`玩家 ${this.playerId} 的角色候选人索引越界。`)
            return
        }

        if (this.status.fighterHasDecided) {
            console.warn(`玩家 ${this.playerId} 的角色已经选定了，不能再改。`)
            return
        }

        if (arrayOldIndex === arrayNewIndex) {
            return
        }

        const currentFighterCandidate = candidates[arrayNewIndex]
        fighter.arrayIndexOfCurrentCandidate = arrayNewIndex

        return currentFighterCandidate
    }

    function pickOneCandidateRandomly() {
        this.pickOneCandidate(
            randomPositiveIntegerLessThan(this.data.fighter.candidates.length)
        )
    }

    function decideFighter() {
        const { fighter } = this.data
        const decidedCandidate = fighter.candidates[fighter.arrayIndexOfCurrentCandidate]

        fighter.decidedCandidate  = decidedCandidate
        fighter.decidedRoleConfig = decidedCandidate.roleConfig

        this.status.fighterHasDecided = true

        return fighter.decidedRoleConfig
    }
})();
