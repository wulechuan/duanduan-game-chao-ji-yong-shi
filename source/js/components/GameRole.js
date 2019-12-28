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

    return function GameRole(game, playerId, gameRoleConfig) {
        const { Game } = classes

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


        this.joinGameRound = joinGameRound.bind(this)
        this.setPoseTo     = setPoseTo    .bind(this)
        this.attack        = attack       .bind(this)
        this.toBeAttacked  = toBeAttacked .bind(this)
        this.die           = die          .bind(this)

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

    function joinGameRound(gameRound) {
        const { GameRound } = classes

        if (!(gameRound instanceof GameRound)) {
            throw new TypeError('【角色】只能加入 GameRound 的实例对象。')
        }

        this.joinedGameRound = gameRound
    }

    function attack() {
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
        this.joinedGameRound.end({ loser: this })
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
