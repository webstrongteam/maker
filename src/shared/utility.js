import { Dimensions, NativeModules, Platform } from 'react-native'
import moment from 'moment'

export const updateObject = (oldObject, newProps) => ({
	...oldObject,
	...newProps,
})

export const { width, height } = Dimensions.get('window')

export const dateTime = (date) => date.length > 12

export const getLocale = () => {
	const locale =
		Platform.OS === 'ios'
			? NativeModules.SettingsManager.settings.AppleLocale
			: NativeModules.I18nManager.localeIdentifier
	if (locale === 'pl_PL') {
		return 'pl'
	}
	return 'en'
}

export const getTimeVariant = (number, verb, lang, translations) => {
	let correctVerb = translations[verb]

	if (!number) {
		return correctVerb
	}

	const textNumber = `${Math.abs(number)}`

	if (number > 1 || number < -1) {
		correctVerb = translations[`${verb}s`]
	}

	// set prefix for PL variety
	if (lang === 'pl' && correctVerb && verb !== 'day') {
		const getCorrectVerb = () => {
			if (verb !== 'month') {
				correctVerb = correctVerb.slice(0, -1)
			} else {
				correctVerb = translations.miesiecy
			}
		}

		if (textNumber.length > 1) {
			if ([0, 1, 5, 6, 7, 8, 9].includes(+textNumber[textNumber.length - 1])) {
				getCorrectVerb()
			} else if (
				textNumber[textNumber.length - 2] === '1' &&
				[2, 3, 4, 5, 6, 7, 8, 9].includes(+textNumber[textNumber.length - 1])
			) {
				getCorrectVerb()
			}
		} else if ([5, 6, 7, 8, 9].includes(+textNumber)) {
			getCorrectVerb()
		}
	}

	return correctVerb
}

export const setCategories = (tasks, categories) => {
	return Promise.all(
		tasks.map((task) => {
			let findCate
			if (!isNaN(+task.category)) {
				findCate = categories.find(({ id }) => +id === +task.category)
			} else {
				findCate = categories.find(({ name }) => name === task.category)
			}

			if (findCate) task.category = findCate
			else task.category = categories[0]
		}),
	).then(() => tasks)
}

export const sortingData = (array, field, type) => {
	const nestedSort = (a, b) => {
		if (a.name === b.name) {
			return a.id > b.id
		}
		return `${a.name}`.localeCompare(b.name)
	}

	if (field === 'date') {
		const getCorrectDate = (date) => {
			if (date.length > 12) {
				return moment(date, 'DD-MM-YYYY - HH:mm')
			}
			return moment(date, 'DD-MM-YYYY').endOf('day')
		}

		// SORTING DATE
		return array.sort((a, b) => {
			let dateA = a[field]
			let dateB = b[field]

			if (a[field] !== '') dateA = getCorrectDate(a[field])
			if (b[field] !== '') dateB = getCorrectDate(b[field])
			if (`${dateA}` === `${dateB}`) return nestedSort(a, b)

			if (type === 'ASC') return dateA > dateB
			return dateA < dateB // DESC
		})
	}
	if (field === 'priority') {
		// SORTING PRIORITY
		return array.sort((a, b) => {
			const convertPriority = (priority) => {
				switch (priority) {
					case 'low':
						return 1
					case 'medium':
						return 2
					case 'high':
						return 3
					default:
						return 0
				}
			}

			const A = convertPriority(a[field])
			const B = convertPriority(b[field])

			if (A === B) return nestedSort(a, b)

			if (type === 'ASC') return A < B
			return A > B // DESC
		})
	}
	if (field === 'category') {
		// SORTING CATEGORY
		if (type === 'ASC') return array.sort((a, b) => `${a[field].name}`.localeCompare(b[field].name))
		return array.sort((a, b) => `${b[field].name}`.localeCompare(a[field].name)) // DESC
	}
	// DEFAULT SORTING
	if (type === 'ASC') {
		return array.sort((a, b) => {
			if (a[field] === b[field]) return nestedSort(a, b)
			return `${a[field]}`.localeCompare(b[field])
		})
	}
	if (type === 'DESC') {
		return array.sort((a, b) => {
			if (a[field] === b[field]) return nestedSort(a, b)
			return `${b[field]}`.localeCompare(a[field])
		})
	}
}

export const sortingByType = (array, sorting, sortingType) => {
	switch (sorting) {
		case 'byAZ':
			return sortingData(array, 'name', sortingType)
		case 'byDate':
			return sortingData(array, 'date', sortingType)
		case 'byCategory':
			return sortingData(array, 'category', sortingType)
		case 'byPriority':
			return sortingData(array, 'priority', sortingType)
		default:
			return array
	}
}

