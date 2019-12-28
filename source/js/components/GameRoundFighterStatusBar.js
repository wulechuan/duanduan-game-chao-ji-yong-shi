window.duanduanGameChaoJiYongShi.classes.GameRoundFighterStatusBar = (function () {
    const fighterHealthyRanges = {
        'role-is-healthy': 75,
        'role-is-wounded': 30,
        'role-is-dying': NaN,
    }


    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes } = app
    const { createDOMWithClassNames } = utils

    
    return function GameRoundFighterStatusBar(playerId, fighter) {
        const { GameRole } = classes

        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameRoundFighterStatusBar 构造函数。')
        }

        if (!(fighter instanceof GameRole)) {
            throw new TypeError('创建【游戏局斗士血条】时，必须指明其应隶属于哪个【游戏角色】。')
        }

        this.data = {
            playerId,
            fighter,
        }

        this.setFighterHPBar = setFighterHPBar.bind(this)

        _init.call(this)

        console.log(`“${fighter.data.name}”的【游戏局斗士血条】创建完毕。`)
    }



    function _init() {
        _createDOMs.call(this)
        this.setFighterHPBar(100)
    }
    
    function _createDOMs() {
        const {
            fighter,
        } = this.data

        const rootElement = createDOMWithClassNames('div', [
            'role-status-bar',
            `player-${fighter.playerId}`,
        ])

        const hpBarContainerElement = createDOMWithClassNames('div', [
            'hp-bar-container',
        ])

        const hpBarElement = createDOMWithClassNames('div', [
            'hp-bar',
        ])

        const hpElement = createDOMWithClassNames('div', [
            'hp',
        ])

        const avatarElement = createDOMWithClassNames('div', [
            'avatar',
        ])

        avatarElement.style.backgroundImage = `url(${fighter.data.images.avatar.filePath})`


        hpBarElement.appendChild(hpElement)
        hpBarContainerElement.appendChild(hpBarElement)
        rootElement.appendChild(avatarElement)
        rootElement.appendChild(hpBarContainerElement)

        this.el = {
            root: rootElement,
            avatar: avatarElement,
            // hpBar: hpBarElement,
            hp: hpElement,
        }
    }

    function setFighterHPBar(percentage) {
        const {
            // hpBar,
            hp,
        } = this.el

        hp.style.width = `${percentage}%`

        hp.className = `hp `
        if (percentage >= fighterHealthyRanges['role-is-healthy']) {
            hp.className += 'role-is-healthy'
        } else if (percentage >= fighterHealthyRanges['role-is-wounded']) {
            hp.className += 'role-is-wounded'
        } else {
            hp.className += 'role-is-dying'
        }
    }
})();
