;(function () {
    const app = window.duanduanGameChaoJiYongShi
    const { data } = app

    Promise.all([
        app.prepareAllGameRoleCandidates(data.allGameRoleConfigurations),
        app.prepareAllGameFightingStageCandidates(data.allGameFightingStageConfigurations),
    ]).then(() => {
        app.createNewGameAndRunIt()
    })
})();
