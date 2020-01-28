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

        normalFormattedTimeDurationStringOf(rawValueInMilliseconds /* in milliseconds */) {
            let rest = Math.round(rawValueInMilliseconds / 1000)

            const h = Math.floor(rest / 3600)
            rest -= h * 3600

            const m = Math.floor(rest / 60)
            rest -= m * 60

            const s = rest

            let mString = ''
            let hString = ''
            let sString = ''

            if (h > 0) {
                hString = `${h}小时`
            }

            if (s > 0) {
                if (s < 10 && (m > 0 || h > 0)) {
                    sString = `0${s}秒`
                } else {
                    sString = `${s}秒`
                }
            }

            if (m > 0) {
                const unit = s > 0 ? '分' : '分钟'
                if (m < 9 && h > 0) {
                    mString = `0${m}${unit}`
                } else {
                    mString = `${m}${unit}`
                }
            }

            return {
                rawValueInMilliseconds,
                formattedString: `${hString}${mString}${sString}`,
            }
        },

        splashLineFormattedTimeDurationStringOf(rawValueInMilliseconds /* in milliseconds */) {
            let rest = rawValueInMilliseconds

            const h = Math.floor(rest / (3600 * 1000))
            rest -= h * 3600 * 1000

            const m = Math.floor(rest / (60 * 1000))
            rest -= m * 60 * 1000

            const s = +(rest / 1000).toFixed(1)

            let formattedStringVisualLength = 0
            let hString = ''
            let mString = ''
            let sString = ''

            if (h > 0) {
                hString = `${h} 小时 `
                formattedStringVisualLength += hString.length + 2
            }

            if (s > 0) {
                sString = `${s} 秒`
                formattedStringVisualLength += sString.length + 1
            }

            if (m > 0) {
                if (s > 0) {
                    mString = `${m} 分 `
                    formattedStringVisualLength += mString.length + 1
                } else {
                    mString = `${m} 分钟`
                    formattedStringVisualLength += mString.length + 2
                }
            }

            return {
                rawValueInMilliseconds,
                formattedString: `${hString}${mString}${sString}`,
                formattedStringVisualLength,
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
