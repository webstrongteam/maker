import * as actionTypes from '../actions/actionTypes';
import {updateObject} from '../../shared/utility';

const initState = {};

const initTheme = (state, action) => {
    return updateObject(state, {
        theme: action.theme
    });
};

const initThemes = (state, action) => {
    return updateObject(state, {
        themes: action.themes
    });
};

const reducer = (state = initState, action) => {
    switch (action.type) {
        case actionTypes.INIT_THEME:
            return initTheme(state, action);
        case actionTypes.INIT_THEMES:
            return initThemes(state, action);
        default:
            return state;
    }
};

export default reducer;