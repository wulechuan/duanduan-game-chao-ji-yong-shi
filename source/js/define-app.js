window.duanduanGameChaoJiYongShi = {
    classes: {}, // 各种构造函数统一存放于此。

    data: {
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
        const dataTransformFunction = appData.allGameRoleConfigurationTransformFunction
        const {
            common: roleCommonConfiguration,
        } = rawConfigurations

        const allGameRoleConfigurations = rawConfigurations.items.map(rawConfig => {
            return dataTransformFunction(rawConfig, roleCommonConfiguration)
        })

        appData.allGameRoleConfigurations = allGameRoleConfigurations

        appData.allGameFighterCandidatesForBothPlayers = [
            this.prepareAllGameRoleCandidatesForPlayer(1, allGameRoleConfigurations),
            this.prepareAllGameRoleCandidatesForPlayer(2, allGameRoleConfigurations),
        ]
    },

    prepareAllGameRoleCandidatesForPlayer(playerId, allGameRoleConfigurations) {
        const { GameRoleCandidate } = this.classes

        console.log('\n准备为玩家', playerId, '创建所有【角色候选人】……')

        const gameRoleCandidates = allGameRoleConfigurations.map(roleConfig => {
            return new GameRoleCandidate(playerId, roleConfig)
        })

        console.log('为玩家', playerId, '创建【角色候选人】完毕。')

        return gameRoleCandidates
    },


    async prepareAllGameFightingStageCandidates(stageConfigurations) {
        const rawConfigurations = await this.fetchGameFightingStageRawConfigurations()

        const appData = this.data
        const dataTransformFunction = appData.allGameFightingStageConfigurationTransformFunction
        
        const {
            common: stageCommonConfigurations,
        } = rawConfigurations

        const allGameFightingStageConfigurations = rawConfigurations.items.map(rawConfig => {
            return dataTransformFunction(rawConfig, stageCommonConfigurations)
        })

        appData.allGameFightingStageConfigurations = allGameFightingStageConfigurations

        console.log('\n所有候选【对战舞台数据】就绪。\n\n')
    },


    createNewGameAndRunIt() {
        const {
            data: appData,
            data: {
                allGameFighterCandidatesForBothPlayers,
                allGameFightingStageConfigurations,
            },
            classes: {
                Game,
            },
        } = this


        const game = new Game(
            document.querySelector('#app'),
            {
                allGameFighterCandidatesForBothPlayers,
                allGameFightingStageConfigurations,
                maxRoundsToRun: 5,
            }
        )

        appData.game = game

        game.start()
    },
}
