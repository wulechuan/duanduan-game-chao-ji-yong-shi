window.duanduanGameChaoJiYongShi.data.allGameFightingStageConfigurationTransformFunction = (rawConfig, commonConfig) => {
    const {
        filePathsPrefix,
        fileExt,
    } = commonConfig

    const {
        name,
        typeIdInFilePathAndCSSClassName,
    } = rawConfig

    const filePathsPrefixOfThisRole = `${filePathsPrefix}`
    const imageFilePath = `${filePathsPrefixOfThisRole}/stage-${typeIdInFilePathAndCSSClassName}.${fileExt || 'jpg'}`

    const transformedConfig = {
        name,
        typeIdInFilePathAndCSSClassName,
        filePathsPrefixOfThisRole,
        imageFilePath,
    }

    return transformedConfig
}
