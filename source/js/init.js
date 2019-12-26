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
        const { GameRole } = this.classes

        this.data.allGameFighterCandidates = roleConfigurations.map(roleConfig => {
            return new GameRole(roleConfig)
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
