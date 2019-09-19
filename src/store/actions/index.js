export {
    initToDo,
    initTasks,
    initTask,
    initFinished,
    saveTask,
    finishTask,
    undoTask,
    removeTask
} from './tasks';

export {
    initLists,
    initList,
    initQuicklyTask,
    saveQuicklyTasks,
    saveList,
    saveQuicklyTask,
    removeList,
    removeQuicklyTask,
    removeQuicklyTasks
} from './lists';

export {
    initCategories,
    initCategory,
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
    changeTimeFormat,
    changeLang
} from './settings';

export {
    initProfile,
    changeName,
    changeAvatar,
    addEndedTask
} from './profile';

export {
    initTheme,
    initThemes,
    initCustomTheme,
    setSelectedTheme,
    saveTheme,
    deleteTheme
} from './theme'