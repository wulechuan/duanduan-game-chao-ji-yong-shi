window.duanduanGameChaoJiYongShi.utils = (function () {
    const createElement = document.createElement.bind(document)

    return {
        randomPositiveIntegerLessThan(limit) {
            return Math.floor(Math.random() * limit)
        },
        nextItemInArray(array, currentIndex) {
            const totalCount = array.length
            const nextIndex = (currentIndex + 1) % totalCount
            return array[nextIndex]
        },
        createDOMWithClassNames(tagName, cssClassNames) {
            const newDOM = createElement(tagName)
            if (Array.isArray(cssClassNames) && cssClassNames.length > 0) {
                newDOM.className = cssClassNames.join(' ')
            } else if (typeof cssClassNames === 'string') {
                cssClassNames = cssClassNames.trim()
                if (cssClassNames) {
                    newDOM.className = cssClassNames
                }
            }

            return newDOM
        }
    }
})();
