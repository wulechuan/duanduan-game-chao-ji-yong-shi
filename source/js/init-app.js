window.duanduanGameChaoJiYongShi = {
    classes: {},
    data: {
        // allGameRoleConfigurations: [],
        // allGameFightingStageConfigurations: [],
        // allFighterCandidates: [],
        // allFightingStageCandidates: [],
    },
    prepareAllGameRoleCandidates(roleConfigurations) {
        const { GameRole } = this.classes

        this.allFighterCandidates = roleConfigurations.map(roleConfig => {
            return new GameRole(roleConfig)
        })
    },
    prepareAllGameFightingStageCandidates(stageConfigurations) {
        const { GameFightingStage } = window.duanduanGameChaoJiYongShi.classes

        this.allFightingStageCandidates = stageConfigurations.map(stageConfig => {
            return new GameFightingStage(stageConfig)
        })
    },
}
