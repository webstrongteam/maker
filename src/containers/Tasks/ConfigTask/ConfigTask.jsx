import React, { Component } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { IconToggle, Toolbar, Checkbox } from 'react-native-material-ui'
import { askAsync, CALENDAR, REMINDERS } from 'expo-permissions'
import moment from 'moment'
import { flex } from '../../../shared/styles'
import { dateFormat, dateTimeFormat, timeFormat, timeFormatA } from '../../../shared/consts'
import Subheader from '../../../components/Subheader/Subheader'
import Spinner from '../../../components/Spinner/Spinner'
import Template from '../../Template/Template'
import Input from '../../../components/Input/Input'
import ConfigCategory from '../../Categories/ConfigCategory/ConfigCategory'
import OtherRepeat from './OtherRepeat/OtherRepeat'
import {
	checkValid,
	convertDaysIndex,
	convertNumberToDate,
	convertPriorityNames,
	convertRepeatNames,
	dateTime,
	generateDialogObject,
	getTimeVariant,
} from '../../../shared/utility'
import { configTask } from '../../../shared/configTask'
import Dialog from '../../../components/Dialog/Dialog'
import styles from './ConfigTask.styles'

import * as actions from '../../../store/actions'
import { connect } from 'react-redux'

class ConfigTask extends Component {
	state = {
		task: {
			id: false,
			name: '',
			description: '',
			date: '',
			repeat: 'noRepeat',
			category: this.props.categories[0],
			priority: 'none',
			event_id: null,
			notification_id: null,
		},
		controls: {
			name: {
				label: this.props.translations.nameLabel,
				required: true,
				characterRestriction: 40,
			},
			description: {
				label: this.props.translations.descriptionLabel,
				multiline: true,
			},
		},
		dialog: null,
		showDialog: false,
		otherOption: null,
		taskCopy: null,
		selectedTime: 0,
		showOtherRepeat: false,
		editTask: null,
		showConfigCategory: false,
		setEvent: false,
		setNotification: false,
		isVisibleDate: false,
		isVisibleTime: false,
		loading: true,
	}

	componentDidMount() {
		const { navigation } = this.props
		const task = navigation.getParam('task', false)
		const category = navigation.getParam('category', false)

		if (task !== false) this.initTask(task)
		else {
			const { task } = this.state
			const { translations } = this.props

			if (category && category.name !== translations.all) {
				task.category = category
			}
			this.setState({
				taskCopy: JSON.parse(JSON.stringify(task)),
				editTask: false,
				loading: false,
			})
		}
	}

	initTask = (id) => {
		const { categories, translations, onInitTask, settings } = this.props

		onInitTask(id, (task) => {
			const findCate = categories.find((c) => +c.id === +task.category)
			if (findCate) {
				task.category = findCate
			} else {
				task.category = categories[0]
			}

			let selectedTime = 0
			let repeatValue = '1'
			let otherOption = `${translations.other}...`

			if (+task.repeat === parseInt(task.repeat, 10)) {
				selectedTime = task.repeat[0]
				repeatValue = task.repeat.substring(1)
				if (+selectedTime !== 6) {
					otherOption = `${translations.other} (${repeatValue} ${getTimeVariant(
						+repeatValue,
						convertNumberToDate(+selectedTime),
						settings.lang,
						translations,
					)})`
				} else {
					otherOption = `${translations.other} (${translations.repeatDays} ${convertDaysIndex(
						repeatValue,
						translations,
					)})`
				}
			}

			this.setState({
				taskCopy: JSON.parse(JSON.stringify(task)),
				editTask: true,
				task,
				otherOption,
				repeatValue,
				setEvent: task.event_id !== null,
				setNotification: task.notification_id !== null,
				selectedTime,
				loading: false,
			})
		})
	}

	updateTask = (name, value) => {
		const { task } = this.state
		if (`${task[name]}` === `${value}`) return null
		task[name] = value
		this.setState({ task }, () => {
			if (name === 'date') this.checkCorrectRepeat()
		})
	}

