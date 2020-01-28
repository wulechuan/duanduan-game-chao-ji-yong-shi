window.duanduanGameChaoJiYongShi.classes.GameRound = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, classes, data: appData } = app

    const {
        randomPositiveIntegerLessThan,
        createDOMWithClassNames,
    } = utils

    return function GameRound(game, gameRoundNumber, roundsTotalCount, initOptions) {
        const { Game } = classes

        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 GameRound 构造函数。')
        }

        if (!(game instanceof Game)) {
            throw new TypeError('创建【游戏局】时，必须指明其应隶属于哪个【游戏】。')
        }

        if (game.status.isOver) {
            throw new Error('【游戏】已经结束。不能为已经结束的【游戏】创建【游戏局】。')
        }


        // TODO 未来将宣告战局的功能移走，则这里不再需要存放 gameRoundsRunner 了
        const { gameRunningScreen } = game.subComponents.uiScreens
        const { gameRoundsRunner } = gameRunningScreen.subComponents

        this.game = game
        this.gameRoundsRunner = gameRoundsRunner

        this.subComponents = {}
        this.services = { modals: {} }

        const { chineseNumbers } = appData

        let gameRoundCaption
        const isLastRoundOfGame = roundsTotalCount === gameRoundNumber

        if (roundsTotalCount === 1) {
            gameRoundCaption = '唯一之局'
        } else if (isLastRoundOfGame) {
            gameRoundCaption = '决战之局'
        } else {
            gameRoundCaption = `${chineseNumbers[roundsTotalCount]}局之${chineseNumbers[gameRoundNumber]}`
        }

        this.gameRoundCaption = gameRoundCaption

        const {
            globalKeyboardShortcuts: {
                togglePauseAndResume: keyForTogglingPauseAndResume,
            },
        } = initOptions
        
        const { settings: gameSettings } = game

        const allowToCheat = gameSettings.allowToCheat && !gameSettings.enableFairMode

        this.data = {
            gameRoundNumber,
            allowToCheat,

            fighters: {
                both: null,
                winner: null,
                loser: null,
                winnerPlayerId: NaN,
                isDrawGameRound: false,
            },

            globalKeyboardShortcuts: {
                togglePauseAndResume: keyForTogglingPauseAndResume,
            },
        }

        this.status = {
            isLastRoundOfGame,

            isRunning: false,
            isPaused: false,
            isOver: false,
            hasCompletedEnded: false,

            judgementInterval: 66, // milliseconds
            judgementIntervalId: NaN,

            fighterNewAttacksQueue: [
                /*
                    {
                        attackerPlayerId: number,
                        shouldIgnoreFightersDistance: boolean,
                    }
                */
            ],
        }

        this.start                     = start                    .bind(this)
        this.togglePauseAndResume      = togglePauseAndResume     .bind(this)
        this.cheatedBy                 = cheatedBy                .bind(this)
        this.showUp                    = showUp                   .bind(this)
        this.leaveAndHide              = leaveAndHide             .bind(this)
        this.acceptOneAttackFromPlayer = acceptOneAttackFromPlayer.bind(this)


        _init.call(this)

        console.log('【游戏局】创建完毕。')
    }



    function _init() {
        _createOverlayModals        .call(this)
        _createFighters             .call(this)
        _createFightingStageRandomly.call(this)
        _createGameRoundStatusBlock .call(this)
        _createShortcutKeyHints     .call(this)
        _createMoreDOMs             .call(this)

        this.el.root.style.display = 'none'
    }

    function _createOverlayModals() {
        const { OverlayModal } = classes

        const {
            globalKeyboardShortcuts,
        } = this.data

        this.services.modals.overlayModalForPausing = new OverlayModal({
            titleHTML: '游戏已经暂停',
            contentHTML: [
                `<p>&nbsp;&nbsp;按 “${globalKeyboardShortcuts.togglePauseAndResume}” 键可继续游戏。</p>`,
            ].join(''),
            cssClassNames: [
                'modal-of-tip-of-game-is-paused',
            ],
        })

        this.services.modals.overlayModalForResultAnnouncement = new OverlayModal({
            titleHTML: `${this.gameRoundCaption}结束`,
            cssClassNames: [ 'game-round-result-announcement' ],
        })
    }

    function _createFighters() {
        const { GameRole } = classes
        const { game } = this
        const {
            player1: player1KeyboardShortcuts,
            player2: player2KeyboardShortcuts,
        } = game.settings.keyboardShortcuts.gameRunning

        const { fighters } = this.data

        const [
            palyer1PickedFighterRoleConfig,
            palyer2PickedFighterRoleConfig,
        ] = game.data.pickedFighterRoleConfigurations.both

        fighters.both = [
            new GameRole(game, 1, palyer1PickedFighterRoleConfig, {
                initialPositionLeft: '25%',
                keyForMovingLeftwards:  player1KeyboardShortcuts.moveLeftwards,
                keyForMovingRightwards: player1KeyboardShortcuts.moveRightwards,
                keyForAttack:           player1KeyboardShortcuts.attack,
                keyForDefence:          player1KeyboardShortcuts.defence,
                keyForCheating:         player1KeyboardShortcuts.cheat,
            }),

            new GameRole(game, 2, palyer2PickedFighterRoleConfig, {
                initialPositionLeft: '75%',
                keyForMovingLeftwards:  player2KeyboardShortcuts.moveLeftwards,
                keyForMovingRightwards: player2KeyboardShortcuts.moveRightwards,
                keyForAttack:           player2KeyboardShortcuts.attack,
                keyForDefence:          player2KeyboardShortcuts.defence,
                keyForCheating:         player2KeyboardShortcuts.cheat,
            }),
        ]

        fighters.both.forEach(fighter => fighter.joinGameRound(this))

        fighters.both[1].faceLeftwards()
    }

    function _createFightingStageRandomly() {
        const stageConfigs = this.game.data.allGameFightingStageConfigurations
        const chosenStageConfig = stageConfigs[randomPositiveIntegerLessThan(stageConfigs.length)]
        _createFightingStage.call(this, chosenStageConfig)
    }

    function _createFightingStage(stageConfig) {
        const { GameFightingStage } = classes
        this.subComponents.fightingStage = new GameFightingStage(stageConfig)
    }

    function _createGameRoundStatusBlock() {
        const { GameRoundStatusBlock } = classes
        this.subComponents.statusBlock = new GameRoundStatusBlock(this)
    }

    function _createShortcutKeyHints() {
        const { KeyboardHint } = classes

        const {
            globalKeyboardShortcuts,
        } = this.data

        const keyboardHintForPausingGameRound = new KeyboardHint({
            keyName: globalKeyboardShortcuts.togglePauseAndResume,
            keyDescription: '暂停游戏',
        })

        this.subComponents.keyboardHintForPausingGameRound = keyboardHintForPausingGameRound
    }

    function _createMoreDOMs() {
        const { gameRoundNumber } = this.data

        const {
            fightingStage,
            statusBlock,
            keyboardHintForPausingGameRound,
        } = this.subComponents


        const rootElement = createDOMWithClassNames('div', [
            'game-round',
            `game-round-${gameRoundNumber}`,
        ])

        const bothFightersContainerElement = createDOMWithClassNames('div', [
            'fighters',
        ])

        const keyboardHintsContainerElement = createDOMWithClassNames('div', [
            'keyboard-hints',
        ])

        const bothFightersPopupsContainerElement = createDOMWithClassNames('div', [
            'fighters-popups',
        ])

        this.data.fighters.both.forEach(fighter => {
            bothFightersContainerElement      .appendChild(fighter.el.root)
            bothFightersPopupsContainerElement.appendChild(fighter.el.root2)
        })

        rootElement.appendChild(fightingStage.el.root)
        rootElement.appendChild(statusBlock  .el.root)

        keyboardHintsContainerElement.appendChild(keyboardHintForPausingGameRound.el.root)

        rootElement.appendChild(keyboardHintsContainerElement)

        rootElement.appendChild(bothFightersContainerElement)
        rootElement.appendChild(bothFightersPopupsContainerElement)

        const allModals = this.services.modals

        Object.keys(allModals).forEach(modalKey => {
            rootElement.appendChild(allModals[modalKey].el.root)
        })

        this.el = {
            root: rootElement,
        }
    }




    function cheatedBy(attacker, cheatingAttacksCount) {
        if (!this.data.allowToCheat) {
            console.log(`听着，${attacker.logString}，你不准作弊！`)
            return
        }

        console.log(`${attacker.logString}作弊了！“魔法”攻击`, cheatingAttacksCount, '次')

        for (let i = 0; i < cheatingAttacksCount; i++) {
            this.acceptOneAttackFromPlayer({
                attackerPlayerId: attacker.data.playerId,
                shouldIgnoreFightersDistance: true,
            })
        }
    }

    async function togglePauseAndResume() {
        const { status } = this

        const {
            keyboardEngineFullConfig,
            keyboardEngineConfigWhenThisGameRoundIsPaused,
        } = this.data

        const {
            keyboardEngine,
        } = this.game.services

        const {
            overlayModalForPausing,
        } = this.services.modals

        status.isPaused = !status.isPaused

        if (status.isPaused) {
            overlayModalForPausing.showUp()
            _stopJudgementInterval.call(this)
            keyboardEngine.start(keyboardEngineConfigWhenThisGameRoundIsPaused, '游戏局的暂停模式')
        } else {
            await overlayModalForPausing.leaveAndHide()
            _startJudgementInterval.call(this)
            keyboardEngine.start(keyboardEngineFullConfig, '游戏局的正常模式')
        }
    }

    function start() {
        console.log(`\n\n【游戏局 ${this.data.gameRoundNumber}】开始。\n\n\n`)
        this.status.isRunning = true
        _startKeyboardEngine.call(this)
        _startJudgementInterval.call(this)

        this.data.fighters.both.forEach(fighter => fighter.onGameRoundStart(this))
    }

    function _startKeyboardEngine() {
        const {
            keyboardEngine,
        } = this.game.services


        const bothFighters = this.data.fighters.both

        const {
            keyDown: keyDownOfBothFighters,
            keyUp:   keyUpOfBothFighters,
        } = bothFighters.reduce((kec, fp) => {
            const {
                keyDown,
                keyUp,
            } = kec

            kec = {
                keyDown: {
                    ...keyDown,
                    ...fp.data.keyboardEngineKeyDownConfig,
                },
                keyUp: {
                    ...keyUp,
                    ...fp.data.keyboardEngineKeyUpConfig,
                }
            }

            return kec
        }, {
            keyDown: {},
            keyUp: {},
        })

        const {
            globalKeyboardShortcuts,
        } = this.data

        const globalKewDown = {
            [globalKeyboardShortcuts.togglePauseAndResume]: this.togglePauseAndResume,
        }

        const keyboardEngineFullConfig = {
            keyDown: {
                ...keyDownOfBothFighters,
                ...globalKewDown,
            },
            keyUp: {
                ...keyUpOfBothFighters,
            }
        }

        this.data.keyboardEngineFullConfig = keyboardEngineFullConfig

        this.data.keyboardEngineConfigWhenThisGameRoundIsPaused = {
            keyDown: {
                ...globalKewDown,
            },
        }

        keyboardEngine.start(keyboardEngineFullConfig, '游戏局的正常模式')
    }

    function acceptOneAttackFromPlayer(attackingDetails) {
        this.status.fighterNewAttacksQueue.push(attackingDetails)
    }

    function _startJudgementInterval() {
        const { status } = this
        if (!status.isRunning) { return }
        if (status.judgementIntervalId) { return }
        status.judgementIntervalId = setInterval(() => {
            _processAllQueuedAttacks.call(this)
        }, status.judgementInterval)
    }

    function _stopJudgementInterval() {
        const { status } = this
        if (!status.judgementIntervalId) { return }
        clearInterval(status.judgementIntervalId)
        status.judgementIntervalId = NaN
    }

    function _processAllQueuedAttacks() {
        const { status } = this
        const { isPaused, fighterNewAttacksQueue } = status

        if (isPaused) { return }

        let arrayIndex = 0
        let eitherFighterLose = false

        while (arrayIndex < fighterNewAttacksQueue.length) {
            const attackingDetails = fighterNewAttacksQueue[arrayIndex]

            _judgeOnce.call(this, attackingDetails)

            eitherFighterLose = _eitherFighterLose.call(this)
            if (eitherFighterLose) { break }

            arrayIndex++
        }

        status.fighterNewAttacksQueue = []
        this.subComponents.statusBlock.updateFightersStatusBaseOnFightersData()

        if (eitherFighterLose) {
            _roundHasAResult.call(this)
        }
    }

    function _eitherFighterLose() {
        const fighters = this.data.fighters
        const [ fighter1, fighter2 ] = fighters.both

        const f1HP = fighter1.data.healthPoint
        const f2HP = fighter2.data.healthPoint

        const epsilon = 0.0001

        return f1HP < epsilon || f2HP < epsilon
    }

    function _getVisualWidthOfFightersAndDistanceBetweenThem() {
        const [ f1, f2 ] = this.data.fighters.both

        const [ f1TheLooks, f2TheLooks ] = [ f1.el.theLooks, f2.el.theLooks ]
        // const [ f1Locator,  f2Locator ]  = [ f1.el.locator,  f2.el.locator ]
        const fighterVisualBoxWidth = f1TheLooks.offsetWidth
        const [
            f1TheLooksLeft,
            f2TheLooksLeft,
        ] = [
            f1TheLooks.getBoundingClientRect().left,
            f2TheLooks.getBoundingClientRect().left,
        ]

        const distance = Math.abs(f1TheLooksLeft - f2TheLooksLeft)
        // console.log('size:', fighterVisualBoxWidth, '\tdistance:', distance, '\tpositions:', f1TheLooksLeft, f2TheLooksLeft)

        return {
            visualWidth: fighterVisualBoxWidth,
            // f1TheLooksLeft,
            // f2TheLooksLeft,
            distance,
        }
    }

    function _judgeOnce(attackingDetails) {
        const {
            attackerPlayerId,
            shouldIgnoreFightersDistance,
        } = attackingDetails

        // console.log('shouldIgnoreFightersDistance', shouldIgnoreFightersDistance)

        const attackerArrayIndex = attackerPlayerId - 1
        const suffererArrayIndex = 1 - attackerArrayIndex

        const bothFighters = this.data.fighters.both
        const attacker = bothFighters[attackerArrayIndex]
        const sufferer = bothFighters[suffererArrayIndex]


        const {
            distance,
            visualWidth,
        } = _getVisualWidthOfFightersAndDistanceBetweenThem.call(this)

        if (!shouldIgnoreFightersDistance && distance > visualWidth * 0.45) {
            // console.log(`距离太远，${attacker.logString} 发起的攻击无效。`)
            return
        }

        let attackingEffectsRatioViaDistance = 1
        if (!shouldIgnoreFightersDistance) {
            const _distanceRatio = 1 - distance / (visualWidth * 0.45)
            attackingEffectsRatioViaDistance = _distanceRatio * _distanceRatio * _distanceRatio
        }



        const attackerData = sufferer.data
        const attackerHealthPoint     = attackerData.healthPoint
        const attackerFullHealthPoint = attackerData.fullHealthPoint

        const suffererData = sufferer.data
        const suffererFullHealthPoint = suffererData.fullHealthPoint
        const suffererOldHealthPoint  = suffererData.healthPoint
        const suffererIsDefencing     = sufferer.status.isActualDefencing


        const {
            roleAttackingPowerExtraRatio,
            roleDefencingPowerExtraRatio,
        } = this.game.settings

        const suffererDefensiveRatioIdea = suffererIsDefencing
            ? (Math.random() * 0.2  + 0.8)
            : (Math.random() * 0.15 + 0.15)

        const suffererDefensiveRatioActual = suffererDefensiveRatioIdea * Math.max(0.219, suffererOldHealthPoint / suffererFullHealthPoint)

        const attackerAttackingRatioIdea = Math.random() * 0.364 + 0.6
        const attackerAttackingRatioActual = attackerAttackingRatioIdea * Math.max(0.319, attackerHealthPoint / attackerFullHealthPoint)

        const absoluteAttackingBasePoint = Math.random() * 51 + 79

        const defencePoint = sufferer.data.defencingPower * suffererDefensiveRatioActual * roleAttackingPowerExtraRatio
        const attackPoint  = attacker.data.attackingPower * attackerAttackingRatioActual * roleDefencingPowerExtraRatio

        let desiredDecrease = Math.max(0, attackPoint - defencePoint) + absoluteAttackingBasePoint
        desiredDecrease = Math.ceil(desiredDecrease * attackingEffectsRatioViaDistance)

        if (desiredDecrease > 0) {
            // console.log(`${attacker.logString}攻击生效。\n${sufferer.logString}因此应扣除`, desiredDecrease, '点血值。')
            sufferer.$suffer(desiredDecrease)
        } else {
            // console.log(`${attacker.logString} 发起的攻击太微弱，视为无效。`)
        }
    }

    function _roundHasAResult() {
        _stopJudgementInterval.call(this)

        const fighters = this.data.fighters
        const [ fighter1, fighter2 ] = fighters.both

        const f1HP = fighter1.data.healthPoint
        const f2HP = fighter2.data.healthPoint

        console.warn('暂未考虑双方同时阵亡的细则', f1HP, f2HP)
        let winner
        let loser
        let winnerPlayerId = NaN

        if (f1HP < f2HP) {
            winnerPlayerId = 2
            winner = fighter2
            loser  = fighter1
        } else {
            winnerPlayerId = 1
            winner = fighter1
            loser  = fighter2
        }

        fighters.winner = winner
        fighters.loser  = loser
        fighters.winnerPlayerId = winnerPlayerId

        winner.win()
        loser.lose()

        _ending.call(this)
    }

    async function _annouceResult() { // TODO 将宣告战局的功能移到 GameRoundsRunner 中去。
        const noMoreGameRoundsNeeded = this.gameRoundsRunner.evaluateGameStatusJustBeforeOneGameRoundEnds()

        const { winner, isDrawGameRound } = this.data.fighters

        let resultDescHTML
        let gameRoundDesc = `【游戏局 ${this.data.gameRoundNumber}】`

        if (isDrawGameRound) {
            console.log(`${gameRoundDesc}结束。\n平局。\n\n\n`)
            resultDescHTML = '<p>平局<p>'
        } else {
            const winnerDesc = winner.displayString
            console.log(`${gameRoundDesc}结束。\n胜利者：${winnerDesc}。\n\n\n`)
            resultDescHTML = [
                '<p>',
                '<span class="label">胜利者：</span>',
                '<span class="detail">',
                winnerDesc,
                '</span>',
                '</p>',
            ].join('')
        }

        // 在弹出战局报告对话框之前，仍留有短暂的时间，令胜利者可以继续活动。
        // 因此，有必要在弹框时，彻底禁止胜利者可能在进行的活动。确保清除各种可能的 interval。
        winner.stopAllPossibleActions()


        const realEndOfThisGameRound = _realEnd.bind(this)

        this.game.services.keyboardEngine.start({
            keyDown: {
                'ENTER':  realEndOfThisGameRound,
                ' ':      realEndOfThisGameRound,
                'ESCAPE': realEndOfThisGameRound,
            },
        }, '游戏局结果报告对话框')

        await this.services.modals.overlayModalForResultAnnouncement.showUp({
            contentHTML: resultDescHTML,
            countDown: {
                seconds: 10,
                tipHTML: noMoreGameRoundsNeeded ? '准备结束游戏' : '准备进入下一局',
            },
        })

        realEndOfThisGameRound()
    }

    async function _ending() {
        this.status.isRunning = false
        this.status.isOver = true
        this.el.root.classList.add('is-over')

        // 等待片刻，令玩家欣赏胜利者的宣言和失败者的遗言。
        await new Promise(resolve => setTimeout(resolve, 4000))

        await _annouceResult.call(this)
    }

    async function _realEnd() {
        if (this.status.hasCompletedEnded) { return }
        this.status.hasCompletedEnded = true

        this.game.services.keyboardEngine.stop()
        await this.services.modals.overlayModalForResultAnnouncement.leaveAndHide()
        this.gameRoundsRunner.endCurrentRound()
    }

    function showUp() {
        const rootElement = this.el.root

        return new Promise(resolve => {
            setTimeout(() => {
                rootElement.style.display = ''

                rootElement.classList.add('entering')
                rootElement.onanimationend = function () {
                    rootElement.classList.remove('entering')
                    rootElement.onanimationend = null
                }
            }, 200)
        })
    }

    function leaveAndHide() {
        const rootElement = this.el.root

        rootElement.classList.add('leaving')
        rootElement.onanimationend = function () {
            rootElement.style.display = 'none'
            rootElement.classList.remove('leaving')
            rootElement.onanimationend = null
        }
    }
})();
