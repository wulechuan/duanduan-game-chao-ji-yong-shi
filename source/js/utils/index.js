window.duanduanGameChaoJiYongShi.utils = (function () {
    const createElement = document.createElement.bind(document)

    return {
        randomFloatBetween(m, n) {
            return Math.random() * ( m - n ) + n
        },
        randomPositiveIntegerLessThan(limit) {
            return Math.floor(Math.random() * limit)
        },

        formattedDateStringOf(date) {
            const y = date.getFullYear()
            let M = date.getMonth() + 1
            let d = date.getDate()
            let h = date.getHours()
            let m = date.getMinutes()
            let s = date.getSeconds()
    
            M = M < 10 ? '0' + M : M
            d = d < 10 ? '0' + d : d
            h = h < 10 ? '0' + h : h
            m = m < 10 ? '0' + m : m
            s = s < 10 ? '0' + s : s
    
            return `${y}.${M}.${d} ${h}:${m}:${s}`
        },
    
        formattedTimeDurationStringOf(rawValueInMilliseconds /* in milliseconds */) {
            let rest = rawValueInMilliseconds
    
            const h = Math.floor(rest / (3600 * 1000))
            rest -= h * 3600 * 1000
    
            const m = Math.floor(rest / (60 * 1000))
            rest -= m * 60 * 1000
    
            const s = +(rest / 1000).toFixed(1)
    
            let string1VisualLength = 0
            let hS1 = ''
            let mS1 = ''
            let sS1 = ''

            let mS2 = ''
            let hS2 = ''
            let sS2 = ''
    
            if (h > 0) {
                hS1 = `${h} 小时 `
                hS2 = `${h}小时`
                string1VisualLength += hS1.length + 2
            }
    
            if (s > 0) {
                sS1 = `${s} 秒`
                sS2 = `${s}秒`
                string1VisualLength += sS1.length + 1
            }
    
            if (m > 0) {
                if (s > 0) {
                    mS1 = `${m} 分 `
                    mS2 = `${m}分`
                    string1VisualLength += mS1.length + 1
                } else {
                    mS1 = `${m} 分钟`
                    mS2 = `${m}分钟`
                    string1VisualLength += mS1.length + 2
                }
            }
    
            return {
                rawValueInMilliseconds,
                string1: `${hS1}${mS1}${sS1}`,
                string2: `${hS2}${mS2}${sS2}`,
                string1VisualLength,
            }
        },
    
        buildOneSplashLineForConsoleLog(splashDesiredWidth, centerContent, centerContentWidth) {
            if (!centerContent) {
                centerContent = ''
            }
    
            if (!centerContentWidth) {
                centerContentWidth = centerContent.length
            }
    
            const leftSpacesCount  = Math.max(0, Math.floor((splashDesiredWidth - centerContentWidth) / 2) - 1)
            const rightSpacesCount = Math.max(0, Math.ceil( (splashDesiredWidth - centerContentWidth) / 2) - 1)
    
            const leftSpaces  = ' '.repeat(leftSpacesCount)
            const rightSpaces = ' '.repeat(rightSpacesCount)
            return `*${leftSpaces}${centerContent}${rightSpaces}*`
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
        },

        createPromisesAndStoreIn(host, promiseNames) {
            const promiseOf = {}
            const resolvePromiseOf = {}
    
            promiseNames.forEach(promiseName => {
                promiseOf[promiseName] = new Promise((resolve) => {
                    resolvePromiseOf[promiseName] = resolve
                })
            })

            host.promiseOf        = promiseOf
            host.resolvePromiseOf = resolvePromiseOf
        }
    }
})();
