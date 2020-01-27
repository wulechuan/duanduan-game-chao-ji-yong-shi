window.duanduanGameChaoJiYongShi.networkData.gameGlobalSettings = {
    /* 谨慎！我们真的有必要令游戏无止境的进行吗？ */
    /* 谨慎！我们真的有必要令游戏无止境的进行吗？ */
    /* 谨慎！我们真的有必要令游戏无止境的进行吗？ */
    SHOULD_START_NEW_GAME_WHEN_A_GAME_ENDS: false,


    /*
        啰嗦、略带煽情的游戏说明文。
    */
    gameIntro: {
        titleHTML: [
            '《端端的超级勇士》',
        ].join(''),

        contentHTML: [
            '<article>',

                '<p>',
                    '2019 年夏天，端儿 6 岁多了，爱玩游戏。',
                '</p>',

                '<p>',
                    '我见多数游戏的过程设计成无穷无尽的，耗费他大量的时间。',
                    '但我不想很生硬的禁止他，所以想凭一个父亲的力量与这个现实抗衡一下。',
                    '遂设计了这个很粗糙的游戏。',
                    '我希望这款游戏能令他明白，游戏里的一切数据都是虚幻的，为父的可以随意修改这些数据，',
                    '不可迷恋这镜花水月。',
                '</p>',

                '<p>',
                    '目前游戏里的角色形象无一例外来自一款商业街机游戏——《机甲英雄》。',
                    '因为在我起初编写该小游戏时，端儿正热衷于《机甲英雄》，于是他要求我采用其中的角色。',
                    '我在此承诺，我不会将这些视觉元素作商业用途。',
                    '游戏的名字是我故意令他自己取的。他思索片刻，随口说出“超级勇士”一词。',
                '</p>',

                '<blockquote class="align-center">',
                    '<p>',
                    '<em>',
                    '请保护好我们的孩子！孩子们的青春宝贵，视力健康也同样宝贵！',
                    '</em>',
                    '</p>',
                '</blockquote>',

                '<hr>',

                '<p class="align-right">',
                    '作者：南昌吴乐川 &lt;wulechuan@live.com&gt;<br>',
                    '2020 年 01 月 05 日 凌晨',
                '</p>',

            '</article>',
        ].join(''),
    },




    perGameSettings: {
        maxRoundsToRun: 3,  // 每场游戏的对战局数
        allowToCheat: true, // 是否允许使用作弊功能


        /*
            所谓“公平模式”，角色的体力、攻击、防御等属性是自动计算的，而不采用角色定义中的原始值。
            同时， allowToCheat 恒视为 false ，即，不允许使用作弊功能。
        */
        enableFairMode: true,


        shouldManuallyPickFighters: true, // 手工选择战士

        /*
            在禁止手工选择战士的前提下，此项起作用。
            - 此项为 true 是：
                游戏会自动全为两位玩家选择战士。
                某位战士被选中参战的概率由其 selectionWeightWhileAutoPicking 属性决定。
            - 此项为 false 时：
                游戏会自动高速随机滚动展示各候选角色，直至玩家按下代表 “接受” 的按键，
                滚动到的候选角色即被选定。这类似于击鼓传花。
        */
        shouldAutoPickFightersByWeights: true,


        /*
            一般而言，既然要求计算机凭借概率自动选择战士，
            则没有必要进行“击鼓传花”式的滚动。
            但，下面一项允许在凭借概率选择战士时，也强迫启用“击鼓传花”模式，
            由玩家按下代表 “接受” 的按键，方最终确定选用的角色参战。
        */
        shouldForceRollingEvenIfAutoPickingByWeights: false,



        /*
            如果攻击力、防御力相对于角色的生命值的比率过于浮夸，
            例如，所有角色生命点数在 1 万级别，而攻击力同样均在 1 万级别，
            那么很显然，没有哪个角色是真正耐打的。
            因此，需要幕后故意将攻击力、防御力值成比例减小。
            下方两个属性值即作此用途。

            但是，我们为什么不直接修订各个角色的攻击力、防御力值呢？
            原因有二：
                1、 为诸多角色逐一修改各种值比较麻烦。
                2、 期初本游戏故意遵照《机甲英雄》这款商业游戏
                   的各个角色的各种数值，那些数值原本如此。
        */
        roleAttackingPowerExtraRatio: 0.37,
        roleDefencingPowerExtraRatio: 0.37,



        keyboardShortcuts: {
            gameFightersPicking: { // 选择战士的界面中的快捷键
                global: {},

                player1: {
                    prevCandidate:   'A',
                    nextCandidate:   'S',
                    acceptCandidate: 'Z',
                },

                player2: {
                    prevCandidate:   ';',
                    nextCandidate:   '\'',
                    acceptCandidate: '/',
                },
            },

            gameRunning: { // 游戏对战过程中的快捷键
                global: {
                    togglePauseAndResume: 'Y', // 战局暂停、恢复
                },

                player1: {
                    moveLeftwards:  'Z',
                    moveRightwards: 'X',
                    attack:         'S',
                    defence:        'A',
                    cheat:          '`',
                },

                player2: {
                    moveLeftwards:  '.',
                    moveRightwards: '/',
                    attack:         ';',
                    defence:        '\'',
                    cheat:          'BACKSPACE',
                },
            },
        },
    },
}
