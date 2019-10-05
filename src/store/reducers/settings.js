import * as actionTypes from '../actions/actionTypes';
import {updateObject} from '../../shared/utility';
import en from "../../../translations/en";
import pl from "../../../translations/pl";

const messages = {
    en, pl
};

const initState = {
    settings: {},
    locale: 'en',
    translations: messages['en']
};

const updateSettings = (state, action) => {
    return updateObject(state, {
        settings: action.settings,
        locale: action.settings.lang,
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