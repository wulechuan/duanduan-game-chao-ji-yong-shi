window.duanduanGameChaoJiYongShi.classes.GameRoleCandidate = (function () {
    return function GameRoleCandidate(options) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameRoleCandidate 构造函数。')
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

        console.log(`【游戏角色候选人】“${name}”创建完毕。`)

        this.render = render.bind(this)
    }



    function render(playerId) {
        role.el.root = document.querySelector(`.role.role-${playerId}`)

        const statusBlockDOM = document.querySelector(`.role-status-block.role-${playerId}`)
        role.el.avatar = statusBlockDOM.querySelector(`.avatar`)
        role.el.healthPointValueBar = statusBlockDOM.querySelector(`.${roleValueBarCSSClassName}`)
    }
})();
