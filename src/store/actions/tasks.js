import { openDatabase } from 'expo-sqlite'
import moment from 'moment'
import * as Analytics from 'expo-firebase-analytics'
import * as actionTypes from './actionTypes'
import { dateTimeFormat, dateFormat } from '../../shared/consts'
import { convertNumberToDate, setCategories, dateTime } from '../../shared/utility'
import { configTask, deleteCalendarEvent, deleteLocalNotification } from '../../shared/configTask'

const db = openDatabase('maker.db')

export const onRefresh = () => ({
	type: actionTypes.REFRESH,
})

export const onInitToDo = (tasks, finished) => ({
	type: actionTypes.INIT_TODO,
	tasks,
	finished,
})

export const onInitTasks = (tasks) => ({
	type: actionTypes.INIT_TASKS,
	tasks,
})

export const onInitFinished = (tasks) => ({
	type: actionTypes.INIT_FINISHED,
	tasks,
})

export const initTask = (id, callback = () => null) => () => {
	db.transaction(
		(tx) => {
			tx.executeSql('select * from tasks where id = ?', [id], (_, { rows }) => {
				callback(rows._array[0])
			})
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const initFinishedTask = (id, callback = () => null) => () => {
	db.transaction(
		(tx) => {
			tx.executeSql('select * from finished where id = ?', [id], (_, { rows }) => {
				callback(rows._array[0])
			})
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const initToDo = (callback = () => null) => {
	let tasks
	let categories

	return (dispatch) => {
		db.transaction(
			(tx) => {
				tx.executeSql('select * from categories', [], (_, { rows }) => {
					categories = rows._array
				})
				tx.executeSql('select * from tasks', [], (_, { rows }) => {
					tasks = rows._array
				})
				tx.executeSql('select * from finished', [], async (_, { rows }) => {
					tasks = await setCategories(tasks, categories)
					const finished = await setCategories(rows._array, categories)

					callback(tasks, finished)
					dispatch(onInitToDo(tasks, finished))
				})
			},
			// eslint-disable-next-line no-console
			(err) => console.log(err),
		)
	}
}

export const initTasks = () => {
	let categories
	return (dispatch) => {
		db.transaction(
			(tx) => {
				tx.executeSql('select * from categories', [], (_, { rows }) => {
					categories = rows._array
				})
				tx.executeSql('select * from tasks', [], async (_, { rows }) => {
					const tasks = await setCategories(rows._array, categories)
					dispatch(onInitTasks(tasks))
				})
			},
			// eslint-disable-next-line no-console
			(err) => console.log(err),
		)
	}
}

export const initFinished = () => {
	let categories
	return (dispatch) => {
		db.transaction(
			(tx) => {
				tx.executeSql('select * from categories', [], (_, { rows }) => {
					categories = rows._array
				})
				tx.executeSql('select * from finished', [], async (_, { rows }) => {
					const tasks = await setCategories(rows._array, categories)
					dispatch(onInitFinished(tasks))
				})
			},
			// eslint-disable-next-line no-console
			(err) => console.log(err),
		)
	}
}

export const saveTask = (task, callback = () => null) => (dispatch) => {
	if (task.id) {
		db.transaction(
			(tx) => {
				tx.executeSql(
					`update tasks
											 set name            = ?,
													 description     = ?,
													 date            = ?,
													 category        = ?,
													 priority        = ?,
													 repeat          = ?,
													 event_id        = ?,
													 notification_id = ?
											 where id = ?;`,
					[
						task.name,
						task.description,
						task.date,
						task.category.id,
						task.priority,
						task.repeat,
						task.event_id,
						task.notification_id,
						task.id,
					],
					() => {
						Analytics.logEvent('updatedTask', {
							name: 'taskAction',
						})

						callback()
						dispatch(initTasks())
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
					'insert into tasks (name, description, date, category, priority, repeat, event_id, notification_id) values (?,?,?,?,?,?,?,?)',
					[
						task.name,
						task.description,
						task.date,
						task.category.id,
						task.priority,
						task.repeat,
						task.event_id,
						task.notification_id,
					],
					() => {
						Analytics.logEvent('createdTask', {
							name: 'taskAction',
						})

						callback()
						dispatch(initTasks())
					},
				)
			},
			// eslint-disable-next-line no-console
			(err) => console.log(err),
		)
	}
}

export const finishTask = (task, endTask, primaryColor, callback = () => null) => {
	let nextDate = task.date
	const format = dateTime(task.date) ? dateTimeFormat : dateFormat

	if (+task.repeat === parseInt(task.repeat, 10)) {
		// Other repeat
		if (task.repeat[0] === '6') {
			const repeatDays = task.repeat.substring(1).split('').sort()
			const actualWeekday = moment(task.date, format).day()
			let nextWeekday = repeatDays.find((weekday) => +weekday > +actualWeekday)

			if (nextWeekday) {
				nextDate = moment(task.date, format).day(nextWeekday)
			} else {
				nextDate = moment(task.date, format).day(+repeatDays[0] + 7)
			}
		} else {
			nextDate = moment(nextDate, format).add(
				+task.repeat.substring(1),
				`${convertNumberToDate(+task.repeat[0])}s`,
			)
		}
	} else if (task.repeat === 'onceDay') nextDate = moment(nextDate, format).add(1, 'days')
	else if (task.repeat === 'onceDayMonFri') {
		if (moment(task.date, format).day() === 5) {
			// Friday
			nextDate = moment(nextDate, format).add(3, 'days')
		} else if (moment(task.date, format).day() === 6) {
			// Saturday
			nextDate = moment(nextDate, format).add(2, 'days')
		} else {
			nextDate = moment(nextDate, format).add(1, 'days')
		}
	} else if (task.repeat === 'onceDaySatSun') {
		if (moment(task.date, format).day() === 6) {
			// Saturday
			nextDate = moment(nextDate, format).add(1, 'days')
		} else if (moment(task.date, format).day() === 0) {
			// Sunday
			nextDate = moment(nextDate, format).add(6, 'days')
		} else {
			// Other day
			nextDate = moment(nextDate, format).day(6)
		}
	} else if (task.repeat === 'onceWeek') nextDate = moment(nextDate, format).add(1, 'week')
	else if (task.repeat === 'onceMonth') nextDate = moment(nextDate, format).add(1, 'month')
	else if (task.repeat === 'onceYear') nextDate = moment(nextDate, format).add(1, 'year')

	nextDate = moment(nextDate, format).format(format)

	return (dispatch) => {
		if (task.repeat === 'noRepeat' || endTask) {
			db.transaction(
				(tx) => {
					tx.executeSql('delete from tasks where id = ?', [task.id])
					tx.executeSql(
						'insert into finished (name, description, date, category, priority, repeat, finish) values (?,?,?,?,?,?,1)',
						[task.name, task.description, task.date, task.category.id, task.priority, task.repeat],
						() => {
							Analytics.logEvent('finishedTask', {
								name: 'taskAction',
							})

							if (task.event_id !== false) {
								deleteCalendarEvent(task.event_id)
							}
							if (task.notification_id !== null) {
								deleteLocalNotification(task.notification_id)
							}
							callback()
							dispatch(initToDo())
						},
					)
				},
				// eslint-disable-next-line no-console
				(err) => console.log(err),
			)
		} else {
			db.transaction((tx) => {
				tx.executeSql(
					`update tasks
                                   set date = ?
                                   where id = ?;`,
					[nextDate, task.id],
					() => {
						Analytics.logEvent('repeatedTask', {
							name: 'taskAction',
						})

						task.date = nextDate
						configTask(task, primaryColor, task.event_id, task.notification_id !== null)
						callback()
						dispatch(initTasks())
					},
					// eslint-disable-next-line no-console
					(err) => console.log(err),
				)
			})
		}
	}
}

export const undoTask = (task, callback = () => null) => (dispatch) => {
	db.transaction(
		(tx) => {
			tx.executeSql('delete from finished where id = ?', [task.id])
			tx.executeSql(
				'insert into tasks (name, description, date, category, priority, repeat, event_id, notification_id) values (?,?,?,?,?,?,?,?)',
				[
					task.name,
					task.description,
					task.date,
					task.category.id,
					task.priority,
					task.repeat,
					task.event_id,
					task.notification_id,
				],
				() => {
					Analytics.logEvent('undoTask', {
						name: 'taskAction',
					})

					callback()
					dispatch(initToDo())
				},
			)
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const removeTask = (task, finished = true, callback = () => null) => (dispatch) => {
	if (finished) {
		db.transaction(
			(tx) => {
				tx.executeSql('delete from finished where id = ?', [task.id], () => {
					callback()
					dispatch(initFinished())
				})
			},
			// eslint-disable-next-line no-console
			(err) => console.log(err),
		)
	} else {
		db.transaction(
			(tx) => {
				tx.executeSql('delete from tasks where id = ?', [task.id], () => {
					Analytics.logEvent('removedTask', {
						name: 'taskAction',
					})

					if (task.event_id !== null) {
						deleteCalendarEvent(task.event_id)
					}
					if (task.notification_id !== null) {
						deleteLocalNotification(task.notification_id)
					}
					callback()
					dispatch(initTasks())
				})
			},
			// eslint-disable-next-line no-console
			(err) => console.log(err),
		)
	}
}
