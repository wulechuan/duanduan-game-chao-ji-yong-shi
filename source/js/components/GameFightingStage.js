window.duanduanGameChaoJiYongShi.classes.GameFightingStage = (function () {
    const { utils } = window.duanduanGameChaoJiYongShi
    const { createDOMWithClassNames } = utils

    return function GameFightingStage(gameFightingStageConfiguration) {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameFightingStage 构造函数。')
        }

        const {
            imageSubject,
            typeIdInFilePathAndCSSClassName,
            imageFilePath,
        } = gameFightingStageConfiguration

        this.data = {
            typeIdInFilePathAndCSSClassName,
            imageSubject,
            imageFilePath,
        }

        _init.call(this)

        console.log(`【游戏对战舞台】“${imageSubject}”创建完毕。`)
    }



    function _init() {
        _createDOMs.call(this)
    }

    function _createDOMs() {
        const {
            typeIdInFilePathAndCSSClassName,
            imageSubject,
            imageFilePath,
        } = this.data

        const rootElement = createDOMWithClassNames('div', [
            'fighting-stage',
            `fighting-stage-${typeIdInFilePathAndCSSClassName}`,
        ])

        rootElement.dataset.imageSubject = imageSubject

        rootElement.style.backgroundImage = `url(${imageFilePath})`

        this.el = {
            root: rootElement,
        }
    }
})();
