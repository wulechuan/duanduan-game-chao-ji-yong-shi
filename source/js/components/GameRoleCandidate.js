window.duanduanGameChaoJiYongShi.classes.GameRoleCandidate = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils } = app
    const { createDOMWithClassNames } = utils

    return function GameRoleCandidate(playerId, options) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameRoleCandidate 构造函数。')
        }

        this.playerId = playerId

        const {
            name,
            typeIdInFilePathAndCSSClassName,
            fullHealthPoint,
            attackingPower,
            defencingPower,
            images,
        } = options

        this.name = name
        this.typeIdInFilePathAndCSSClassName = typeIdInFilePathAndCSSClassName
        this.fullHealthPoint = fullHealthPoint
        this.healthPoint = fullHealthPoint
        this.attackingPower = attackingPower
        this.defencingPower = defencingPower
        this.images = images

        _init(this)

        console.log(`【游戏角色候选人】“${name}”创建完毕。`)
    }


    function _init(gameRoleCandidate) {
        createDOMs(gameRoleCandidate)
    }

    function createDOMs(gameRoleCandidate) {
        const {
            // playerId,
            // typeIdInFilePathAndCSSClassName,
            images,
        } = gameRoleCandidate

        const rootElement = createDOMWithClassNames('div', [
            // `player-${playerId}`,
            'role-candidate',
            // `role-candidate-${typeIdInFilePathAndCSSClassName}`,
        ])

        rootElement.style.backgroundImage = `url(${images.poses['default'].filePath})`
        
        gameRoleCandidate.el = {
            root: rootElement,
        }
    }
})();
