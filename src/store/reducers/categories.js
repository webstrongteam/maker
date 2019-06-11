import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utility';

const initState = {
    category: {
        id: false,
        name: ''
    },
    categories: [],
    refresh: false
};

const initCategories = (state, action) => {
    return updateObject(state,{
        categories: action.categories,
        refresh: !state.refresh
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
        category: action.category
    });
};

const saveCategory = (state, action) => {
    return updateObject(state,{
        categories: action.categories,
        refresh: !state.refresh
    });
};

const removeCategory = (state, action) => {
    return updateObject(state,{
        categories: action.categories,
        refresh: !state.refresh
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
        case actionTypes.INIT_CATEGORIES: return initCategories(state, action);
        case actionTypes.CHANGE_CATEGORY_NAME: return changeCategoryName(state, action);
        case actionTypes.SET_CATEGORY: return setCategory(state, action);
        case actionTypes.SAVE_CATEGORY: return saveCategory(state, action);
        case actionTypes.REMOVE_CATEGORY: return removeCategory(state, action);
        case actionTypes.DEFAULT_CATEGORY: return defaultCategory(state);
        default: return state;
    }
};

export default reducer;