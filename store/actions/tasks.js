import * as actionTypes from './actionTypes';

export const newName = (name) => {
    return {
        type: actionTypes.NEW_NAME,
        name
    }
};

export const newDescription = (description) => {
    return {
        type: actionTypes.NEW_DESCRIPTION,
        description
    }
};

export const addNewTask = () => {
    return {
        type: actionTypes.ADD_NEW_TASK
    };
};

export const removeTask = (task) => {
    return {
        type: actionTypes.REMOVE_TASK,
        task
    }
};

export const updateTask = (task) => {
    return {
        type: actionTypes.UPDATE_TASK,
        task
    }
};

export const updateModalTask = (task) => {
    return {
        type: actionTypes.UPDATE_MODAL_TASK,
        task
    }
};