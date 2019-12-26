window.duanduanGameChaoJiYongShi.utils = (function () {
    return {
        randomPositiveIntegerLessThan(limit) {
            return Math.floor(Math.random() * limit)
        },
        nextItemInArray(array, currentIndex) {
            const totalCount = array.length
            const nextIndex = (currentIndex + 1) % totalCount
            return array[nextIndex]
        },
    }
})();
