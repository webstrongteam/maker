import * as actionTypes from '../actions/actionTypes';
import {updateObject} from '../../shared/utility';
import en from "../../../translations/en.json";
import pl from "../../../translations/pl.json";

const messages = {
    en, pl
};

const initState = {
    settings: {},
    translations: messages['en']
};

const updateSettings = (state, action) => {
    return updateObject(state, {
        settings: action.settings,
        translations: messages[action.settings.lang]
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