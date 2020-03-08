export {
    onRefresh,
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
    saveList,
    saveQuicklyTask,
    removeList,
    removeQuicklyTask
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
    changeAdjustTaskName,
    changeHideTabView,
    changeFirstDayOfWeek,
    changeTimeFormat,
    changeLang
} from './settings';

export {
    updateModal,
    updateSnackbar
} from './config';

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