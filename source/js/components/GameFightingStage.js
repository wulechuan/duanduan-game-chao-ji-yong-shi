window.duanduanGameChaoJiYongShi.classes.GameFightingStage = (function () {
    // const { GameRound } = window.duanduanGameChaoJiYongShi.classes

    return function GameFightingStage(gameFightingStageConfiguration) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameFightingStage 构造函数。')
        }

        // if (!(gameRound instanceof GameRound)) {
        //     throw new TypeError('创建【游戏对战舞台】时，必须指明其应隶属于哪个【游戏局】。')
        // }

        // if (!gameRound.isRunningOneRound) {
        //     throw new Error('【游戏局】已经结束。不能为已经结束的【游戏局】创建【游戏对战舞台】。')
        // }

        const {
            name,
            typeIdInFilePathAndCSSClassName,
            imageFilePath,
        } = gameFightingStageConfiguration

        this.typeIdInFilePathAndCSSClassName = typeIdInFilePathAndCSSClassName
        this.name = name
        this.imageFilePath = imageFilePath


        _init(this)

        console.log(`【游戏对战舞台】“${name}”创建完毕。`)
    }



    function _init(stage) {
        _createDOMs(stage)
    }

    function _createDOMs(stage) {
        const {
            typeIdInFilePathAndCSSClassName,
        } = stage

        const rootElement = document.createElement('div')
        rootElement.className = [
            'stage',
            `stage-${typeIdInFilePathAndCSSClassName}`,
        ].join(' ')
        
        stage.el = {
            root: rootElement,
        }
    }
})();
