window.duanduanGameChaoJiYongShi.classes.GameFightingStage = (function () {
    // const { GameRound } = window.duanduanGameChaoJiYongShi.classes

    return function GameFightingStage(options) {
        if (!new.target) {
            throw new Error('必须使用 new 运算来调用 GameFightingStage 构造函数。')
        }

        // if (!(gameRound instanceof GameRound)) {
        //     throw new TypeError('创建【游戏对战舞台】时，必须指明其应隶属于哪个【游戏局】。')
        // }

        // if (!gameRound.isRunning) {
        //     throw new Error('【游戏局】已经结束。不能为已经结束的【游戏局】创建【游戏对战舞台】。')
        // }

        const {
            typeIdInFilePathAndCSSClassName,
            name,
        } = options

        this.typeIdInFilePathAndCSSClassName = typeIdInFilePathAndCSSClassName
        this.name = name
        this.images = {
            fileName: `stage-${typeIdInFilePathAndCSSClassName}`,
        }
    }
})();
