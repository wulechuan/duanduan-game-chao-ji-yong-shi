window.duanduanGameChaoJiYongShi.data.gameGlobalSettings = {
    maxRoundsToRun: 3,
    allowToCheat: false,

    shouldManuallyPickFighters: true,
    shouldAutoPickFightersByWeights: true,
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
    roleAttackingPowerExtraRatio: 0.36,
    roleDefencingPowerExtraRatio: 0.36,

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
                '</p>',

                '<p>',
                    '这个游戏不会有很多变化，希望不会令他着迷。',
                    '但这款游戏会告诉他，游戏里的一切数据都是虚幻的，为父的可以随意修改这些数据。',
                    '我想借此令他懂得，不可迷恋这镜花水月。',
                '</p>',

                '<p>',
                    '应端儿的要求，目前游戏里的角色形象无一例外来自一款商业街机游戏——《机甲英雄》。',
                    '因为，在我起初编写该小游戏时，端儿正热衷于《机甲英雄》，于是他要求我采用其中的角色。',
                    '我在此承诺，我不会将这些视觉元素作商业用途。',
                '</p>',

                '<p>',
                    '游戏的名字是我故意令他自己取的。他思索片刻，随口说出“超级勇士”一词。',
                '</p>',

                '<hr>',

                '<blockquote class="center">',
                    '<p>',
                    '<em>',
                    '请保护好我们的孩子！孩子们的青春宝贵，视力健康也同样宝贵！',
                    '</em>',
                    '</p>',
                '</blockquote>',

            '</article>',
        ].join(''),
    },
}
