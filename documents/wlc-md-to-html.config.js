/*
    参考（中文）：
        https://github.com/wulechuan/wulechuan-js-generate-html-via-markdown/blob/HEAD/ReadMe.zh-hans-CN.md#%E5%85%A5%E5%8F%A3%E5%8F%82%E6%95%B0

    References (English):
        https://github.com/wulechuan/wulechuan-js-generate-html-via-markdown/blob/HEAD/ReadMe.md#arguments
*/

module.exports = {
    conversionOptions: {
        articleTOCBuildingHeadingLevelStartsFrom: 2,
        articleTOCListTagNameIsUL: true,
    },

    manipulationsOverHTML: {
        shouldNotReplaceLineBreaksInCodeTagsWithBrTags: false,
        htmlTitleString: '《端端的超级勇士》说明文档',

        desiredReplacementsInHTML: [
            {
                from: /\s+href="([^#])/gi,
                to: ' target="_blank" href="$1',
            },
            {
                from: /\s+href="(.+)\.md"/gi,
                to: ' href="$1.html"',
            },
        ],

        absolutePathsOfExtraFilesToEmbedIntoHTML: [],
    },

    sundries: {
        shouldConsoleLogsInChinese: true,
        shouldDisableCachingForInternalThemeFiles: false,
        shouldDisableCachingForExternalFiles: false,
    },
}
