import * as actionTypes from '../actions/actionTypes';
import {updateObject} from '../../shared/utility';

const initState = {
    showModal: false,
    modal: {},
    showSnackbar: false,
    snackbarText: ''
};

const updateModal = (state, action) => {
    return updateObject(state, {
        showModal: action.showModal,
        modal: action.modal
    });
};

const updateSnackbar = (state, action) => {
    return updateObject(state, {
        showSnackbar: action.showSnackbar,
        snackbarText: action.snackbarText
    });
};

const reducer = (state = initState, action) => {
    switch (action.type) {
        case actionTypes.UPDATE_MODAL:
            return updateModal(state, action);
        case actionTypes.UPDATE_SNACKBAR:
            return updateSnackbar(state, action);
        default:
            return state;
    }
};

export default reducer;