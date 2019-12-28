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

    return function GameRole(game, playerId, gameRoleCandidate) {
        const { Game, GameRoleCandidate } = classes

        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameRole 构造函数。')
        }

        if (!(game instanceof Game)) {
            throw new TypeError('创建【游戏角色】时，必须指明其应隶属于哪个【游戏】。')
        }

        if (game.status.isRunningOneRound) {
            throw new Error('【游戏】已经开始。不能为已经开始的【游戏】创建【游戏角色】。')
        }

        if (game.status.isOver) {
            throw new Error('【游戏】已经结束。不能为已经结束的【游戏】创建【游戏角色】。')
        }

        if (!(gameRoleCandidate instanceof GameRoleCandidate)) {
            throw new TypeError('创建【游戏角色】时，必须指明其蓝本是哪个【游戏角色候选人】。')
        }



        this.game = game

        const {
            name,
            typeIdInFilePathAndCSSClassName,
            fullHealthPoint,
            attackingPower,
            defencingPower,
            images,
        } = gameRoleCandidate.data

        this.data = {
            playerId,
            name,
            typeIdInFilePathAndCSSClassName,
            fullHealthPoint,
            healthPoint: fullHealthPoint,
            attackingPower,
            defencingPower,
            images,
        }


        this.setPoseTo    = setPoseTo   .bind(this)
        this.toAttack     = toAttack    .bind(this)
        this.toBeAttacked = toBeAttacked.bind(this)
        this.die          = die         .bind(this)

        _init.call(this)

        console.log(`【游戏角色】“${name}”创建完毕。`)
    }



    function _init() {
        _createDOMs.call(this)
    }

    function _createDOMs() {
        const {
            playerId,
            typeIdInFilePathAndCSSClassName,
            images: {
                poses,
            },
        } = this.data

        const rootElement = createDOMWithClassNames('div', [
            `player-${playerId}`,
            'role',
            `role-candidate-${typeIdInFilePathAndCSSClassName}`,
        ])

        rootElement.style.backgroundImage = `url(${poses['default'].filePath})`

        this.el = {
            root: rootElement,
        }
    }

    function toAttack() {
        return this.attackingPower
    }

    function toBeAttacked(incoming) {
        let {
            healthPoint,
        } = this

        const {
            defencingPower,
        } = this

        const {
            attackingPower,
        } = incoming

        const attackingEffect = Math.max(0, attackingPower - defencingPower)

        healthPoint = Math.max(0, healthPoint - attackingEffect)

        this.healthPoint = healthPoint

        if (this.healthPoint <= 0.000001) {
            this.die()
        }
    }

    function die() {
        console.warn('有问题的代码')
        this.game.end({ loser: this })
    }


    function setPoseTo(poseCSSClassNameToApply) {
        const gameRole = this

        const roleRootDOM = gameRole.el.root
        const classList = roleRootDOM.classList

        gameRoleAllPossiblePoseCSSClassNames.forEach(poseCSSClassName => {
            if (poseCSSClassName !== poseCSSClassNameToApply && classList.contains(poseCSSClassName)) {
                classList.remove(poseCSSClassName)
            }
        })

        if (poseCSSClassNameToApply && !classList.contains(poseCSSClassNameToApply)) {
            classList.add(poseCSSClassNameToApply)
        }

        const roleGamingSettings = gameRole.gamingSettings
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

        gameRole.el.root.style.backgroundImage = `url(${imageFilesContainerFolderPath}/${poseImageFileName})`
    }
})();
