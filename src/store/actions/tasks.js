import * as actionTypes from './actionTypes';

export const changeName = (name) => {
    return {
        type: actionTypes.CHANGE_TASK_NAME,
        name
    }
};

export const changeDescription = (description) => {
    return {
        type: actionTypes.CHANGE_TASK_DESCRIPTION,
        description
    }
};

export const changeDate = (date) => {
    return {
        type: actionTypes.CHANGE_TASK_DATE,
        date
    }
};

export const changeCategory = (category) => {
    return {
        type: actionTypes.CHANGE_TASK_CATEGORY,
        category
    }
};

export const changePriority = (priority) => {
    return {
        type: actionTypes.CHANGE_TASK_PRIORITY,
        priority
    }
};

export const setTask = (task) => {
    return {
        type: actionTypes.SET_TASK,
        task
    }
};

export const saveTask = () => {
    return {
        type: actionTypes.SAVE_TASK
    };
};

export const removeTask = () => {
    return {
        type: actionTypes.REMOVE_TASK
    }
};

export const defaultTask = () => {
    return {
        type: actionTypes.DEFAULT_TASK
    }
};