import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utility';
import moment from 'moment';

const initState = {
    task: {
        id: false,
        name: '',
        description: '',
        date: moment(new Date()).format('DD-MM-YYYY'),
        category: 'Default',
        priority: 'none'
    },
    category: {
        id: false,
        name: ''
    },
    categories: [{id: 0, name: 'Default'}],
    tasks: [],
    finished: [],
    refresh: false
};

const changeName = (state, action) => {
    return updateObject(state,{
        task: {
            ...state.task,
            name: action.name,
        }
    });
};

const changeDescription = (state, action) => {
    return updateObject(state,{
        task: {
            ...state.task,
            description: action.description
        }
    });
};

const changeDate = (state, action) => {
    return updateObject(state,{
        task: {
            ...state.task,
            date: action.date
        }
    });
};

const changeCategory = (state, action) => {
    return updateObject(state,{
        task: {
            ...state.task,
            category: action.category
        }
    });
};

const changePriority = (state, action) => {
    return updateObject(state,{
        task: {
            ...state.task,
            priority: action.priority
        }
    });
};

const setTask = (state, action) => {
    return updateObject(state,{
        task: {
            ...action.task
        }
    });
};

const saveTask = (state) => {
    const task = state.task;

    if (task.name.trim() === "") return updateObject(state, state);

    if (task.id !== false) {
        const updatedTasks = state.tasks;
        const selectedTask = state.tasks.filter(oldTask => oldTask.id === task.id);
        const index = state.tasks.indexOf(selectedTask[0]);
        updatedTasks[index] = task;

        return updateObject(state,{
            tasks: updatedTasks,
            refresh: !state.refresh
        });
    }

    const tasksLen = state.tasks.length;
    if (tasksLen) task.id = state.tasks[tasksLen-1].id+1;
    else task.id = 0;

    return updateObject(state,{
        tasks: state.tasks.concat(task),
    });
};

const removeTask = (state, action) => {
    let selectedTask;
    if (action.task) {
        selectedTask = state.tasks.filter(oldTask => oldTask.id === action.task.id);
    } else {
        selectedTask = state.tasks.filter(oldTask => oldTask.id === state.task.id);
    }
    const index = state.tasks.indexOf(selectedTask[0]);
    const updatedTasks = [...state.tasks.slice(0, index), ...state.tasks.slice(index + 1)];
    action.task.finish = true;

    return updateObject(state,{
        tasks: updatedTasks,
        finished: state.finished.concat(action.task)
    });
};

const undoTask = (state, action) => {
    const task = action.task;

    const index = state.finished.indexOf(task);
    const updatedFinished = [...state.finished.slice(0, index), ...state.finished.slice(index + 1)];

    delete action.task.finish;

    return updateObject(state,{
        tasks: state.tasks.concat(task),
        finished: updatedFinished
    });
};

const changeCategoryName = (state, action) => {
    return updateObject(state,{
        category: {
            ...state.category,
            name: action.name
        }
    });
};

const setCategory = (state, action) => {
    return updateObject(state,{
        category: {
            ...action.category
        }
    });
};

const saveCategory = (state) => {
    const category = state.category;

    if (category.name.trim() === "") return updateObject(state, state);

    if (category.id !== false) {
        const updatedCategories = state.categories;
        const selectedCategory = state.categories.filter(oldCate => oldCate.id === category.id);
        const index = state.categories.indexOf(selectedCategory[0]);
        updatedCategories[index] = category;

        return updateObject(state,{
            categories: updatedCategories,
            refresh: !state.refresh
        });
    }

    const categoriesLen = state.categories.length;
    if (categoriesLen) category.id = state.categories[categoriesLen-1].id+1;
    else category.id = 0;

    return updateObject(state,{
        categories: state.categories.concat(category),
    });
};

const removeCategory = (state, action) => {
    const selectedCategory = state.categories.filter(oldCate => oldCate.id === action.category.id);
    const index = state.categories.indexOf(selectedCategory[0]);
    const updatedCategories = [...state.categories.slice(0, index), ...state.categories.slice(index + 1)];

    return updateObject(state,{
        categories: updatedCategories
    });
};

const defaultTask = (state) => {
    return updateObject(state,{
        task: {
            id: false,
            name: '',
            description: '',
            date: moment(new Date()).format('DD-MM-YYYY'),
            category: 'Default',
            priority: 'none'
        }
    });
};

const defaultCategory = (state) => {
    return updateObject(state,{
        category: {
            id: false,
            name: ''
        }
    });
};

const reducer = (state = initState, action) => {
    switch (action.type) {
        case actionTypes.CHANGE_TASK_NAME: return changeName(state, action);
        case actionTypes.CHANGE_TASK_DESCRIPTION: return changeDescription(state, action);
        case actionTypes.CHANGE_TASK_DATE: return changeDate(state, action);
        case actionTypes.CHANGE_TASK_CATEGORY: return changeCategory(state, action);
        case actionTypes.CHANGE_TASK_PRIORITY: return changePriority(state, action);
        case actionTypes.SET_TASK: return setTask(state, action);
        case actionTypes.SAVE_TASK: return saveTask(state);
        case actionTypes.REMOVE_TASK: return removeTask(state, action);
        case actionTypes.UNDO_TASK: return undoTask(state, action);
        case actionTypes.CHANGE_CATEGORY_NAME: return changeCategoryName(state, action);
        case actionTypes.SET_CATEGORY: return setCategory(state, action);
        case actionTypes.SAVE_CATEGORY: return saveCategory(state);
        case actionTypes.REMOVE_CATEGORY: return removeCategory(state, action);
        case actionTypes.DEFAULT_CATEGORY: return defaultCategory(state);
        case actionTypes.DEFAULT_TASK: return defaultTask(state);
        default: return state;
    }
};

export default reducer;