	showDialog = (action) => {
		const { task } = this.state
		const { translations, navigation } = this.props

		const cancelHandler = () => this.setState({ showDialog: false })

		let dialog
		if (action === 'exit') {
			dialog = generateDialogObject(
				cancelHandler,
				translations.defaultTitle,
				translations.exitDescription,
				{
					[translations.yes]: () => {
						cancelHandler()
						navigation.goBack()
					},
					[translations.save]: () => {
						cancelHandler()
						this.saveTask()
					},
					[translations.cancel]: cancelHandler,
				},
			)
		} else if (action === 'delete') {
			dialog = generateDialogObject(
				cancelHandler,
				translations.defaultTitle,
				translations.deleteDescription,
				{
					[translations.yes]: () => {
						const { onRemoveTask, navigation } = this.props
						cancelHandler()
						onRemoveTask(task, navigation.goBack)
					},
					[translations.cancel]: cancelHandler,
				},
			)
		} else if (action === 'repeat') {
			const repeats = [
				'noRepeat',
				'onceDay',
				'onceDayMonFri',
				'onceDaySatSun',
				'onceWeek',
				'onceMonth',
				'onceYear',
			]
			const options = []
			repeats.map((p) => {
				options.push({
					name: convertRepeatNames(p, translations),
					value: p,
					onClick: (value) => {
						cancelHandler()
						this.updateTask('repeat', value)
					},
				})
			})

			dialog = generateDialogObject(cancelHandler, translations.repeat, options, {
				[translations.cancel]: cancelHandler,
			})

			dialog.select = true
			dialog.selectedValue = task.repeat
		} else if (action === 'category') {
			const { categories } = this.props

			const options = []
			categories.map((c) => {
				options.push({
					name: c.name,
					value: c,
					onClick: (value) => {
						task.category = value
						this.setState({ task, showDialog: false })
					},
				})
			})

			dialog = generateDialogObject(cancelHandler, translations.category, options, {
				[translations.cancel]: cancelHandler,
			})

			dialog.select = true
			dialog.selectedValue = task.category
		} else if (action === 'priority') {
			const priorities = ['none', 'low', 'medium', 'high']
			const options = []
			priorities.map((p) => {
				options.push({
					name: convertPriorityNames(p, translations),
					value: p,
					onClick: (value) => {
						cancelHandler()
						this.updateTask('priority', value)
					},
				})
			})

			dialog = generateDialogObject(cancelHandler, translations.priority, options, {
				[translations.cancel]: cancelHandler,
			})

			dialog.select = true
			dialog.selectedValue = task.priority
		}

		this.setState({ dialog, showDialog: true })
	}

	toggleConfigCategory = (category) => {
		const { showConfigCategory, task } = this.state

		if (category) task.category = category
		this.setState({ task, showConfigCategory: !showConfigCategory })
	}

	toggleOtherRepeat = () => {
		this.setState({ showOtherRepeat: true })
	}

	saveOtherRepeat = (repeatValue, selectedTime) => {
		const { translations, settings } = this.props

		const repeat = selectedTime + repeatValue
		let otherOption
		if (+selectedTime !== 6) {
			otherOption = `${translations.other} (${repeatValue} ${getTimeVariant(
				+repeatValue,
				convertNumberToDate(+selectedTime),
				settings.lang,
				translations,
			)})`
		} else {
			otherOption = `${translations.other} (${translations.repeatDays} ${convertDaysIndex(
				repeatValue,
				translations,
			)})`
		}
		this.updateTask('repeat', repeat)
		this.setState({
			otherOption,
			repeatValue,
			selectedTime,
			showOtherRepeat: false,
		})
	}

	convertDate = (newDate) => {
		const { task } = this.state

		if (dateTime(task.date)) {
			return `${newDate}${task.date.slice(10, 18)}`
		}
		return newDate
	}

	toggleSnackbar = (message, visible = true) => {
		const { onUpdateSnackbar } = this.props

		onUpdateSnackbar(visible, message)
	}

	checkChanges = () => {
		const { task, taskCopy, setEvent, setNotification, controls } = this.state

		return (
			checkValid(controls.name, task.name) &&
			(JSON.stringify(task) !== JSON.stringify(taskCopy) ||
				setEvent !== (task.event_id !== null) ||
				setNotification !== (task.notification_id !== null))
		)
	}

	checkCorrectRepeat = () => {
		const { task } = this.state
		if ((task.repeat[0] === '0' || task.repeat[0] === '1') && task.date.length < 13) {
			task.repeat = 'noRepeat'
			this.setState({ task })
		}
	}

	setEvent = async (value) => {
		if (value) {
			const { status } = await askAsync(CALENDAR, REMINDERS)
			if (status === 'granted') {
				this.setState({ setEvent: value })
			} else {
				const { translations } = this.props
				this.toggleSnackbar(translations.permissionError)
			}
		} else {
			this.setState({ setEvent: value })
		}
	}

	setNotification = async (value) => {
		this.setState({ setNotification: value })
	}

	toggleDateModal = () => {
		const { isVisibleDate } = this.state

		this.setState({ isVisibleDate: !isVisibleDate })
	}

