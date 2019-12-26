window.duanduanGameChaoJiYongShi.classes.GameRole = (function () {
    return function GameRole(options) {
        if (!new.target) {
            throw new Error('必须使用 new 运算来调用 GameRole 构造函数。')
        }

        const {
            name,
            typeIdInFilePathAndCSSClassName,
            fullHealthPoint,
            attackingPower,
            defencingPower,
            avatarFileName,
            fileNamesIndexingByCSSClassName,
        } = options

        this.name = name
        this.typeIdInFilePathAndCSSClassName = typeIdInFilePathAndCSSClassName
        this.fullHealthPoint = fullHealthPoint
        this.healthPoint = fullHealthPoint
        this.attackingPower = attackingPower
        this.defencingPower = defencingPower
        this.images = {
            avatar: {
                fileName: avatarFileName,
            },
            poses: fileNamesIndexingByCSSClassName
        }

        this.toAttack     = toAttack    .bind(this)
        this.toBeAttacked = toBeAttacked.bind(this)
        this.die          = die         .bind(this)

        console.log(`【游戏角色】“${name}”创建完毕。`)
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
})();
