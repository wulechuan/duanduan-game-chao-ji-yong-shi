(function () {
    const stageCandidates = window.duanduanGameStageCandidates
    const roleCandidates = window.duanduanGameRoleCandidates
    const stageCandidatesCount = stageCandidates.length
    const roleCandidatesCount = roleCandidates.length

    const healthyRanges = {
        'role-is-healthy': 75,
        'role-is-wounded': 30,
        'role-is-dying': NaN,
    }

    const rolePoseCSSClassNames = [
        'is-attacking',
        'has-won',
        'has-lost',
    ]

    const roleValueBarCSSClassName = 'role-value-bar'



    // -----------------------------------------------------
    const stage = {
        el: {
            root: null,
        },
        gamingSetup: {
            candidateId: '',
        },
    }

    const bothRoles = [
        {
            el: {
                // root: null,
                // avatar: null,
                // healthPointValueBar: null
            },
            gamingSetup: {
                // healthPointLimit: 0,
                // healthPoint: 0,
                // candidateId: '',
                // candidateName: '',
            },
        },
        {
            el: {
                // root: null,
                // avatar: null,
                // healthPointValueBar: null
            },
            gamingSetup: {
                // healthPointLimit: 0,
                // healthPoint: 0,
                // candidateId: '',
                // candidateName: '',
            },
        }
    ]

    const game = {
        isRunning: false,
        stage,
        bothRoles,
        round: {
            // attackerIdOfNextRound: 0,
            // loserId: NaN,
            // winnerId: NaN,
        }
    }


    initGameApp()
    setupOneGameAndStartIt()










    function initGameApp() {
        initStage()
        initBothRoles()
    }

    function initStage() {
        stage.el.root = document.querySelector('.stage-background')

        console.warn('fake behaviour enabled')
        document.body.addEventListener('click', oneGameRound)
    }

    function initBothRoles() {
        bothRoles.forEach((role, i) => {
            role.id = i
            initOneRole(role)
        })
    }

    function initOneRole(role) {
        const roleIdInCSSClassName = role.id + 1
        role.el.root = document.querySelector(`.role.role-${roleIdInCSSClassName}`)

        const statusBlockDOM = document.querySelector(`.role-status-block.role-${roleIdInCSSClassName}`)
        role.el.avatar = statusBlockDOM.querySelector(`.avatar`)
        role.el.healthPointValueBar = statusBlockDOM.querySelector(`.${roleValueBarCSSClassName}`)
    }




    // -------------------------------------------------
    function randomPositiveIntegerLessThan(limit) {
        return Math.floor(Math.random() * limit)
    }

    function setupOneGameAndStartIt() {
        setupOneGame()
        startOneGame()
    }

    function setupOneGame() {
        const gameRoundState = game.round

        gameRoundState.attackerIdOfNextRound = 0
        gameRoundState.loserId = NaN
        gameRoundState.winnerId = NaN

        const stageCandidateIndexInArray = randomPositiveIntegerLessThan(stageCandidatesCount)
        const role1CandidateIndexInArray = randomPositiveIntegerLessThan(roleCandidatesCount)
        const role2CandidateIndexInArray = randomPositiveIntegerLessThan(roleCandidatesCount)

        resetStageForOneGame(stageCandidateIndexInArray)
        resetOneRoleForOneGame(bothRoles[0], role1CandidateIndexInArray)
        resetOneRoleForOneGame(bothRoles[1], role2CandidateIndexInArray)
    }

    function resetStageForOneGame(stageCandidateIndexInArray) {
        const usedStageCandidate = stageCandidates[stageCandidateIndexInArray]
        const stageGamingSetup = stage.gamingSetup
        stageGamingSetup.candidateId = usedStageCandidate.id
        stage.el.root.className = `stage-background stage-${stageGamingSetup.candidateId}`
    }

    function resetOneRoleForOneGame(role, roleCandidateIndexInArray) {
        const roleId = role.id
        const roleIdInCSSClassName = roleId + 1


        const roleGamingSetup = role.gamingSetup
        const usedRoleCandidate = roleCandidates[roleCandidateIndexInArray]

        roleGamingSetup.candidateId = usedRoleCandidate.id
        roleGamingSetup.candidateName = usedRoleCandidate.name
        roleGamingSetup.healthPointLimit = 100
        roleGamingSetup.healthPoint = 100

        const { el } = role
        const cssClassNameForRoleCandidate = `role-candidate-${roleGamingSetup.candidateId}`

        el.root.className = `role role-${roleIdInCSSClassName} ${cssClassNameForRoleCandidate}`
        el.avatar.className = `avatar ${cssClassNameForRoleCandidate}`
    }

    function startOneGame() {
        console.log('Game starting...')
        game.isRunning = true

        bothRoles.forEach(role => {
            setRolePose(role, '')
            setHealthPointForOneRole(role, role.gamingSetup.healthPointLimit)
        })
        console.log('Game started.')
    }

    function stopCurrentGame(loser) {
        console.log(`[${loser.id}]${loser.gamingSetup.candidateName} has lost.`)

        const winnerId = 1 - loser.id
        const winner = bothRoles[winnerId]
        console.log(`[${winnerId}]${winner.gamingSetup.candidateName} has won.`)
        setRolePose(winner, 'has-won')

        game.isRunning = false
        console.log('Game stopped.')
    }

    function setRolePose(role, poseCSSClassNameToApply) {
        const roleRootDOM = role.el.root
        const classList = roleRootDOM.classList

        rolePoseCSSClassNames.forEach(poseCSSClassName => {
            if (poseCSSClassName !== poseCSSClassNameToApply && classList.contains(poseCSSClassName)) {
                classList.remove(poseCSSClassName)
            }
        })

        if (poseCSSClassNameToApply && !classList.contains(poseCSSClassNameToApply)) {
            classList.add(poseCSSClassNameToApply)
        }
    }

    function setHealthPointForOneRole(role, rawHP) {
        let hp = parseFloat(rawHP)

        if (isNaN(hp)) {
            console.error(`role[${role.id}]: Invalid rawHP`, rawHP)
            return
        }

        const roleHealthPointValueDOM = role.el.healthPointValueBar

        hp = Math.max(0, Math.min(100, hp))
        if (hp !== rawHP) {
            console.warn(`role[${role.id}]: rawHP out of range [0, 100]`, rawHP)
        }

        roleHealthPointValueDOM.style.width = `${hp}%`

        roleHealthPointValueDOM.className = `${roleValueBarCSSClassName} `

        if (hp >= healthyRanges['role-is-healthy']) {
            roleHealthPointValueDOM.className += 'role-is-healthy'
        } else if (hp >= healthyRanges['role-is-wounded']) {
            roleHealthPointValueDOM.className += 'role-is-wounded'
        } else {
            roleHealthPointValueDOM.className += 'role-is-dying'
        }

        role.gamingSetup.healthPoint = hp

        if (hp === 0) {
            setRolePose(role, 'has-lost')
            stopCurrentGame(role)
        }
    }

    function oneGameRound() {
        if (!game.isRunning) {
            return
        }

        const attackerIdOfThisRound = game.round.attackerIdOfNextRound
        const attackerIdOfNextRound = 1 - attackerIdOfThisRound
        const attacker = bothRoles[attackerIdOfThisRound]
        const defencer = bothRoles[attackerIdOfNextRound]

        console.log(`[${
            attacker.id}]${attacker.gamingSetup.candidateName
        } is attacking [${
            defencer.id}]${defencer.gamingSetup.candidateName
        }...`)

        setRolePose(attacker, 'is-attacking')
        setRolePose(defencer, '')

        const decreases = decideBothRolesHealthPointDecreases(attacker, defencer)
        updateHealthPointForRole(defencer, decreases[0])
        updateHealthPointForRole(attacker, decreases[1])

        if (!game.isRunning) {
            return
        }

        game.round.attackerIdOfNextRound = attackerIdOfNextRound
    }

    function decideBothRolesHealthPointDecreases(attacker, defencer) {
        return [
            decideHealthPointDecreaseForOneRole(defencer, 40),
            decideHealthPointDecreaseForOneRole(attacker, 12),
        ]
    }

    function decideHealthPointDecreaseForOneRole(role, maxPossibleDecrease) {
        const oldPoint = role.gamingSetup.healthPoint
        const decrease = Math.min(oldPoint, Math.floor(Math.random() * maxPossibleDecrease))
        return decrease
    }

    function updateHealthPointForRole(role, healthPointDecrease) {
        if (!game.isRunning) {
            return
        }

        console.log(`\t[${role.id}]${role.gamingSetup.candidateName} wounded`, -healthPointDecrease)

        const oldPoint = role.gamingSetup.healthPoint
        setHealthPointForOneRole(role, oldPoint - healthPointDecrease)
    }
})();
