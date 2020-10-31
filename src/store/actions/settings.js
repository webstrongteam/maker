import { openDatabase } from 'expo-sqlite'
import * as Analytics from 'expo-firebase-analytics'
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
		// eslint-disable-next-line no-console
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
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const changeTimeFormat = (value) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('update settings set timeFormat = ? where id = 0;', [value], () => {
				Analytics.logEvent('changedTimeFormat', {
					name: 'settingsAction',
				})

				dispatch(initSettings())
			})
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const changeFirstDayOfWeek = (value) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('update settings set firstDayOfWeek = ? where id = 0;', [value], () => {
				Analytics.logEvent('changedFirstDayOfWeek', {
					name: 'settingsAction',
				})

				dispatch(initSettings())
			})
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const changeLang = (value) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('update settings set lang = ? where id = 0;', [value], () => {
				Analytics.logEvent('changedLang', {
					name: 'settingsAction',
				})

				dispatch(initSettings())
			})
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const changeConfirmFinishingTask = (value) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('update settings set confirmFinishingTask = ? where id = 0;', [value], () => {
				Analytics.logEvent('changedConfirmFinishingTask', {
					name: 'settingsAction',
				})

				dispatch(initSettings())
			})
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const changeConfirmRepeatingTask = (value) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('update settings set confirmRepeatingTask = ? where id = 0;', [value], () => {
				Analytics.logEvent('changedConfirmRepeatingTask', {
					name: 'settingsAction',
				})

				dispatch(initSettings())
			})
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const changeConfirmDeletingTask = (value) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('update settings set confirmDeletingTask = ? where id = 0;', [value], () => {
				Analytics.logEvent('changedConfirmDeletingTask', {
					name: 'settingsAction',
				})

				dispatch(initSettings())
			})
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const changeHideTabView = (value) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('update settings set hideTabView = ? where id = 0;', [value], () => {
				Analytics.logEvent('changedHideTabView', {
					name: 'settingsAction',
				})

				dispatch(initSettings())
			})
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const changeShowDeadlineTime = (value) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('update settings set showDeadlineTime = ? where id = 0;', [value], () => {
				Analytics.logEvent('changeShowDeadlineTime', {
					name: 'settingsAction',
				})

				dispatch(initSettings())
			})
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}
