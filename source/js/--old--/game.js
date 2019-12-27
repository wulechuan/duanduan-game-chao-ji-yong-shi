;(function () {
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

            if (!game.isRunningOneRound) {
                setupOneGameAndStartIt()
            }
        })
    }





    // -------------------------------------------------
    function setupOneGameAndStartIt() {
        setupOneGameBegin()
        setupOneGameEnd()
    }
    

    function setupOneGameBegin() {
        const gameRoundState = game.round

        gameRoundState.attackerIdOfNextRound = 0
        gameRoundState.loserId = NaN
        gameRoundState.winnerId = NaN
    }
    function setupOneGameEnd() {
        startOneGame()
    }

    function resetStageForOneGame(stageCandidateIndexInArray) {
        const usedStageCandidate = stageCandidates[stageCandidateIndexInArray]
        const stageIdInCSSClassName = usedStageCandidate.id

        const stageGamingSettings = stage.gamingSettings
        stageGamingSettings.candidateId = stageIdInCSSClassName

        const stageRootDOM = stage.el.root
        let fileName = usedStageCandidate.fileName || `stage-${stageIdInCSSClassName}.jpg`
        stageRootDOM.style.backgroundImage = `url(images/game-stages/${fileName})`
    }

    function resetOneRoleForOneGame(role, roleCandidateIndexInArray) {
        const { playerId, el } = role


        const roleGamingSettings = role.gamingSettings
        const usedRoleCandidate = roleCandidates[roleCandidateIndexInArray]

        const roleCandidateId = usedRoleCandidate.idInFilePathAndCSSClassName
        roleGamingSettings.candidateId = roleCandidateId
        roleGamingSettings.candidateName = usedRoleCandidate.name

        const {
            fullHealthPoint,
            attackingPower,
            defencingPower,
            fileNamesIndexingByCSSClassName
        } = usedRoleCandidate
        const imageFilesContainerFolderPath = `images/game-roles/role-${roleCandidateId}`

        roleGamingSettings.imageFilesContainerFolderPath = imageFilesContainerFolderPath
        roleGamingSettings.healthPointLimit = fullHealthPoint
        roleGamingSettings.attackingPower = attackingPower
        roleGamingSettings.defencingPower = defencingPower
        roleGamingSettings.fileNamesIndexingByCSSClassName = fileNamesIndexingByCSSClassName

        const cssClassNameForRoleCandidate = `role-candidate-${roleCandidateId}`
        el.root.  className = `role role-${playerId} ${cssClassNameForRoleCandidate}`
        el.avatar.className =                `avatar ${cssClassNameForRoleCandidate}`

        el.avatar.style.backgroundImage = `url(${imageFilesContainerFolderPath}/avatar.png)`
    }

    function startOneGame() {
        game.isRunningOneRound = true

        bothGamingRoles.forEach(role => {
            setRolePose(role, '')
            setHealthPointForOneRole(role, role.gamingSettings.healthPointLimit)
        })
        console.log('游戏现在开始!')
    }

    function stopCurrentGame(loser) {
        console.log('')

        if (loser) {
            console.log(`[${loser.id}]${loser.gamingSettings.candidateName} 输了！`)
    
            const winnerId = 1 - loser.id
            const winner = bothGamingRoles[winnerId]
            console.log(`[${winnerId}]${winner.gamingSettings.candidateName} 赢了！`)
            setRolePose(winner, 'has-won')
        } else {
            console.log('双方平局。')
        }

        game.isRunningOneRound = false
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

        const roleGamingSettings = role.gamingSettings
        const {
            imageFilesContainerFolderPath,
            fileNamesIndexingByCSSClassName,
        } = roleGamingSettings

        let poseImageFileName = fileNamesIndexingByCSSClassName['default']
        if (poseCSSClassNameToApply && poseCSSClassNameToApply !== 'default') {
            let foundPoseImageFileName = fileNamesIndexingByCSSClassName[poseCSSClassNameToApply]

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

        const maxAllowedHP = role.gamingSettings.healthPointLimit
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

        role.gamingSettings.healthPoint = hp

        if (hp === 0) {
            setRolePose(role, 'has-lost')
            stopCurrentGame(role)
        }
    }

    function oneGameRound() {
        if (!game.isRunningOneRound) {
            return
        }

        const attackerIdOfThisRound = game.round.attackerIdOfNextRound
        const attackerIdOfNextRound = 1 - attackerIdOfThisRound
        const attacker = bothGamingRoles[attackerIdOfThisRound]
        const defencer = bothGamingRoles[attackerIdOfNextRound]

        console.log(`[P${
            attacker.playerId}]${attacker.gamingSettings.candidateName
        } 正在攻击 [P${
            defencer.playerId}]${defencer.gamingSettings.candidateName
        }...`)

        setRolePose(attacker, 'is-attacking')
        setRolePose(defencer, '')

        const decreases = decideBothRolesHealthPointDecreases(attacker, defencer)
        updateHealthPointForRole(defencer, decreases[0])
        updateHealthPointForRole(attacker, decreases[1])

        if (!game.isRunningOneRound) {
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
        const oldPoint = roleA.gamingSettings.healthPoint

        let roleADefensiveRatio
        let roleBAttackingRatio
        if (roleAIsDefencer) {
            roleADefensiveRatio = Math.random() * 0.3 + 0.7
            roleBAttackingRatio = Math.random() * 0.3 + 0.7
        } else {
            roleADefensiveRatio = Math.random() * 0.15
            roleBAttackingRatio = Math.random() * 0.25 + 0.1
        }

        const attackFromB = roleB.gamingSettings.attackingPower * roleBAttackingRatio
        const defenceOfA  = roleA.gamingSettings.defencingPower * roleADefensiveRatio

        const decreaseLimit = Math.max(0, attackFromB - defenceOfA)
        
        decrease = Math.min(oldPoint, Math.floor(Math.random() * decreaseLimit))
        return decrease
    }

    function updateHealthPointForRole(role, healthPointDecrease) {
        if (!game.isRunningOneRound) {
            return
        }

        console.log(`\t[P${role.playerId}]${role.gamingSettings.candidateName} 受伤了`, -healthPointDecrease)

        const oldPoint = role.gamingSettings.healthPoint
        setHealthPointForOneRole(role, oldPoint - healthPointDecrease)
    }
})();