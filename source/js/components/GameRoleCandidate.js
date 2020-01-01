window.duanduanGameChaoJiYongShi.classes.GameRoleCandidate = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils } = app
    const { createDOMWithClassNames } = utils

    return function GameRoleCandidate(playerId, roleConfig) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameRoleCandidate 构造函数。')
        }

        const {
            name,
            typeIdInFilePathAndCSSClassName,
            selectionWeightDuringAutoRolling,
            fullHealthPoint,
            attackingPower,
            defencingPower,
            images,
        } = roleConfig

        this.roleConfig = roleConfig

        this.data = {
            playerId,
            name,
            typeIdInFilePathAndCSSClassName,
            selectionWeightDuringAutoRolling,
            fullHealthPoint,
            attackingPower,
            defencingPower,
            images,
        }

        this.showUp       = showUp      .bind(this)
        this.leaveAndHide = leaveAndHide.bind(this)

        _init.call(this)

        // console.log(`【游戏角色候选人】“${name}”创建完毕。`)
    }


    function _init() {
        _createDOMs.call(this)
    }

    function _createDOMs() {
        const {
            // playerId,
            // typeIdInFilePathAndCSSClassName,
            images,
        } = this.data

        const defaultPose = images.poses['default']

        const rootElement = createDOMWithClassNames('div', [
            // `player-${playerId}`,
            'role-candidate',
            // `role-candidate-${typeIdInFilePathAndCSSClassName}`,
        ])

        rootElement.style.backgroundImage = `url(${defaultPose.filePath})`
        
        this.el = {
            root: rootElement,
        }
    }

    function showUp() {
        const rootElement = this.el.root
        rootElement.style.display = ''
    }

    function leaveAndHide() {
        const rootElement = this.el.root
        rootElement.style.display = 'none'
    }
})();
