window.duanduanGameChaoJiYongShi.classes.GameRoundFighterStatusBar = (function () {
    const createElement = document.createElement.bind(document)

    const app = window.duanduanGameChaoJiYongShi
    const { classes } = app

    
    return function GameRoundFighterStatusBar(playerId, fighter) {
        const { GameRole } = classes

        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameRoundFighterStatusBar 构造函数。')
        }

        if (!(fighter instanceof GameRole)) {
            throw new TypeError('创建【游戏局战士血条】时，必须指明其应隶属于哪个【游戏角色】。')
        }

        this.playerId = playerId
        this.fighter = fighter

        this.setFighterHPBar = setFighterHPBar.bind(this)

        _init(this)

        console.log(`“${fighter.name}”的【游戏局战士血条】创建完毕。`)
    }



    function _init(fighterStatusBar) {
        _createDOMs(fighterStatusBar)
    }
    
    function _createDOMs(fighterStatusBar) {
        const {
            fighter,
        } = fighterStatusBar

        const rootElement = createElement('div')
        rootElement.className = [
            'role-status-bar',
            `player-${fighter.playerId}`,
        ].join(' ')

        const avatarElement = createElement('div')
        avatarElement.className = [
            'avatar',
        ].join(' ')

        const hpBarContainerElement = createElement('div')
        hpBarContainerElement.className = [
            'hp-bar-container',
        ].join(' ')

        const hpBarElement = createElement('div')
        hpBarElement.className = [
            'hp-bar',
        ].join(' ')

        const hpElement = createElement('div')
        hpElement.className = [
            'hp',
        ].join(' ')



        hpBarElement.appendChild(hpElement)
        hpBarContainerElement.appendChild(hpBarElement)
        rootElement.appendChild(hpBarContainerElement)
        rootElement.appendChild(avatarElement)

        fighterStatusBar.el = {
            root: rootElement,
            avatar: avatarElement,
            hpBar: hpBarElement,
            hp: hpElement,
        }
    }

    function setFighterHPBar(percentage) {
        const {
            hpBar,
            hp,
        } = this.el

        hp.style.width = `${percentage}%`
    }
})();
