window.duanduanGameChaoJiYongShi.classes.GameRoleCandidate = (function () {
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

        _init(this)

        console.log(`【游戏角色候选人】“${name}”创建完毕。`)
    }


    function _init(gameRoleCandidate) {
        createDOMs(gameRoleCandidate)
    }

    function createDOMs(gameRoleCandidate) {
        const {
            playerId,
            typeIdInFilePathAndCSSClassName,
        } = gameRoleCandidate

        const rootElement = document.createElement('div')
        rootElement.className = [
            `player-${playerId}`,
            'role-candidate',
            `role-candidate-${typeIdInFilePathAndCSSClassName}`,
        ].join(' ')
        
        gameRoleCandidate.el = {
            root: rootElement,
        }
    }
})();
