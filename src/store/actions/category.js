import * as actionTypes from './actionTypes';

export const changeCategoryName = (name) => {
    return {
        type: actionTypes.CHANGE_CATEGORY_NAME,
        name
    }
};

export const setCategory = (category) => {
    return {
        type: actionTypes.SET_CATEGORY,
        category
    }
};

export const saveCategory = () => {
    return {
        type: actionTypes.SAVE_CATEGORY,
    }
};

export const removeCategory = (category) => {
    return {
        type: actionTypes.REMOVE_CATEGORY,
        category
    }
};

export const defaultCategory = () => {
    return {
        type: actionTypes.DEFAULT_CATEGORY
    }
};