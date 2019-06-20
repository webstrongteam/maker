import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utility';

const initState = {
    categories: [],
    refresh: false
};

const initCategories = (state, action) => {
    return updateObject(state,{
        categories: action.categories,
        refresh: !state.refresh
    });
};

const reducer = (state = initState, action) => {
    switch (action.type) {
        case actionTypes.INIT_CATEGORIES: return initCategories(state, action);
        default: return state;
    }
};

export default reducer;