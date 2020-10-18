import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import { timezone } from 'expo-localization'
import * as Calendar from 'expo-calendar'
import moment from 'moment'

/* eslint-disable no-param-reassign */
export const configTask = async (task, color, setEvent, setNotification) => {
	if (setEvent) {
		if (task.event_id) {
			await setCalendarEvent(task, color)
		} else {
			await setCalendarEvent(task, color).then((id) => {
				task.event_id = id
			})
		}
	} else if (task.event_id) {
		await deleteCalendarEvent(task.event_id).then(() => {
			task.event_id = null
		})
	}

	if (setNotification) {
		await setLocalNotification(task, color).then((id) => {
			task.notification_id = id
		})
	} else if (task.notification_id) {
		await deleteLocalNotification(task.notification_id).then(() => {
			task.notification_id = null
		})
	}

	return task
}

export const setLocalNotification = async (task, color) => {
	// Convert date
	const data = new Date(moment(task.date, 'DD-MM-YYYY HH:mm').format())

	// Remove old notification
	if (task.notification_id !== null) await deleteLocalNotification(task.notification_id)

	return setScheduleLocalNotification(task, data, color)
}

const setScheduleLocalNotification = async (task, data, color) => {
	return Notifications.scheduleNotificationAsync({
		content: {
			title: task.name,
			body: task.description ? task.description : ' ',
			data,
			sound: true,
			color,
			sticky: true,
		},
		trigger: data,
	})
}

export const setCalendarEvent = async (task, color, calendarId = null) => {
	// Set calendar event
	const calendars = await Calendar.getCalendarsAsync()
	if (Platform.OS === 'android') {
		// For android
		const calendar = calendars.find((c) => c.title === 'Maker - ToDo list')
		if (calendar) calendarId = calendar.id

		if (!calendarId) {
			// Create new calendar
			const details = {
				title: 'Maker - ToDo list',
				color,
				source: {
					isLocalAccount: true,
					name: 'Maker',
					type: Calendar.EntityTypes.REMINDER,
				},
				name: 'Maker',
				ownerAccount: 'Maker',
				timeZone: timezone,
				allowsModifications: true,
				allowedAvailabilities: [
					Calendar.Availability.BUSY,
					Calendar.Availability.FREE,
					Calendar.Availability.TENTATIVE,
				],
				allowedReminders: [
					Calendar.AlarmMethod.ALARM,
					Calendar.AlarmMethod.ALERT,
					Calendar.AlarmMethod.EMAIL,
					Calendar.AlarmMethod.SMS,
					Calendar.AlarmMethod.DEFAULT,
				],
				allowedAttendeeTypes: [Calendar.AttendeeType.REQUIRED, Calendar.AttendeeType.NONE],
				isVisible: true,
				isSynced: true,
				accessLevel: Calendar.CalendarAccessLevel.ROOT,
			}
			calendarId = await Calendar.createCalendarAsync(details)
				.then((id) => id)
				.catch(() => null)
		}
	} else if (Platform.OS === 'ios') {
		// For iOS
		const calendar = calendars.find((c) => c.title === 'Maker - ToDo list')
		if (calendar) calendarId = calendar.id

		if (!calendarId) {
			// Create new calendar
			const getDefaultCalendarSource = async () => {
				const defaultCalendars = calendars.filter((each) => each.allowedAvailabilities.length)
				return defaultCalendars[0].source
			}
			const defaultCalendarSource = await getDefaultCalendarSource()

			const details = {
				title: 'Maker - ToDo list',
				name: 'Maker',
				ownerAccount: 'personal',
				color,
				entityType: Calendar.EntityTypes.EVENT,
				sourceId: defaultCalendarSource.id,
				source: defaultCalendarSource,
				accessLevel: Calendar.CalendarAccessLevel.OWNER,
			}
			calendarId = await Calendar.createCalendarAsync(details)
				.then((id) => id)
				.catch(() => null)
		}
	}

	// Create event
	if (calendarId !== null) {
		const allDay = task.date.length < 13

		// Convert date
		let date
		if (allDay) {
			if (Platform.OS === 'android') {
				date = new Date(moment(task.date, 'DD-MM-YYYY').add(1, 'days').format())
			} else {
				date = new Date(moment(task.date, 'DD-MM-YYYY').format())
			}
		} else {
			date = new Date(moment(task.date, 'DD-MM-YYYY HH:mm').format())
		}

		const detailsEvent = {
			title: task.name,
			startDate: date,
			endDate: date,
			timeZone: timezone,
			notes: task.description,
			allDay,
		}

		if (task.event_id) {
			// Update existed event
			return Calendar.updateEventAsync(`${task.event_id}`, detailsEvent, {
				futureEvents: true,
			})
		}
		// Create new event
		return Calendar.createEventAsync(calendarId, detailsEvent)
	}
}

export const deleteCalendarEvent = async (event_id) => {
	await Calendar.deleteEventAsync(`${event_id}`, { futureEvents: true }).catch((err) => err)
}

export const deleteLocalNotification = async (notification_id) => {
	await Notifications.cancelScheduledNotificationAsync(notification_id)
}
