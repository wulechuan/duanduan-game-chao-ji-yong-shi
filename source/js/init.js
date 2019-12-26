window.duanduanGameChaoJiYongShi = {
    classes: {},
    data: {
        // allGameRoleConfigurations: [],
        // allGameFightingStageConfigurations: [],
        allGameFighterCandidatesForBothPlayers: [],
        // allGameFightingStageCandidates: [],
        // game: null,
    },


    async prepareAllGameRoleCandidatesForPlayer(playerId, roleConfigurations) {
        const arrayIndex = playerId - 1

        const { GameRoleCandidate } = this.classes

        console.log('\n准备为玩家', playerId, '创建所有【角色候选人】……')

        this.data.allGameFighterCandidatesForBothPlayers[arrayIndex] = roleConfigurations.map(roleConfig => {
            return new GameRoleCandidate(playerId, roleConfig)
        })

        console.log('为玩家', playerId, '创建【角色候选人】完毕。')
    },


    async prepareAllGameFightingStageCandidates(stageConfigurations) {
        const { GameFightingStage } = window.duanduanGameChaoJiYongShi.classes

        console.log('\n准备创建所有候选【对战舞台】……')

        this.data.allGameFightingStageCandidates = stageConfigurations.map(stageConfig => {
            return new GameFightingStage(stageConfig)
        })

        console.log('所有候选【对战舞台】创建完毕。')
    },


    createNewGameAndRunIt() {
        const { data, classes } = this
        const {
            allGameFighterCandidatesForBothPlayers,
            allGameFightingStageCandidates,
        } = data

        const game = new classes.Game({
            allGameFighterCandidatesForBothPlayers,
            allGameFightingStageCandidates,
        })

        data.game = game

        game.prepare()
    },
}
