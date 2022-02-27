window.duanduanGameChaoJiYongShi.utils.allGameFightingStageConfigurationTransformFunction = (thisStageRawConfig, allStagesCommonConfig) => {
    const {
        filePathsPrefix,
        fileExt: defaultFileExt,
    } = allStagesCommonConfig
    
    const {
        imageSubject,
        typeIdInFilePathAndCSSClassName,
        fileName: providedFileName,
        fileExt:  providedFileExt,
    } = thisStageRawConfig

    const fileExt = providedFileExt || defaultFileExt || 'jpg'
    const fileName = providedFileName || `stage-${typeIdInFilePathAndCSSClassName}`

    const filePathsPrefixOfThisRole = `${filePathsPrefix}`
    const imageFilePath = `${filePathsPrefixOfThisRole}/${fileName}.${fileExt}`

    const transformedConfig = {
        imageSubject,
        typeIdInFilePathAndCSSClassName,
        filePathsPrefixOfThisRole,
        imageFilePath,
    }

    return transformedConfig
}
