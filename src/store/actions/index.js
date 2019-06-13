export {
    initTasks,
    initFinished,
    changeDescription,
    changeName,
    changeDate,
    changeCategory,
    changePriority,
    changeRepeat,
    setTask,
    saveTask,
    finishTask,
    undoTask,
    removeTask,
    defaultTask
} from './tasks';

export {
    initCategories,
    changeCategoryName,
    setCategory,
    saveCategory,
    removeCategory,
    defaultCategory
} from './categories';

export {
    auth,
    logout,
    authCheckState
} from './auth'