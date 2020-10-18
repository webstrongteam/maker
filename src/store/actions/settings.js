import { openDatabase } from 'expo-sqlite'
import * as actionTypes from './actionTypes'

const db = openDatabase('maker.db')

export const onUpdateSettings = (settings) => ({
	type: actionTypes.UPDATE_SETTINGS,
	settings,
})

export const initSettings = (callback = () => null) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('select * from settings;', [], (_, { rows }) => {
				callback(rows._array[0].lang)
				dispatch(onUpdateSettings(rows._array[0]))
			})
		},
		(err) => console.log(err),
	)
}

export const changeSorting = (sorting, type) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql(
				'update settings set sorting = ?, sortingType = ? where id = 0;',
				[sorting, type],
				() => {
					dispatch(initSettings())
				},
			)
		},
		(err) => console.log(err),
	)
}

export const changeTimeFormat = (value) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('update settings set timeFormat = ? where id = 0;', [value], () => {
				dispatch(initSettings())
			})
		},
		(err) => console.log(err),
	)
}

export const changeFirstDayOfWeek = (value) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('update settings set firstDayOfWeek = ? where id = 0;', [value], () => {
				dispatch(initSettings())
			})
		},
		(err) => console.log(err),
	)
}

export const changeLang = (value) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('update settings set lang = ? where id = 0;', [value], () => {
				dispatch(initSettings())
			})
		},
		(err) => console.log(err),
	)
}

export const changeConfirmFinishingTask = (value) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('update settings set confirmFinishingTask = ? where id = 0;', [value], () => {
				dispatch(initSettings())
			})
		},
		(err) => console.log(err),
	)
}

export const changeConfirmRepeatingTask = (value) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('update settings set confirmRepeatingTask = ? where id = 0;', [value], () => {
				dispatch(initSettings())
			})
		},
		(err) => console.log(err),
	)
}

export const changeConfirmDeletingTask = (value) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('update settings set confirmDeletingTask = ? where id = 0;', [value], () => {
				dispatch(initSettings())
			})
		},
		(err) => console.log(err),
	)
}

export const changeHideTabView = (value) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('update settings set hideTabView = ? where id = 0;', [value], () => {
				dispatch(initSettings())
			})
		},
		(err) => console.log(err),
	)
}
