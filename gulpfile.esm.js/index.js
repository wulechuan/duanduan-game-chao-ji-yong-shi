import createOneTaskCycleForCompilingStylus from './tasks/stylus'

import {
    create3HighOrderTasksUponMultipleTaskCycles,
} from '@wulechuan/gulp-classical-task-cycle'

const taskCycleOfStylusCompilation = createOneTaskCycleForCompilingStylus({
    descriptionOfCoreTask: 'Stylus Compilation',
    descriptionOfInputsOfCoreTask: 'All stylus files',
    sourceGlobs: {
        rootFolderPath: './source',
        relativeGlobsSpecificallyForThisTaskCycle: [ 'stylus/index.styl' ],
        extraSourceGlobsToWatch: [
            'source/stylus/**/*.styl',
        ],
    },
 
    outputFiles: {
        rootFolderPath: './source/styles',
        forSingleOrTwoOutputFiles: {
            fileBaseName: 'app',
            fileExtWithoutDot: 'css',
        },
    },

    compressions: {
        shouldNotOutputUncompressedVersion: false,
        shouldNotOutputCompressedVersion: false,
    },

    extraOptions: {
        shouldDiscardMostCommentsEvenIfNotCompressCSS: true,
    },
})

console.log('taskCycleOfStylusCompilation:', taskCycleOfStylusCompilation)

const {
    cleanAllOldOuput,
    buildEverythingOnce,
    watchEverything,
} = create3HighOrderTasksUponMultipleTaskCycles({
    taskCyclesInPallarel: [ taskCycleOfStylusCompilation ],
})

// Public tasks
export const clean = cleanAllOldOuput
export const buildOnce = buildEverythingOnce
export const buildAndWatch = watchEverything


// The default task
export default buildAndWatch

