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
    
        formattedTimeDurationStringOf(timeDurationNumberValue /* in milliseconds */) {
            let rest = timeDurationNumberValue
    
            const h = Math.floor(rest / (3600 * 1000))
            rest -= h * 3600 * 1000
    
            const m = Math.floor(rest / (60 * 1000))
            rest -= m * 60 * 1000
    
            const s = +(rest / 1000).toFixed(1)
    
            let visualLength = 0
            let hS = ''
            let mS = ''
            let sS = ''
    
            if (h > 0) {
                hS = `${h} 小时 `
                visualLength += hS.length + 2
            }
    
            if (s > 0) {
                sS = `${s} 秒`
                visualLength += sS.length + 1
            }
    
            if (m > 0) {
                if (s > 0) {
                    mS = `${m} 分 `
                    visualLength += mS.length + 1
                } else {
                    mS = `${m} 分钟`
                    visualLength += mS.length + 2
                }
            }
    
            return {
                string: `${hS}${mS}${sS}`,
                visualLength,
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
        }
    }
})();
