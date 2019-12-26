;(function () {
    const app = window.duanduanGameChaoJiYongShi

    app.prepareAllGameRoleCandidates(app.data.allGameRoleConfigurations)
    app.prepareAllGameFightingStageCandidates(app.data.allGameFightingStageConfigurations)

    const { Game } = app.classes

    const game = new Game()

    game.prepare()
})();
