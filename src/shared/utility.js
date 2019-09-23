import {Platform} from 'react-native';
import moment from 'moment';
import * as Calendar from 'expo-calendar';
import * as Localization from 'expo-localization';
import * as Permissions from 'expo-permissions';

export const updateObject = (oldObject, newProps) => {
    return {
        ...oldObject,
        ...newProps
    };
};

export const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const sortingData = (array, field, type) => {
    if (field === 'date') { // SORTING DATE
        array.sort((a, b) => {
            let dateA = a[field];
            let dateB = b[field];
            const dateAFormat = dateA.length > 12 ? 'DD-MM-YYYY - HH:mm' : 'DD-MM-YYYY';
            const dateBFormat = dateB.length > 12 ? 'DD-MM-YYYY - HH:mm' : 'DD-MM-YYYY';
            if (a[field] !== '') dateA = moment(a[field], dateAFormat);
            if (b[field] !== '') dateB = moment(b[field], dateBFormat);
            if (type === 'ASC') return dateA < dateB;
            if (type === 'DESC') return dateA > dateB;
        });
    } else if (field === 'priority') { // SORTING PRIORITY
        array.sort((a, b) => {
            const convertPriority = (priority) => {
                switch (priority) {
                    case "low":
                        return 1;
                    case "medium":
                        return 2;
                    case "high":
                        return 3;
                    default:
                        return 0;
                }
            };

            let A = convertPriority(a[field]);
            let B = convertPriority(b[field]);

            if (type === 'ASC') return A < B;
            if (type === 'DESC') return A > B;
        });
    } else { // DEFAULT SORTING
        if (type === 'ASC') array.sort((a, b) => ('' + a[field]).localeCompare(b[field]));
        if (type === 'DESC') array.sort((a, b) => ('' + b[field]).localeCompare(a[field]));
    }
};

export const sortingByType = (array, sorting, sortingType) => {
    switch (sorting) {
        case "byAZ":
            return sortingData(array, 'name', sortingType);
        case "byDate":
            return sortingData(array, 'date', sortingType);
        case "byCategory":
            return sortingData(array, 'category', sortingType);
        case "byPriority":
            return sortingData(array, 'priority', sortingType);
        default:
            return array;
    }
};

export const convertNumberToDate = (number) => {
    switch (number) {
        case 0:
            return "days";
        case 1:
            return "week";
        case 2:
            return "month";
        case 3:
            return "year";
        default:
            return "days"
    }
};

export const generateDialogObject = (title, description, buttons) => {
    let object = {
        title,
        description,
        buttons: []
    };
    Object.keys(buttons).map(key => {
        object.buttons.push({
            label: key,
            onPress: buttons[key]
        })
    });
    return object;
};

export const generateInputDialogObject = (title, focus, value, onChange, buttons) => {
    let object = {
        title,
        focus,
        value,
        onChange,
        buttons: []
    };
    Object.keys(buttons).map(key => {
        object.buttons.push({
            label: key,
            onPress: buttons[key]
        })
    });
    return object;
};

export const setCalendarEvent = async (task, theme, calendarId = false) => {
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
                color: theme.primaryColor,
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
                .catch(() => calendarId = false)
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
                    color: theme.primaryColor,
                    entityType: Calendar.EntityTypes.REMINDER,
                    sourceId: 'Maker',
                };
                await Calendar.createCalendarAsync(details)
                    .then((id) => calendarId = id)
                    .catch(() => calendarId = false)
            }
        }
    }

    // Create event
    if (calendarId !== false) {
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

        if (!!task.event_id) {
            // Update existed event
            return await Calendar.updateEventAsync(task.event_id, detailsEvent, {futureEvent: true});
        } else {
            return await Calendar.createEventAsync(calendarId, detailsEvent);
        }
    }
};

export const deleteCalendarEvent = async (event_id) => {
    await Calendar.deleteEventAsync(event_id, {futureEvent: true})
        .catch((err) => err)
};

export const valid = (controls, value, name, callback) => {
    let validStatus = true;

    // Validation system
    if (controls[name].characterRestriction) {
        if (value.length > controls[name].characterRestriction) {
            controls[name].error = `${capitalize(name)} is too long!`;
            validStatus = false;
        }
    }
    if (controls[name].number) {
        if (+value !== parseInt(value, 10)) {
            controls[name].error = `${capitalize(name)} must be a number!`;
            validStatus = false;
        } else {
            if (controls[name].positiveNumber) {
                if (+value < 1) {
                    controls[name].error = `${capitalize(name)} must be greater than zero!`;
                    validStatus = false;
                }
            }
        }
    }
    if (controls[name].required) {
        if (value.trim() === '') {
            controls[name].error = `${capitalize(name)} is required!`;
            validStatus = false;
        }
    }

    if (validStatus && controls[name].error) {
        delete controls[name].error;
    }

    callback(controls);
};