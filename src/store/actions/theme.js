import { openDatabase } from 'expo-sqlite'
import * as Analytics from 'expo-firebase-analytics'
import * as actionTypes from './actionTypes'

const db = openDatabase('maker.db')

export const onInitTheme = (theme) => ({
	type: actionTypes.INIT_THEME,
	theme,
})

export const onInitThemes = (themes) => ({
	type: actionTypes.INIT_THEMES,
	themes,
})

export const initTheme = (callback = () => null) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('select theme from settings', [], (_, { rows }) => {
				tx.executeSql(
					'select * from themes where id = ?',
					[rows._array[0].theme],
					(_, { rows }) => {
						callback(rows._array[0])
						dispatch(onInitTheme(rows._array[0]))
					},
				)
			})
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const initThemes = () => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('select * from themes', [], (_, { rows }) => {
				dispatch(onInitThemes(rows._array))
			})
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const initCustomTheme = (id, callback = () => null) => () => {
	db.transaction(
		(tx) => {
			tx.executeSql('select * from themes where id = ?', [id], (_, { rows }) => {
				callback(rows._array[0])
			})
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const setSelectedTheme = (id) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('update settings set theme = ? where id = 0;', [id], () => {
				Analytics.logEvent('changedTheme', {
					name: 'themeAction',
				})

				dispatch(initTheme())
			})
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const saveTheme = (theme) => (dispatch) => {
	if (theme.id) {
		db.transaction(
			(tx) => {
				tx.executeSql(
					'UPDATE themes SET name = ?, primaryColor = ?, primaryBackgroundColor = ?, secondaryBackgroundColor = ?, primaryTextColor = ?, secondaryTextColor = ?, thirdTextColor = ?, warningColor = ?, doneIconColor = ?, undoIconColor = ?, lowColor = ?, mediumColor = ?, highColor = ? WHERE id = ?;',
					[
						theme.name,
						theme.primaryColor,
						theme.primaryBackgroundColor,
						theme.secondaryBackgroundColor,
						theme.primaryTextColor,
						theme.secondaryTextColor,
						theme.thirdTextColor,
						theme.warningColor,
						theme.doneIconColor,
						theme.undoIconColor,
						theme.lowColor,
						theme.mediumColor,
						theme.highColor,
						theme.id,
					],
					() => {
						Analytics.logEvent('updatedTheme', {
							name: 'themeAction',
						})

						dispatch(initTheme())
					},
				)
			},
			// eslint-disable-next-line no-console
			(err) => console.log(err),
		)
	} else {
		db.transaction(
			(tx) => {
				tx.executeSql(
					'INSERT INTO themes (name, primaryColor, primaryBackgroundColor, secondaryBackgroundColor, primaryTextColor, secondaryTextColor, thirdTextColor, warningColor, doneIconColor, undoIconColor, lowColor, mediumColor, highColor) values (?,?,?,?,?,?,?,?,?,?,?,?,?);',
					[
						theme.name,
						theme.primaryColor,
						theme.primaryBackgroundColor,
						theme.secondaryBackgroundColor,
						theme.primaryTextColor,
						theme.secondaryTextColor,
						theme.thirdTextColor,
						theme.warningColor,
						theme.doneIconColor,
						theme.undoIconColor,
						theme.lowColor,
						theme.mediumColor,
						theme.highColor,
					],
					() => {
						Analytics.logEvent('createdTheme', {
							name: 'themeAction',
						})

						dispatch(initThemes())
					},
				)
			},
			// eslint-disable-next-line no-console
			(err) => console.log(err),
		)
	}
}

export const deleteTheme = (id) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('delete from themes where id = ?', [id], () => {
				Analytics.logEvent('deletedTheme', {
					name: 'themeAction',
				})

				dispatch(initThemes())
			})
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}
