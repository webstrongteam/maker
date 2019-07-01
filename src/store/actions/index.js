export {
    initToDo,
    initTasks,
    initFinished,
    saveTask,
    finishTask,
    undoTask,
    removeTask
} from './tasks';

export {
    initCategories,
    saveCategory,
    removeCategory
} from './categories';

export {
    initSettings,
    changeSorting,
    changeConfirmDeletingTask,
    changeConfirmFinishingTask,
    changeConfirmRepeatingTask,
    changeFirstDayOfWeek,
    changeTimeFormat
} from './settings';

export {
    initProfile,
    changeName,
    changeAvatar,
    addDeletedTask
} from './profile';

export {
    initTheme,
    initThemes,
    setSelectedTheme,
    saveTheme,
    deleteTheme
} from './theme'