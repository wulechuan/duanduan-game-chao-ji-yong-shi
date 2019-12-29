;(function () {
    const app = window.duanduanGameChaoJiYongShi
    const { data } = app

    Promise.all([
        app.prepareAllGameRoleCandidatesForBothPlayers(data.allGameRoleRawConfigurations),
        app.prepareAllGameFightingStageCandidates(data.allGameFightingStageConfigurations),
    ]).then(() => {
        app.createNewGameAndRunIt()
    })
})();
