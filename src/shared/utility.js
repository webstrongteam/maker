import moment from 'moment'
import { Dimensions } from 'react-native'

export const updateObject = (oldObject, newProps) => ({
	...oldObject,
	...newProps,
})

export const { width } = Dimensions.get('window')

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
		// SORTING DATE
		return array.sort((a, b) => {
			let dateA = a[field]
			let dateB = b[field]
			const dateAFormat = dateA.length > 12 ? 'DD-MM-YYYY - HH:mm' : 'DD-MM-YYYY'
			const dateBFormat = dateB.length > 12 ? 'DD-MM-YYYY - HH:mm' : 'DD-MM-YYYY'
			if (a[field] !== '') dateA = moment(a[field], dateAFormat)
			if (b[field] !== '') dateB = moment(b[field], dateBFormat)
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
			return 'minutes'
		case 1:
			return 'hours'
		case 2:
			return 'days'
		case 3:
			return 'weeks'
		case 4:
			return 'months'
		case 5:
			return 'years'
		default:
			return 'days'
	}
}

export const convertDaysIndex = (daysIndex, translations) =>
	daysIndex
		.split('')
		.sort((a, b) => a > b)
		.map((index) => translations[`day${index}`])
		.join(', ')

export const generateDialogObject = (title, body, buttons = {}) => {
	const object = {
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
