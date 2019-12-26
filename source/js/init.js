window.duanduanGameChaoJiYongShi = {
    classes: {},
    data: {
        // allGameRoleConfigurations: [],
        // allGameFightingStageConfigurations: [],
        // allGameFighterCandidates: [],
        // allGameFightingStageCandidates: [],
        // game: null,
    },
    async prepareAllGameRoleCandidates(roleConfigurations) {
        const { GameRoleCandidate } = this.classes

        this.data.allGameFighterCandidates = roleConfigurations.map(roleConfig => {
            return new GameRoleCandidate(roleConfig)
        })
    },
    async prepareAllGameFightingStageCandidates(stageConfigurations) {
        const { GameFightingStage } = window.duanduanGameChaoJiYongShi.classes

        this.data.allGameFightingStageCandidates = stageConfigurations.map(stageConfig => {
            return new GameFightingStage(stageConfig)
        })
    },
    createNewGameAndRunIt() {
        const { data, classes } = this
        const {
            allGameFighterCandidates,
            allGameFightingStageCandidates,
        } = data

        const game = new classes.Game({
            allGameFighterCandidates,
            allGameFightingStageCandidates,
        })

        data.game = game

        game.prepare()
    },
}
