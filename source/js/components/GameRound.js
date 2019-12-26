window.duanduanGameChaoJiYongShi.classes.GameRound = (function () {
    const { Game } = window.duanduanGameChaoJiYongShi.classes

    return function GameRound(game) {
        if (!new.target) {
            throw new Error('必须使用 new 运算来调用 GameRound 构造函数。')
        }

        if (!(game instanceof Game)) {
            throw new TypeError('创建【游戏局】时，必须指明其应隶属于哪个【游戏】。')
        }

        if (!game.isRunning) {
            throw new Error('【游戏】已经结束。不能为已经结束的【游戏】创建【游戏局】。')
        }

        this.game = game

        this.isRunning = false

        this.fighters = {
            both: game.fighters.both,
            winner: null,
            loser: null,
            winnerArrayIndex: NaN,
            loserArrayIndex: NaN,
        }

        this.fightingStage = game.fightingStage

        this.start            = start           .bind(this)
        this.end              = end             .bind(this)
        this.annouceResult    = annouceResult   .bind(this)
    }

    function start() {
        console.log('【游戏局】开始。')
        this.isRunning = true
    }

    function end(options) {
        this.isRunning = false
        console.log('【游戏局】结束。')

        const { loser } = options

        const { fighters } = this
        const [ fighter1, fighter2 ] = fighters.both

        if (fighter1 === loser) {
            fighters.winner = fighter2
            fighters.loser  = fighter1
            fighters.winnerArrayIndex = 1
            fighters.loserArrayIndex  = 0
        } else {
            fighters.winner = fighter1
            fighters.loser  = fighter2
            fighters.winnerArrayIndex = 0
            fighters.loserArrayIndex  = 1
        }

        this.annouceResult()
        this.game.endCurrentRound()
    }

    function annouceResult() {
        const { winner, loser } = this.fighters
        console.log('Winner:', winner.name)
        console.log('Loser:',  loser.name)
    }
})();
