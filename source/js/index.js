(function () {
    const stageCandidates = window.duanduanGameStageCandidates
    const roleCandidates  = window.duanduanGameRoleCandidates
    const stageCandidatesCount = stageCandidates.length
    const roleCandidatesCount  = roleCandidates .length

    const healthyRanges = {
        'role-is-healthy': 75,
        'role-is-wounded': 30,
        'role-is-dying': NaN,
    }

    const rolePoseCSSClassNames = [
        'is-attacking',
        'is-suffering',
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

    const bothGamingRoles = [
        {
            el: {
                // root: null,
                // avatar: null,
                // healthPointValueBar: null
            },
            gamingSetup: {
                // imageFilesContainerFolderPath: '',
                // cssClassNamesToFileName: null,
                // healthPointLimit: 0,
                // healthPoint: 0,
                // candidateId: '',
                // candidateName: '',
            },
        },
        {
            el: {},
            gamingSetup: {},
        }
    ]

    const game = {
        isRunning: false,
        stage,
        bothRoles: bothGamingRoles,
        round: {
            // attackerIdOfNextRound: 0,
            // loserId: NaN,
            // winnerId: NaN,
        }
    }


    initGameApp()
    setupOneGameAndStartIt()









    // -------------------------------------------------
    function randomPositiveIntegerLessThan(limit) {
        return Math.floor(Math.random() * limit)
    }





    // -------------------------------------------------
    function initGameApp() {
        initStage()
        initBothRoles()
        initSundries()
    }

    function initStage() {
        stage.el.root = document.querySelector('.stage-background')

        console.warn('fake behaviour enabled')
        const body = document.body
        body.addEventListener('click', oneGameRound)
        body.addEventListener('keyup', function (event) {
            console.log('keyCode:', event.keyCode)
            switch (event.keyCode) {
                case 32: // spacebar
                    oneGameRound()
                    break
                case 82: // 'r' restart game
                    stopCurrentGame()
                    setTimeout(setupOneGameAndStartIt, 300)
                    break
            }
        })
    }

    function initSundries() {
        const vsIcon = document.querySelector('.icon-vs')
        vsIcon.addEventListener('click', function (event) {
            event.stopPropagation()

            if (!game.isRunning) {
                setupOneGameAndStartIt()
            }
        })
    }

    function initBothRoles() {
        bothGamingRoles.forEach((role, i) => {
            role.id = i
            role.playerId = i + 1
            initOneRole(role)
        })
    }

    function initOneRole(role) {
        const playerId = role.playerId
        role.el.root = document.querySelector(`.role.role-${playerId}`)

        const statusBlockDOM = document.querySelector(`.role-status-block.role-${playerId}`)
        role.el.avatar = statusBlockDOM.querySelector(`.avatar`)
        role.el.healthPointValueBar = statusBlockDOM.querySelector(`.${roleValueBarCSSClassName}`)
    }





    // -------------------------------------------------
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
        resetOneRoleForOneGame(bothGamingRoles[0], role1CandidateIndexInArray)
        resetOneRoleForOneGame(bothGamingRoles[1], role2CandidateIndexInArray)
    }

    function resetStageForOneGame(stageCandidateIndexInArray) {
        const usedStageCandidate = stageCandidates[stageCandidateIndexInArray]
        const stageIdInCSSClassName = usedStageCandidate.id

        const stageGamingSetup = stage.gamingSetup
        stageGamingSetup.candidateId = stageIdInCSSClassName

        const stageRootDOM = stage.el.root
        let fileName = usedStageCandidate.fileName || `stage-${stageIdInCSSClassName}.jpg`
        stageRootDOM.style.backgroundImage = `url(images/game-stages/${fileName})`
    }

    function resetOneRoleForOneGame(role, roleCandidateIndexInArray) {
        const { playerId, el } = role


        const roleGamingSetup = role.gamingSetup
        const usedRoleCandidate = roleCandidates[roleCandidateIndexInArray]

        const roleCandidateId = usedRoleCandidate.idInFilePathAndCSSClassName
        roleGamingSetup.candidateId = roleCandidateId
        roleGamingSetup.candidateName = usedRoleCandidate.name

        const {
            fullHealthPoint,
            attackingPower,
            defencingPower,
            cssClassNamesToFileName
        } = usedRoleCandidate
        const imageFilesContainerFolderPath = `images/game-roles/role-${roleCandidateId}`

        roleGamingSetup.imageFilesContainerFolderPath = imageFilesContainerFolderPath
        roleGamingSetup.healthPointLimit = fullHealthPoint
        roleGamingSetup.attackingPower = attackingPower
        roleGamingSetup.defencingPower = defencingPower
        roleGamingSetup.cssClassNamesToFileName = cssClassNamesToFileName

        const cssClassNameForRoleCandidate = `role-candidate-${roleCandidateId}`
        el.root.  className = `role role-${playerId} ${cssClassNameForRoleCandidate}`
        el.avatar.className =                `avatar ${cssClassNameForRoleCandidate}`

        el.avatar.style.backgroundImage = `url(${imageFilesContainerFolderPath}/avatar.png)`
    }

    function startOneGame() {
        game.isRunning = true

        bothGamingRoles.forEach(role => {
            setRolePose(role, '')
            setHealthPointForOneRole(role, role.gamingSetup.healthPointLimit)
        })
        console.log('游戏现在开始!')
    }

    function stopCurrentGame(loser) {
        console.log('')

        if (loser) {
            console.log(`[${loser.id}]${loser.gamingSetup.candidateName} 输了！`)
    
            const winnerId = 1 - loser.id
            const winner = bothGamingRoles[winnerId]
            console.log(`[${winnerId}]${winner.gamingSetup.candidateName} 赢了！`)
            setRolePose(winner, 'has-won')
        } else {
            console.log('双方平局。')
        }

        game.isRunning = false
        console.log('游戏结束。\n\n\n')
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

        const roleGamingSetup = role.gamingSetup
        const {
            imageFilesContainerFolderPath,
            cssClassNamesToFileName,
        } = roleGamingSetup

        let poseImageFileName = cssClassNamesToFileName['default']
        if (poseCSSClassNameToApply && poseCSSClassNameToApply !== 'default') {
            let foundPoseImageFileName = cssClassNamesToFileName[poseCSSClassNameToApply]

            if (foundPoseImageFileName) {
                poseImageFileName = foundPoseImageFileName
            }
        }

        role.el.root.style.backgroundImage = `url(${imageFilesContainerFolderPath}/${poseImageFileName})`
    }

    function setHealthPointForOneRole(role, rawHP) {
        let hp = parseInt(rawHP)

        if (isNaN(hp)) {
            console.error(`role[${role.id}]: rawHP 的值无效，为`, rawHP)
            return
        }

        const roleHealthPointValueDOM = role.el.healthPointValueBar

        const maxAllowedHP = role.gamingSetup.healthPointLimit
        hp = Math.max(0, Math.min(maxAllowedHP, hp))
        if (hp !== rawHP) {
            console.warn(`role[${role.id}]: rawHP 超出取值范围 [`, 0, ',', maxAllowedHP, ']，为', rawHP)
        }

        const percentage = hp * 100 / maxAllowedHP
        let usedPercentage = percentage
        if (percentage < 0.6) {
            usedPercentage = 0
        }

        if (usedPercentage === 0) {
            hp = 0
        }


        roleHealthPointValueDOM.style.width = `${usedPercentage}%`

        
        roleHealthPointValueDOM.className = `${roleValueBarCSSClassName} `
        if (usedPercentage >= healthyRanges['role-is-healthy']) {
            roleHealthPointValueDOM.className += 'role-is-healthy'
        } else if (usedPercentage >= healthyRanges['role-is-wounded']) {
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
        const attacker = bothGamingRoles[attackerIdOfThisRound]
        const defencer = bothGamingRoles[attackerIdOfNextRound]

        console.log(`[P${
            attacker.playerId}]${attacker.gamingSetup.candidateName
        } 正在攻击 [P${
            defencer.playerId}]${defencer.gamingSetup.candidateName
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
            decideHealthPointDecreaseForOneRole(true,  defencer, attacker),
            decideHealthPointDecreaseForOneRole(false, attacker, defencer),
        ]
    }

    function decideHealthPointDecreaseForOneRole(roleAIsDefencer, roleA, roleB) {
        const oldPoint = roleA.gamingSetup.healthPoint

        let roleADefensiveRatio
        let roleBAttackingRatio
        if (roleAIsDefencer) {
            roleADefensiveRatio = Math.random() * 0.3 + 0.7
            roleBAttackingRatio = Math.random() * 0.3 + 0.7
        } else {
            roleADefensiveRatio = Math.random() * 0.15
            roleBAttackingRatio = Math.random() * 0.25 + 0.1
        }

        const attackFromB = roleB.gamingSetup.attackingPower * roleBAttackingRatio
        const defenceOfA  = roleA.gamingSetup.defencingPower * roleADefensiveRatio

        const decreaseLimit = Math.max(0, attackFromB - defenceOfA)
        
        decrease = Math.min(oldPoint, Math.floor(Math.random() * decreaseLimit))
        return decrease
    }

    function updateHealthPointForRole(role, healthPointDecrease) {
        if (!game.isRunning) {
            return
        }

        console.log(`\t[P${role.playerId}]${role.gamingSetup.candidateName} 受伤了`, -healthPointDecrease)

        const oldPoint = role.gamingSetup.healthPoint
        setHealthPointForOneRole(role, oldPoint - healthPointDecrease)
    }
})();
