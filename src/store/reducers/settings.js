import * as actionTypes from '../actions/actionTypes';
import {updateObject} from '../../shared/utility';

const initState = {};

const updateSettings = (state, action) => {
    return updateObject(state, {
        ...action.settings
    });
};

const reducer = (state = initState, action) => {
    switch (action.type) {
        case actionTypes.UPDATE_SETTINGS:
            return updateSettings(state, action);
        default:
            return state;
    }
};

export default reducer;