;(function () {
    const app = window.duanduanGameChaoJiYongShi
    const { data } = app

    Promise.all([
        app.prepareAllGameRoleCandidatesForPlayer(1, data.allGameRoleConfigurations),
        app.prepareAllGameRoleCandidatesForPlayer(2, data.allGameRoleConfigurations),
        app.prepareAllGameFightingStageCandidates(data.allGameFightingStageConfigurations),
    ]).then(() => {
        app.createNewGameAndRunIt()
    })
})();
