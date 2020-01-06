window.duanduanGameChaoJiYongShi.data.allGameRoleConfigurationTransformFunction = (rawConfig, commonConfig) => {
    const {
        filePathsPrefix,
    } = commonConfig

    const {
        name,
        typeIdInFilePathAndCSSClassName,
        selectionWeightWhileAutoPicking,
        fullHealthPoint,
        attackingPower,
        defencingPower,
        avatarFileName,
        fileNamesIndexingByCSSClassName,
    } = rawConfig

    const filePathsPrefixOfThisRole = `${filePathsPrefix}/role-${typeIdInFilePathAndCSSClassName}`
    const images = {}

    const roleConfig = {
        name,
        typeIdInFilePathAndCSSClassName,
        selectionWeightWhileAutoPicking,
        fullHealthPoint,
        attackingPower,
        defencingPower,
        filePathsPrefixOfThisRole,
        images,
    }

    images.avatar = {
        // fileName: avatarFileName,
        filePath: `${filePathsPrefixOfThisRole}/${avatarFileName}`,
    }

    images.poses = Object.keys(fileNamesIndexingByCSSClassName).reduce((poseConfig, poseName) => {
        const poseFileName = fileNamesIndexingByCSSClassName[poseName]

        if (poseFileName) {
            poseConfig[poseName] = {
                // fileName: poseFileName,
                filePath: `${filePathsPrefixOfThisRole}/${poseFileName}`,
            }
        }

        return poseConfig
    }, {})

    return roleConfig
}
