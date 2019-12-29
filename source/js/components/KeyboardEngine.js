window.duanduanGameChaoJiYongShi.classes.KeyboardEngine = (function () {
    const app = window.duanduanGameChaoJiYongShi
    const { classes } = app

    return function KeyboardEngine() {
        if (!new.target) {
            throw new Error('必须使用 new 运算符来调用 KeyboardEngine 构造函数。')
        }
    }
})();
