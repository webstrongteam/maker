import { openDatabase } from 'expo-sqlite'
import * as actionTypes from './actionTypes'

const db = openDatabase('maker.db')

export const onInitLists = (lists) => ({
	type: actionTypes.INIT_LISTS,
	lists,
})

export const initLists = () => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('select * from lists', [], (_, { rows }) => {
				dispatch(onInitLists(rows._array))
			})
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const initList = (id, callback = () => null) => () => {
	db.transaction(
		(tx) => {
			tx.executeSql('select * from quickly_tasks where list_id = ?', [id], (_, { rows }) => {
				callback(rows._array)
			})
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const initQuicklyTask = (id, callback = () => null) => () => {
	db.transaction(
		(tx) => {
			tx.executeSql('select * from quickly_tasks where id = ?', [id], (_, { rows }) => {
				callback(rows._array[0])
			})
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const saveList = (list, callback) => (dispatch) => {
	if (list.id !== false) {
		db.transaction(
			(tx) => {
				tx.executeSql(
					`update lists
                                   set name = ?
                                   where id = ?;`,
					[list.name, list.id],
					() => {
						dispatch(initLists(), callback(list))
					},
				)
			},
			// eslint-disable-next-line no-console
			(err) => console.log(err),
		)
	} else {
		db.transaction(
			(tx) => {
				tx.executeSql('insert into lists (name) values (?)', [list.name])
				tx.executeSql('select * from lists ORDER BY id DESC', [], (_, { rows }) => {
					dispatch(initLists(), callback(rows._array[0]))
				})
			},
			// eslint-disable-next-line no-console
			(err) => console.log(err),
		)
	}
}

export const saveQuicklyTask = (quicklyTask, list, callback = () => {}) => () => {
	const addQuicklyTask = (list_id = list.id) => {
		if (quicklyTask.id !== false) {
			db.transaction(
				(tx) => {
					tx.executeSql(
						`update quickly_tasks
                                       set name = ?
                                       where id = ?;`,
						[quicklyTask.name, quicklyTask.id],
						() => {
							callback({ id: list_id, name: list.name })
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
						'insert into quickly_tasks (name, list_id) values (?,?)',
						[quicklyTask.name, list_id],
						() => {
							callback({ id: list_id, name: list.name })
						},
					)
				},
				// eslint-disable-next-line no-console
				(err) => console.log(err),
			)
		}
	}

	if (list.id !== false) {
		addQuicklyTask()
	} else {
		db.transaction(
			(tx) => {
				tx.executeSql('insert into lists (name) values (?)', [list.name], (_, { insertId }) => {
					addQuicklyTask(insertId)
				})
			},
			// eslint-disable-next-line no-console
			(err) => console.log(err),
		)
	}
}

export const removeList = (id) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('delete from quickly_tasks where list_id = ?', [id])
			tx.executeSql('delete from lists where id = ?', [id], () => {
				dispatch(initLists())
			})
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const removeQuicklyTask = (id, callback) => () => {
	db.transaction(
		(tx) => {
			tx.executeSql('delete from quickly_tasks where id = ?', [id], () => {
				callback()
			})
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}