export const convertNumberToDate = (number) => {
	switch (number) {
		case 0:
			return 'minute'
		case 1:
			return 'hour'
		case 2:
			return 'day'
		case 3:
			return 'week'
		case 4:
			return 'month'
		case 5:
			return 'year'
		default:
			return 'day'
	}
}

export const convertDaysIndex = (daysIndex, translations) =>
	daysIndex
		.split('')
		.sort((a, b) => a > b)
		.map((index) => translations[`day${index}`])
		.join(', ')

export const generateDialogObject = (cancelHandler, title, body, buttons = {}) => {
	const object = {
		cancelHandler,
		title,
		body,
		buttons: [],
	}
	Object.keys(buttons).forEach((key) => {
		object.buttons.push({
			label: key,
			onPress: buttons[key],
		})
	})
	return object
}

export const convertPriorityNames = (priority, translations) => {
	if (priority === 'none') {
		return translations.priorityNone
	}
	if (priority === 'low') {
		return translations.priorityLow
	}
	if (priority === 'medium') {
		return translations.priorityMedium
	}
	if (priority === 'high') {
		return translations.priorityHigh
	}
}

export const convertRepeatNames = (repeat, translations) => {
	if (repeat !== 'otherOption') {
		return translations[repeat]
	}
	return `${translations.other}...`
}

export const valid = (control, value, translations, callback) => {
	let validStatus = true

	if (value === null || value === undefined) {
		// Set initial error
		control.error = true
	} else {
		// Validation system
		if (control.characterRestriction) {
			if (value.length > control.characterRestriction) {
				control.error = translations.tooLong
				validStatus = false
			}
		}
		if (control.number) {
			if (+value !== parseInt(value, 10)) {
				control.error = translations.number
				validStatus = false
			} else if (control.positiveNumber) {
				if (+value < 1) {
					control.error = translations.greaterThanZero
					validStatus = false
				}
			}
		}
		if (control.required) {
			if (value.trim() === '') {
				control.error = translations.required
				validStatus = false
			}
		}

		if (validStatus && control.error) {
			delete control.error
		}
	}

	callback(control)
}

export const checkValid = (control, value) => !!(!control.error && value && value.trim() !== '')

export const dateDiff = (firstDate, secondDate, translations, lang) => {
	const getCorrectPrefix = (diff, prefix) => {
		let correctPrefix = getTimeVariant(+diff, prefix, lang, translations)

		if (diff < 0) {
			correctPrefix = `${correctPrefix} ${translations.ago}`
		}

		return correctPrefix
	}

	let daysDiff
	if (firstDate.date > secondDate.date) {
		daysDiff = moment(firstDate.date)
			.endOf('day')
			.diff(moment(secondDate.date).startOf('day'), 'days')
	} else if (firstDate.date < secondDate.date) {
		daysDiff = moment(firstDate.date)
			.startOf('day')
			.diff(moment(secondDate.date).endOf('day'), 'days')
	}

	if (daysDiff) {
		return { value: Math.abs(daysDiff), prefix: getCorrectPrefix(daysDiff, 'day') }
	}

	if (firstDate.dateTime && secondDate.dateTime) {
		const minutesDiff = firstDate.date.diff(secondDate.date, 'minutes')
		const hoursDiff = firstDate.date.diff(secondDate.date, 'hours')

		if (hoursDiff !== 0 && hoursDiff < 24) {
			return { value: Math.abs(hoursDiff), prefix: getCorrectPrefix(hoursDiff, 'hour') }
		}

		if (minutesDiff !== 0 && minutesDiff < 60) {
			return { value: Math.abs(minutesDiff), prefix: getCorrectPrefix(minutesDiff, 'minute') }
		}
	}
}

const formatNumber = (number, includePrecision) =>
	number
		.toFixed(includePrecision ? 2 : 0)
		.replace(includePrecision ? /\d(?=(\d{3})+\.)/g : /(.)(?=(\d{3})+$)/g, '$&\xa0')
		.replace('.', ',')

const getVarietyOption = (value, singular, plural, genitive, lang) => {
	if (lang !== 'pl') {
		if (value > 1) {
			return plural
		}
		return singular
	}

	if (value === 1) {
		return singular
	}

	if ([2, 3, 4].includes(value % 10) && ![12, 13, 14].includes(value % 100)) {
		return plural
	}

	return genitive || plural
}

export const getVariety = (value, singular, plural, genitive, lang) =>
	`${formatNumber(value, false)} ${getVarietyOption(value, singular, plural, genitive, lang)}`
