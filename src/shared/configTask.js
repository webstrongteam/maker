import {Platform} from "react-native";
import * as Permissions from "expo-permissions";
import {Notifications} from "expo";
import * as Calendar from "expo-calendar";
import * as Localization from 'expo-localization';
import moment from "moment";

export const configTask = async (task, color, setEvent, setNotification) => {
    if (setEvent) {
        if (task.event_id) {
            await setCalendarEvent(task, color);
        } else {
            await setCalendarEvent(task, color).then((id) => {
                task.event_id = id;
            })
        }
    } else {
        if (task.event_id) {
            await deleteCalendarEvent(task.event_id).then(() => {
                task.event_id = null;
            })
        }
    }

    if (setNotification) {
        await setLocalNotification(task, color).then((id) => {
            task.notification_id = id;
        })
    } else {
        if (task.notification_id) {
            await deleteLocalNotification(task.notification_id).then(() => {
                task.notification_id = null;
            })
        }
    }

    return task;
};

export const setLocalNotification = async (task, color) => {
    let notificationStatus;

    const {status: existingStatus} = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    notificationStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const {status} = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        notificationStatus = status;
    }

    if (notificationStatus === 'granted') {
        // Convert date
        const date = new Date(moment(task.date, 'DD-MM-YYYY HH:mm').format());

        if (task.notification_id !== null) await deleteLocalNotification(task.notification_id);

        return await setScheduleLocalNotification(task, date, color);
    }
};

const setScheduleLocalNotification = async (task, date, color) => {
    const getTime = date.valueOf();
    return await Notifications.scheduleLocalNotificationAsync(
        {
            title: task.name,
            body: task.description,
            data: date,
            android: {
                color: color
            },
            ios: {
                sound: true
            }
        },
        {
            time: getTime
        });
};

export const setCalendarEvent = async (task, color, calendarId = null) => {
    // Set calendar event
    const {status} = await Permissions.askAsync('calendar');
    const calendars = await Calendar.getCalendarsAsync();
    if (status === 'granted' && Platform.OS !== 'ios') {
        // For android
        for (let i = 0; i < calendars.length; i++) {
            if (calendars[i].ownerAccount === 'Maker' && calendars[i].allowsModifications) {
                calendarId = calendars[i].id
            }
        }
        if (!calendarId) {
            // Create new calendar
            const details = {
                title: 'Maker - ToDo list',
                color: color,
                source: {
                    isLocalAccount: true,
                    name: 'Maker'
                },
                name: 'Maker - ToDo list',
                ownerAccount: 'Maker',
                timeZone: Localization.timezone,
                allowsModifications: true,
                allowedAvailabilities: [Calendar.Availability.BUSY, Calendar.Availability.FREE, Calendar.Availability.TENTATIVE],
                allowedReminders: [Calendar.AlarmMethod.ALARM, Calendar.AlarmMethod.ALERT, Calendar.AlarmMethod.EMAIL, Calendar.AlarmMethod.SMS, Calendar.AlarmMethod.DEFAULT],
                allowedAttendeeTypes: [Calendar.AttendeeType.REQUIRED, Calendar.AttendeeType.NONE],
                type: Calendar.EntityTypes.REMINDER,
                isVisible: true,
                isSynced: true,
                accessLevel: Calendar.CalendarAccessLevel.ROOT
            };
            await Calendar.createCalendarAsync(details)
                .then((id) => calendarId = id)
                .catch(() => calendarId = null)
        }
    } else if (Platform.OS === 'ios') {
        // For iOS # To Fix #
        const {statusIos} = await Permissions.askAsync('reminders');
        if (statusIos === 'granted') {
            for (let i = 0; i < calendars.length; i++) {
                if (calendars[i].ownerAccount === 'Maker' && calendars[i].allowsModifications) {
                    calendarId = calendars[i].id
                }
            }
            if (!calendarId) {
                // Create new calendar
                const details = {
                    title: 'Maker - ToDo list',
                    color: color,
                    entityType: Calendar.EntityTypes.REMINDER,
                    sourceId: 'Maker',
                };
                await Calendar.createCalendarAsync(details)
                    .then((id) => calendarId = id)
                    .catch(() => calendarId = null)
            }
        }
    }

    // Create event
    if (calendarId !== null) {
        const allDay = task.date.length < 13;

        let date;
        // Convert date
        if (allDay) {
            date = new Date(moment(task.date, 'DD-MM-YYYY').add(1, 'days').format());
        } else {
            date = new Date(moment(task.date, 'DD-MM-YYYY HH:mm').format());
        }

        const detailsEvent = {
            title: task.name,
            startDate: date,
            endDate: date,
            timeZone: Localization.timezone,
            notes: task.description,
            allDay
        };

        if (task.event_id) {
            // Update existed event
            return await Calendar.updateEventAsync(task.event_id + '', detailsEvent, {futureEvent: true});
        } else {
            // Create new event
            return await Calendar.createEventAsync(calendarId, detailsEvent);
        }
    }
};

export const deleteCalendarEvent = async (event_id) => {
    await Calendar.deleteEventAsync(event_id + '', {futureEvent: true})
        .catch((err) => err)
};

export const deleteLocalNotification = async (notification_id) => {
    await Notifications.cancelScheduledNotificationAsync(+notification_id);
};