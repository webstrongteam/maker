import * as actionTypes from '../actions/actionTypes'
import { updateObject } from '../../shared/utility'

const initState = {
	lists: false,
}

const initLists = (state, action) =>
	updateObject(state, {
		lists: action.lists,
	})

const reducer = (state = initState, action) => {
	switch (action.type) {
		case actionTypes.INIT_LISTS:
			return initLists(state, action)
		default:
			return state
	}
}

export default reducer
