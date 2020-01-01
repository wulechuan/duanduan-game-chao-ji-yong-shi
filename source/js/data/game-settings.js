window.duanduanGameChaoJiYongShi.data.gameGlobalSettings = {
    maxRoundsToRun: 5,
    shouldAutoPickFightersByWeights: true,
    shouldForceRollingEvenIfAutoPickingByWeights: true,
    shouldManuallyPickFighters: true,

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
}
