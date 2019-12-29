import postCSS from 'gulp-postcss'
import gulpStylus from 'gulp-stylus'

import {
    createATaskCycle,
} from '@wulechuan/gulp-classical-task-cycle'

import getPluginsForOnePostCSSInstance
    from './get-plugins-for-one-postcss-instance'



export default function createOneTaskCycleForCompilingStylus(taskConfig) {
    const {
        descriptionOfCoreTask,
        descriptionOfInputsOfCoreTask,
        sourceGlobs,
        outputFiles,

        compressions: {
            shouldNotOutputUncompressedVersion,
            shouldNotOutputCompressedVersion,
        },

        extraOptions: {
            shouldDiscardMostCommentsEvenIfNotCompressCSS,
        },
    } = taskConfig

    const _shouldDiscardComments = !!shouldDiscardMostCommentsEvenIfNotCompressCSS

    const compressorOptions1 = getPluginsForOnePostCSSInstance(false, _shouldDiscardComments)
    const compressorOptions2 = getPluginsForOnePostCSSInstance(true)

    const compressor1 = postCSS
    const compressor2 = postCSS

    return createATaskCycle({
        descriptionOfCoreTask,
        descriptionOfInputsOfCoreTask,

        sourceGlobs,
        outputFiles,
        firstPipeForProcessingSources: gulpStylus,

        compressions: {
            shouldNotOutputUncompressedVersion,
            shouldNotOutputCompressedVersion,

            compressor1IsEnabled: _shouldDiscardComments,
            compressor1,
            compressorOptions1,

            compressor2IsDisabled: false,
            compressor2,
            compressorOptions2,
        },
    })
}
