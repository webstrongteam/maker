import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utility';

const initState = {
    category: {
        id: false,
        name: ''
    },
    categories: [{id: 0, name: 'Default'}],
    refresh: false
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
        case actionTypes.CHANGE_CATEGORY_NAME: return changeCategoryName(state, action);
        case actionTypes.SET_CATEGORY: return setCategory(state, action);
        case actionTypes.SAVE_CATEGORY: return saveCategory(state);
        case actionTypes.REMOVE_CATEGORY: return removeCategory(state, action);
        case actionTypes.DEFAULT_CATEGORY: return defaultCategory(state);
        default: return state;
    }
};

export default reducer;