import * as actionTypes from './actionTypes'

export const updateSnackbar = (showSnackbar, snackbarText) => ({
	type: actionTypes.UPDATE_SNACKBAR,
	showSnackbar,
	snackbarText,
})
