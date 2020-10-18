import * as actionTypes from './actionTypes'

export const updateModal = (showModal, modal) => ({
	type: actionTypes.UPDATE_MODAL,
	showModal,
	modal,
})

export const updateSnackbar = (showSnackbar, snackbarText) => ({
	type: actionTypes.UPDATE_SNACKBAR,
	showSnackbar,
	snackbarText,
})
