import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utility';
import moment from 'moment';

const initState = {
    task: {
        id: false,
        name: '',
        description: '',
        date: moment(new Date()).format('DD-MM-YYYY'),
        category: 'default',
        priority: 'none'
    },
    tasks: []
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
            tasks: updatedTasks
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

    return updateObject(state,{
        tasks: updatedTasks,
    });
};

const defaultTask = (state) => {
    return updateObject(state,{
        task: {
            id: false,
            name: '',
            description: '',
            date: moment(new Date()).format('DD-MM-YYYY'),
            category: 'default',
            priority: 'none'
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
        case actionTypes.DEFAULT_TASK: return defaultTask(state);
        default: return state;
    }
};

export default reducer;