import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utility';

const initState = {
    newTask: {
        name: '',
        description: ''
    },
    modalTask: {
        name: '',
        description: ''
    },
    selectedTask: 0,
    tasks: []
};

const newName = (state, action) => {
    return updateObject(state,{
        newTask: {
            name: action.name,
            description: state.newTask.description
        }
    });
};

const newDescription = (state, action) => {
    return updateObject(state,{
        newTask: {
            name: state.newTask.name,
            description: action.description
        }
    });
};

const addNewTask = (state) => {
    if (state.newTask.name.trim() === "") return updateObject(state, state);
    state.tasks.map(task => {
        if (task.name === state.newTask.name) return updateObject(state, state);
    });
    return updateObject(state,{
        tasks: state.tasks.concat(state.newTask),
        newTask: {
            name: '',
            description: ''
        }
    });
};

const removeTask = (state, action) => {
    const index = state.tasks.indexOf(action.task);
    const newTasks = [...state.tasks.slice(0, index), ...state.tasks.slice(index + 1)];

    return updateObject(state,{
        tasks: newTasks
    });
};

const updateTask = (state, action) => {
    if (action.task.name.trim() === "") return updateObject(state, state);
    state.tasks.map(task => {
        if (task.name === action.task.name) return updateObject(state, state);
    });
    const newTasks = state.tasks;
    newTasks[state.selectedTask] = action.task;

    return updateObject(state,{
        tasks: newTasks
    });
};

const updateModalTask = (state, action) => {
    const index = state.tasks.indexOf(action.task);
    return updateObject(state,{
        modalTask: action.task,
        selectedTask: index,
    });
};

const reducer = (state = initState, action) => {
    switch (action.type) {
        case actionTypes.NEW_NAME: return newName(state, action);
        case actionTypes.NEW_DESCRIPTION: return newDescription(state, action);
        case actionTypes.ADD_NEW_TASK: return addNewTask(state);
        case actionTypes.REMOVE_TASK: return removeTask(state, action);
        case actionTypes.UPDATE_TASK: return updateTask(state, action);
        case actionTypes.UPDATE_MODAL_TASK: return updateModalTask(state, action);
        default: return state;
    }
};

export default reducer;