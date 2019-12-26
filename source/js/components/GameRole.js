window.duanduanGameChaoJiYongShi.classes.GameRole = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { Game, GameRoleCandidate } = app.classes

    return function GameRole(game, playerId, gameRoleCandidate) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameRole 构造函数。')
        }

        if (!(game instanceof Game)) {
            throw new TypeError('创建【游戏局】时，必须指明其应隶属于哪个【游戏】。')
        }

        if (!game.isRunning) {
            throw new Error('【游戏】已经结束。不能为已经结束的【游戏】创建【游戏局】。')
        }

        if (!(gameRoleCandidate instanceof GameRoleCandidate)) {
            throw new TypeError('创建【游戏角色】时，必须指明其蓝本是哪个【游戏角色候选人】。')
        }



        this.game = game
        this.playerId = playerId

        const {
            name,
            typeIdInFilePathAndCSSClassName,
            fullHealthPoint,
            attackingPower,
            defencingPower,
            images,
        } = gameRoleCandidate

        this.name = name
        this.typeIdInFilePathAndCSSClassName = typeIdInFilePathAndCSSClassName
        this.fullHealthPoint = fullHealthPoint
        this.healthPoint = fullHealthPoint
        this.attackingPower = attackingPower
        this.defencingPower = defencingPower
        this.images = images


        this.setState     = setState    .bind(this)
        this.toAttack     = toAttack    .bind(this)
        this.toBeAttacked = toBeAttacked.bind(this)
        this.die          = die         .bind(this)
        this.render       = render      .bind(this)

        console.log(`【游戏角色】“${name}”创建完毕。`)
    }


    function setState(newState) {

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
        const { game } = this
        game.end({ loser: this })
    }

    function render() {
        const playerId = role.playerId
        role.el.root = document.querySelector(`.role.role-${playerId}`)

        const statusBlockDOM = document.querySelector(`.role-status-block.role-${playerId}`)
        role.el.avatar = statusBlockDOM.querySelector(`.avatar`)
        role.el.healthPointValueBar = statusBlockDOM.querySelector(`.${roleValueBarCSSClassName}`)
    }
})();
