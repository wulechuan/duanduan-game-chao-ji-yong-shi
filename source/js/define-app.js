window.duanduanGameChaoJiYongShi = {
    classes: {}, // 各种构造函数统一存放于此。

    data: {
        chineseNumbers: [ '〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十' ],

        // allGameRoleRawConfigurations: [],
        // allGameFightingStageRawConfigurations: [],

        // allGameRoleConfigurations: [],
        // allGameFightingStageConfigurations: [],

        // allGameFighterCandidatesForBothPlayers: [],
        // allGameFightingStageCandidates: [],

        // game: null,
    },

    async fetchGameRoleRawConfigurations() {
        return Promise.resolve(this.data.allGameRoleRawConfigurations)
    },

    async fetchGameFightingStageRawConfigurations() {
        return Promise.resolve(this.data.allGameFightingStageRawConfigurations)
    },

    async prepareAllGameRoleCandidatesForBothPlayers() {
        const rawConfigurations = await this.fetchGameRoleRawConfigurations()

        const appData = this.data

        const {
            gameGlobalSettings: {
                enableFairMode,
            },
            allGameRoleConfigurationTransformFunction,
        } = appData

        const dataTransformFunction = allGameRoleConfigurationTransformFunction
        const {
            common: roleCommonConfiguration,
        } = rawConfigurations

        const allGameRoleConfigurations = rawConfigurations.items.map(rawConfig => {
            return dataTransformFunction(rawConfig, roleCommonConfiguration)
        })

        if (enableFairMode) {
            appData.gameGlobalSettings.allowToCheat = false

            const fairHealthPointBase  = 24
            const fairAttackPointBase  = 15
            const fairDefencePointBase = 10

            const randomNumberAround = function (base, span) {
                const halfSapn = span / 2
                const min = 1 - halfSapn
                const int = Math.ceil((Math.random() * span + min) * base)
                const fra = Math.random() > 0.5 ? 0.5 : 0
                return int + fra
            }

            allGameRoleConfigurations.forEach(roleConfig => {
                roleConfig.fullHealthPoint = randomNumberAround(fairHealthPointBase,  0.3) * 1000
                roleConfig.attackingPower  = randomNumberAround(fairAttackPointBase,  0.4) * 1000
                roleConfig.defencingPower  = randomNumberAround(fairDefencePointBase, 0.4) * 1000
            })
        }

        let maxHP = 0 // health
        let maxAP = 0 // attack
        let maxDP = 0 // defence

        allGameRoleConfigurations.forEach(roleConfig => {
            const {
                fullHealthPoint,
                attackingPower,
                defencingPower,
            } = roleConfig

            maxHP = Math.max(maxHP, fullHealthPoint)
            maxAP = Math.max(maxAP, attackingPower)
            maxDP = Math.max(maxDP, defencingPower)
        })

        allGameRoleConfigurations.forEach(roleConfig => {
            const {
                fullHealthPoint,
                attackingPower,
                defencingPower,
            } = roleConfig

            roleConfig.healthPointRatio    = + Math.max(0.01, (fullHealthPoint / maxHP).toFixed(4))
            roleConfig.attackingPowerRatio = + Math.max(0.01, (attackingPower  / maxAP).toFixed(4))
            roleConfig.defencingPowerRatio = + Math.max(0.01, (defencingPower  / maxDP).toFixed(4))
        })

        appData.allGameRoleConfigurations = allGameRoleConfigurations

        appData.allGameFighterCandidatesForBothPlayers = [
            this.prepareAllGameRoleCandidatesForPlayer(1, allGameRoleConfigurations),
            this.prepareAllGameRoleCandidatesForPlayer(2, allGameRoleConfigurations),
        ]
    },

    prepareAllGameRoleCandidatesForPlayer(playerId, allGameRoleConfigurations) {
        const { GameRoleCandidate } = this.classes

        // console.log('\n准备为玩家', playerId, '创建所有【角色候选人】……')

        const gameRoleCandidates = allGameRoleConfigurations.map(roleConfig => {
            return new GameRoleCandidate(playerId, roleConfig)
        })

        console.log('为玩家', playerId, '创建【角色候选人】完毕。')

        return gameRoleCandidates
    },


    async prepareAllGameFightingStageCandidates(stageConfigurations) {
        const rawConfigurations = await this.fetchGameFightingStageRawConfigurations()

        const appData = this.data
        const {
            allGameFightingStageConfigurationTransformFunction,
        } = appData

        const dataTransformFunction = allGameFightingStageConfigurationTransformFunction

        const {
            common: stageCommonConfigurations,
        } = rawConfigurations

        const allGameFightingStageConfigurations = rawConfigurations.items.map(rawConfig => {
            return dataTransformFunction(rawConfig, stageCommonConfigurations)
        })

        appData.allGameFightingStageConfigurations = allGameFightingStageConfigurations

        console.log('所有候选【对战舞台数据】就绪。')
    },


    createNewGameAndRunIt(appElement, options) {
        console.log('\n准备创建新游戏\n\n')

        const {
            onGameEnd,
            justBeforeGameDestroying,
            afterGameDestroyed,
        } = options

        const {
            data: appData,
            data: {
                allGameFighterCandidatesForBothPlayers,
                allGameFightingStageConfigurations,
                gameGlobalSettings,
            },
            classes: {
                Game,
            },
        } = this

        const {
            maxRoundsToRun,
            shouldAutoPickFightersByWeights,
            shouldForceRollingEvenIfAutoPickingByWeights,
            shouldManuallyPickFighters,
            keyboardShortcuts,
        } = gameGlobalSettings

        const game = new Game(
            appElement,

            {
                allGameFighterCandidatesForBothPlayers,
                allGameFightingStageConfigurations,
                maxRoundsToRun,
                shouldAutoPickFightersByWeights,
                shouldForceRollingEvenIfAutoPickingByWeights,
                shouldManuallyPickFighters,

                onGameEnd,
                justBeforeGameDestroying,
                afterGameDestroyed,

                keyboardShortcuts,
            }
        )

        appData.game = game

        game.start()
    },
}
