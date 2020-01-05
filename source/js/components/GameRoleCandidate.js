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
            selectionWeightWhileAutoPicking,
            fullHealthPoint,
            attackingPower,
            defencingPower,
            healthPointRatio,
            attackingPowerRatio,
            defencingPowerRatio,
            images,
        } = roleConfig

        this.roleConfig = roleConfig

        this.data = {
            playerId,
            name,
            typeIdInFilePathAndCSSClassName,
            selectionWeightWhileAutoPicking,
            fullHealthPoint,
            attackingPower,
            defencingPower,
            healthPointRatio,
            attackingPowerRatio,
            defencingPowerRatio,
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
            name: fighterName,
            fullHealthPoint,
            attackingPower,
            defencingPower,
            healthPointRatio,
            attackingPowerRatio,
            defencingPowerRatio,
            images,
        } = this.data

        const defaultPose = images.poses['default']

        const rootElement = createDOMWithClassNames('div', [
            'role-candidate',
            // `player-${playerId}`,
            // `role-candidate-${typeIdInFilePathAndCSSClassName}`,
        ])

        const fighterNameElement = createDOMWithClassNames('div', [
            'fighter-name',
        ])
        fighterNameElement.innerText = fighterName

        const theLooksElement = createDOMWithClassNames('div', [
            'role-looks',
        ])
        theLooksElement.style.backgroundImage = `url(${defaultPose.filePath})`

        const specRatioBarsContainerElement = createDOMWithClassNames('div', [
            'specs',
        ])


        const specDOMs = [
            { label: 'HP', value: fullHealthPoint, scale: healthPointRatio    },
            { label: 'AP', value: attackingPower,  scale: attackingPowerRatio },
            { label: 'DP', value: defencingPower,  scale: defencingPowerRatio },
        ].map(_createDOMsForOneSpecRatioBar)

        specDOMs.forEach(dom => specRatioBarsContainerElement.appendChild(dom))

        rootElement.appendChild(theLooksElement)
        rootElement.appendChild(fighterNameElement)
        rootElement.appendChild(specRatioBarsContainerElement)
        
        this.el = {
            root: rootElement,
        }
    }

    function _createDOMsForOneSpecRatioBar(ratioSettings) {
        const { label, value, scale } = ratioSettings

        const specRootElement = createDOMWithClassNames('div', [
            'spec',
            label.toLowerCase(),
        ])

        const specRatioBarRootElement = createDOMWithClassNames('div', [
            'spec-ratio-bar',
        ])
        const barScaleElement = createDOMWithClassNames('div', [
            'spec-ratio-bar-scale',
        ])
        barScaleElement.style.width = `${scale * 100}%`


        const barValueElement = createDOMWithClassNames('div', [
            'spec-value',
        ])
        barValueElement.innerText = value
        
        const barLabelElement = createDOMWithClassNames('div', [
            'spec-label',
        ])
        barLabelElement.innerText = label

        specRatioBarRootElement.appendChild(barScaleElement)

        specRootElement.appendChild(specRatioBarRootElement)
        specRootElement.appendChild(barLabelElement)
        specRootElement.appendChild(barValueElement)

        return specRootElement
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