	toggleTimeModal = () => {
		const { isVisibleTime } = this.state

		this.setState({ isVisibleTime: !isVisibleTime })
	}

	saveTask = () => {
		let { task, setEvent, setNotification } = this.state
		const { navigation, theme, onSaveTask } = this.props

		if (!dateTime(task.date)) setNotification = false
		configTask(task, theme.primaryColor, setEvent, setNotification)
			.then((task) => {
				onSaveTask(task, navigation.goBack)
			})
			.catch(() => onSaveTask(task, navigation.goBack))
	}

	render() {
		const {
			task,
			controls,
			loading,
			editTask,
			showConfigCategory,
			selectedTime,
			showOtherRepeat,
			repeatValue,
			otherOption,
			setEvent,
			setNotification,
			isVisibleTime,
			isVisibleDate,
			dialog,
			showDialog,
		} = this.state
		const { navigation, theme, settings, translations } = this.props
		const isDateTime = dateTime(task.date)
		let date
		let now

		if (isDateTime) {
			date = moment(task.date, dateTimeFormat)
			now = new Date()
		} else {
			date = moment(task.date, dateFormat)
			now = new Date().setHours(0, 0, 0, 0)
		}

		return (
			<Template bgColor={theme.secondaryBackgroundColor}>
				<Toolbar
					leftElement='arrow-back'
					centerElement={
						!loading ? (
							editTask ? (
								translations.editTask
							) : (
								translations.newTask
							)
						) : (
							<View style={styles.spinnerWrapper}>
								<Spinner color={theme.primaryBackgroundColor} size='small' />
							</View>
						)
					}
					rightElement={
						<View style={styles.headerIcons}>
							{editTask && (
								<IconToggle
									name='delete'
									color={theme.primaryTextColor}
									onPress={() => this.showDialog('delete')}
								/>
							)}
							{this.checkChanges() && (
								<IconToggle name='save' color={theme.primaryTextColor} onPress={this.saveTask} />
							)}
						</View>
					}
					onLeftElementPress={() => {
						if (this.checkChanges()) this.showDialog('exit')
						else navigation.goBack()
					}}
				/>

				<OtherRepeat
					showModal={showOtherRepeat}
					repeat={repeatValue}
					selectedTime={selectedTime}
					usingTime={isDateTime}
					save={(repeat, selectedTime) => this.saveOtherRepeat(repeat, selectedTime)}
					cancel={() => this.setState({ showOtherRepeat: false })}
				/>

				<ConfigCategory
					showDialog={showConfigCategory}
					category={false}
					toggleModal={this.toggleConfigCategory}
				/>

				<Dialog {...dialog} showDialog={showDialog} />

				{!loading ? (
					<ScrollView>
						<Input
							elementConfig={controls.name}
							focus={!editTask}
							value={task.name}
							changed={(value, control) => {
								const { task, controls } = this.state
								task.name = value
								controls.name = control
								this.setState({ task, controls })
							}}
						/>
						<Input
							elementConfig={controls.description}
							value={task.description}
							changed={(value) => this.updateTask('description', value)}
						/>

						<View style={styles.container}>
							<Subheader text={translations.dueDate} />
							<View style={styles.dateContainer}>
								<TouchableOpacity onPress={this.toggleDateModal}>
									<View style={styles.dateWrapper}>
										<View style={{ ...styles.datePicker, borderColor: theme.primaryColor }}>
											<Text
												style={{
													textAlign: 'center',
													color: +date < +now ? theme.warningColor : theme.thirdTextColor,
												}}
											>
												{task.date ? task.date.slice(0, 10) : translations.selectDueDate}
											</Text>
										</View>
										<View>
											{task.date ? (
												<IconToggle
													onPress={() => {
														this.updateTask('date', '')
														this.updateTask('repeat', 'noRepeat')
													}}
													name='clear'
												/>
											) : (
												<IconToggle onPress={this.toggleDateModal} name='event' />
											)}
										</View>
									</View>
								</TouchableOpacity>
							</View>

							<DateTimePickerModal
								locale={settings.lang}
								isVisible={isVisibleDate}
								mode='date'
								date={
									task.date.slice(0, 10)
										? new Date(moment(task.date.slice(0, 10), dateFormat).format())
										: new Date()
								}
								format={dateFormat}
								isDarkModeEnabled={false}
								confirmTextIOS={translations.confirm}
								cancelTextIOS={translations.cancel}
								headerTextIOS={translations.selectDueDate}
								onCancel={this.toggleDateModal}
								onConfirm={(date) => {
									this.toggleDateModal()
									this.updateTask('date', this.convertDate(moment(date).format(dateFormat)))
								}}
							/>

							{task.date !== '' && (
								<>
									<View style={styles.dateContainer}>
										<TouchableOpacity onPress={this.toggleTimeModal}>
											<View style={styles.dateWrapper}>
												<View style={{ ...styles.datePicker, borderColor: theme.primaryColor }}>
													<Text
														style={{
															textAlign: 'center',
															color: +date < +now ? theme.warningColor : theme.thirdTextColor,
														}}
													>
														{task.date.slice(13, 18)
															? task.date.slice(13, 18)
															: translations.selectDueTime}
													</Text>
												</View>
												<View>
													{task.date.slice(13, 18) ? (
														<IconToggle
															onPress={() => {
																this.updateTask('date', task.date.slice(0, 10))
															}}
															name='clear'
														/>
													) : (
														<IconToggle onPress={this.toggleTimeModal} name='access-time' />
													)}
												</View>
											</View>
										</TouchableOpacity>
									</View>

									<DateTimePickerModal
										isVisible={isVisibleTime}
										mode='time'
										date={
											task.date.slice(13, 18)
												? new Date(moment(task.date.slice(13, 18), timeFormat).format())
												: new Date()
										}
										is24Hour={!!settings.timeFormat}
										format={settings.timeFormat ? timeFormat : timeFormatA}
										isDarkModeEnabled={false}
										confirmTextIOS={translations.confirm}
										cancelTextIOS={translations.cancel}
										headerTextIOS={translations.selectDueTime}
										onCancel={this.toggleTimeModal}
										onConfirm={(date) => {
											this.toggleTimeModal()
											this.updateTask(
												'date',
												`${task.date.slice(0, 10)} - ${moment(date).format(timeFormat)}`,
											)
										}}
									/>

									<Checkbox
										style={{ label: { color: theme.thirdTextColor } }}
										label={translations.setCalendarEvent}
										value='set'
										checked={setEvent}
										onCheck={(value) => this.setEvent(value)}
									/>

									{isDateTime && (
										<Checkbox
											style={{ label: { color: theme.thirdTextColor } }}
											label={translations.setNotification}
											value='set'
											checked={setNotification}
											onCheck={(value) => this.setNotification(value)}
										/>
									)}

									<Subheader text={translations.repeat} />
									<View style={styles.select}>
										<TouchableOpacity style={flex} onPress={() => this.showDialog('repeat')}>
											<Text
												style={{
													...styles.selectedOption,
													color: theme.secondaryTextColor,
												}}
											>
												{+task.repeat ? otherOption : convertRepeatNames(task.repeat, translations)}
											</Text>
										</TouchableOpacity>
										<IconToggle onPress={this.toggleOtherRepeat} name='playlist-add' />
									</View>
								</>
							)}

							<Subheader text={translations.category} />
							<View style={styles.select}>
								<TouchableOpacity style={flex} onPress={() => this.showDialog('category')}>
									<Text
										style={{
											...styles.selectedOption,
											color: theme.secondaryTextColor,
										}}
									>
										{task.category.name}
									</Text>
								</TouchableOpacity>
								<IconToggle onPress={this.toggleConfigCategory} name='playlist-add' />
							</View>

							<Subheader text={translations.priority} />
							<View style={styles.select}>
								<TouchableOpacity style={flex} onPress={() => this.showDialog('priority')}>
									<Text
										style={{
											...styles.selectedOption,
											color: theme.secondaryTextColor,
										}}
									>
										{convertPriorityNames(task.priority, translations)}
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</ScrollView>
				) : (
					<Spinner />
				)}
			</Template>
		)
	}
}

const mapStateToProps = (state) => ({
	categories: state.categories.categories,
	theme: state.theme.theme,
	settings: state.settings.settings,
	translations: {
		...state.settings.translations.ConfigTask,
		...state.settings.translations.OtherRepeat,
		...state.settings.translations.validation,
		...state.settings.translations.times,
		...state.settings.translations.common,
	},
})

const mapDispatchToProps = (dispatch) => ({
	onInitTask: (id, callback) => dispatch(actions.initTask(id, callback)),
	onSaveTask: (task, callback) => dispatch(actions.saveTask(task, callback)),
	onRemoveTask: (task, callback) => dispatch(actions.removeTask(task, false, callback)),
	onUpdateSnackbar: (showSnackbar, snackbarText) =>
		dispatch(actions.updateSnackbar(showSnackbar, snackbarText)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ConfigTask)
