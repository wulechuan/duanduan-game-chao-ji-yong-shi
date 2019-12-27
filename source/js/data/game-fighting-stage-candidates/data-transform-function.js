window.duanduanGameChaoJiYongShi.data.allGameFightingStageConfigurationTransformFunction = (rawConfig, commonConfig) => {
    const {
        filePathsPrefix,
    } = commonConfig

    const {
        name,
        typeIdInFilePathAndCSSClassName,
    } = rawConfig

    const filePathsPrefixOfThisRole = `${filePathsPrefix}`
    const imageFilePath = `${filePathsPrefixOfThisRole}/stage-${typeIdInFilePathAndCSSClassName}.png`

    const transformedConfig = {
        name,
        typeIdInFilePathAndCSSClassName,
        filePathsPrefixOfThisRole,
        imageFilePath,
    }

    return transformedConfig
}
