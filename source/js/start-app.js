;(function () {
    const app = window.duanduanGameChaoJiYongShi
    const { utils, data } = app
    const {
        buildOneSplashLineForConsoleLog,
    } = utils

    function reportAppLaunch() {
        const splashWidth = 32
        console.log([
            '\n'.repeat(0),
            '*'.repeat(splashWidth),
            buildOneSplashLineForConsoleLog(splashWidth),
            buildOneSplashLineForConsoleLog(splashWidth, '应用现在启动', 11),
            buildOneSplashLineForConsoleLog(splashWidth),
            '*'.repeat(splashWidth),
            '\n'.repeat(1),
        ].join('\n'))
    }

    reportAppLaunch()
    console.log('正在准备游戏通用数据（候选角色、候选游戏对战舞台数据等）。')

    Promise.all([
        app.prepareAllGameRoleCandidatesForBothPlayers(data.allGameRoleRawConfigurations),
        app.prepareAllGameFightingStageCandidates(data.allGameFightingStageConfigurations),
    ]).then(() => {
        function createNewGameAndRunIt() {
            app.createNewGameAndRunIt(
                appElement,
                {
                    afterGameDestroyed,
                }
            )
        }


        const appElement = document.querySelector('#app')

        let afterGameDestroyed
        if (data.gameGlobalSettings.SHOULD_START_NEW_GAME_WHEN_A_GAME_ENDS) {
            console.log('')
            console.warn([
                '',
                '游戏已经配置成循环模式。',
                '',
                '谨慎！我们真的有必要令游戏无止境的进行吗？',
                '谨慎！我们真的有必要令游戏无止境的进行吗？',
                '谨慎！我们真的有必要令游戏无止境的进行吗？',
                '',
                '',
            ].join('\n'))

            afterGameDestroyed = createNewGameAndRunIt
        } else {
            afterGameDestroyed = function ShowAuthorInfo() {
                const authorInfoElement = document.querySelector('#info-when-no-more-games')
                if (authorInfoElement) {
                    appElement       .style.display = 'none'
                    authorInfoElement.style.display = ''
                }
            }
        }

        createNewGameAndRunIt()
    })
})();
