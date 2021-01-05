import React, { Component } from 'react'
import {
	Animated,
	AsyncStorage,
	Easing,
	FlatList,
	RefreshControl,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import {
	ActionButton,
	BottomNavigation,
	Icon,
	IconToggle,
	ListItem,
	Subheader,
	Toolbar,
} from 'react-native-material-ui'
import ModalDropdown from 'react-native-modal-dropdown'
import moment from 'moment'
import {
	dateDiff,
	dateTime,
	generateDialogObject,
	getVariety,
	sortingByType,
} from '../../shared/utility'
import { flex, foundResults, shadow } from '../../shared/styles'
import { dateFormat, dateTimeAFormat, dateTimeFormat, UP, DOWN } from '../../shared/consts'
import EmptyList from '../../components/EmptyList/EmptyList'
import * as Analytics from 'expo-firebase-analytics'
import ConfigCategory from '../Categories/ConfigCategory/ConfigCategory'
import Dialog from '../../components/Dialog/Dialog'
import Spinner from '../../components/Spinner/Spinner'
import styles from './TaskList.styles'

import * as actions from '../../store/actions'
import { connect } from 'react-redux'

class TaskList extends Component {
	state = {
		priorityColors: {},
		selectedTask: null,
		showConfigCategory: false,

		offset: 0,
		scrollDirection: 0,
		bottomHidden: false,

		tasks: [],
		data: [],
		visibleData: 8,
		dropdownData: null,
		selectedCategory: { id: -1, name: this.props.translations.all },
		selectedIndex: 0,
		searchText: '',
		rotateAnimated: new Animated.Value(0),
		rotateInterpolate: '0deg',
		animations: {},
		dialog: null,
		showDialog: false,
		loading: false,
	}

	componentDidMount() {
		this.refreshPriorityColors()
		this.selectedCategoryHandler()
		this.renderDropdownData()
		this.checkUpdate()
	}

	componentDidUpdate(prevProps) {
		if (prevProps.theme !== this.props.theme) {
			this.refreshPriorityColors()
		}
		if (prevProps.refresh !== this.props.refresh) {
			this.refreshComponent(this.state.visibleData)
		}
		if (prevProps.categories.length !== this.props.categories.length) {
			this.renderDropdownData()
		}
		if (prevProps.tasks !== this.props.tasks || prevProps.finished !== this.props.finished) {
			this.selectedCategoryHandler()
		}
		if (
			prevProps.sorting !== this.props.sorting ||
			prevProps.sortingType !== this.props.sortingType
		) {
			this.divisionTask()
		}
	}

	checkUpdate = async () => {
		const updated = await AsyncStorage.getItem('updated')
		if (updated !== null) {
			this.showDialog('updated')
			AsyncStorage.removeItem('updated')
		}
	}

	onScroll = (e) => {
		const { offset, scrollDirection } = this.state

		const currentOffset = e.nativeEvent.contentOffset.y
		const sub = offset - currentOffset

		if (sub > -50 && sub < 50) return
		this.state.offset = e.nativeEvent.contentOffset.y

		const currentDirection = sub > 0 ? UP : DOWN

		if (scrollDirection !== currentDirection) {
			this.setState({
				scrollDirection: currentDirection,
				bottomHidden: currentDirection === DOWN,
			})
		}
	}

	rotate = (value) => {
		const { rotateAnimated } = this.state

		Animated.timing(rotateAnimated, {
			toValue: value,
			duration: 250,
			easing: Easing.bezier(0.0, 0.0, 0.2, 1),
			useNativeDriver: true,
		}).start()

		const rotateInterpolate = rotateAnimated.interpolate({
			inputRange: [0, 1],
			outputRange: ['0deg', '180deg'],
		})

		this.setState({ rotateInterpolate })
	}

	moveAnimate = (callback = () => null) => {
		const { animations, selectedTask } = this.state

		animations[`move${selectedTask.id}`] = new Animated.Value(0)
		this.setState({ animations }, () => {
			Animated.timing(animations[`move${selectedTask.id}`], {
				toValue: -400,
				duration: 350,
				easing: Easing.bezier(0.0, 0.0, 0.2, 1),
				useNativeDriver: false,
			}).start(() => {
				animations[`hide${selectedTask.id}`] = true
				this.setState({ animations }, callback())
			})
		})
	}

	refreshPriorityColors = () => {
		const { theme } = this.props

		this.setState({
			priorityColors: {
				none: { bgColor: theme.secondaryBackgroundColor },
				low: { bgColor: theme.lowColor },
				medium: { bgColor: theme.mediumColor },
				high: { bgColor: theme.highColor },
			},
		})
	}

	showDialog = (action) => {
		const { selectedTask, animations } = this.state
		const { theme, translations, onFinishTask, onAddEndedTask } = this.props

		const cancelHandler = () => this.setState({ showDialog: false })

		let dialog
		if (action === 'repeat') {
			dialog = generateDialogObject(
				cancelHandler,
				translations.repeatTitle,
				translations.repeatDescription,
				{
					[translations.yes]: () => {
						this.moveAnimate(() => {
							onFinishTask(selectedTask, false, theme.primaryColor, () => {
								onAddEndedTask()
								animations[`move${selectedTask.id}`] = new Animated.Value(0)
								animations[`hide${selectedTask.id}`] = false
								this.setState({ animations, showDialog: false })
							})
						})
					},
					[translations.no]: () => {
						cancelHandler()
						this.moveAnimate(() => {
							onFinishTask(selectedTask, true, theme.primaryColor, onAddEndedTask)
						})
					},
					[translations.cancel]: cancelHandler,
				},
			)
		} else if (action === 'finish') {
			dialog = generateDialogObject(
				cancelHandler,
				translations.defaultTitle,
				translations.finishDescription,
				{
					[translations.yes]: () => {
						cancelHandler()
						this.moveAnimate(() => {
							onFinishTask(selectedTask, true, theme.primaryColor, onAddEndedTask)
						})
					},
					[translations.no]: cancelHandler,
				},
			)
		} else if (action === 'delete') {
			dialog = generateDialogObject(
				cancelHandler,
				translations.defaultTitle,
				translations.deleteDescription,
				{
					[translations.yes]: () => {
						cancelHandler()
						this.moveAnimate(() => {
							const { onRemoveTask } = this.props
							onRemoveTask(selectedTask)

							Analytics.logEvent('removedTask', {
								name: 'taskAction',
							})
						})
					},
					[translations.no]: cancelHandler,
				},
			)
		} else if (action === 'deleteAll') {
			dialog = generateDialogObject(
				cancelHandler,
				translations.defaultTitle,
				translations.finishAllDescription,
				{
					[translations.yes]: () => {
						cancelHandler()
						this.deleteAllTask()
					},
					[translations.no]: cancelHandler,
				},
			)
		} else if (action === 'updated') {
			dialog = generateDialogObject(
				cancelHandler,
				translations.updatedTitle,
				`${translations.updatedDescription1}\n${translations.updatedDescription2}`,
				{
					[translations.cancel]: cancelHandler,
				},
			)
		}

		this.setState({ dialog, showDialog: true })
	}

	checkTaskRepeatHandler = (task) => {
		const { settings, onFinishTask, onAddEndedTask, theme } = this.props

		if (task.repeat !== 'noRepeat') {
			if (settings.confirmRepeatingTask) {
				this.showDialog('repeat')
			} else {
				this.moveAnimate(() => {
					onFinishTask(task, false, theme.primaryColor, onAddEndedTask)
				})
			}
		} else if (settings.confirmFinishingTask) {
			this.showDialog('finish')
		} else {
			this.moveAnimate(() => {
				onFinishTask(task, false, theme.primaryColor)
			})
		}
	}

	deleteAllTask = () => {
		const { finished, onRemoveTask } = this.props

		finished.map((task) => onRemoveTask(task))

		Analytics.logEvent('removedAllFinishedTasks', {
			name: 'taskAction',
		})
	}

	checkDeleteHandler = () => {
		const { settings, onRemoveTask } = this.props

		if (settings.confirmDeletingTask) {
			this.showDialog('delete')
		} else {
			this.moveAnimate(() => {
				const { selectedTask } = this.state
				onRemoveTask(selectedTask)
			})
		}
	}

	undoTask = (task) => {
		const { onUndoTask } = this.props

		this.moveAnimate(() => onUndoTask(task))
	}

	setSortingType = (key) => {
		const { sorting, sortingType, onChangeSorting } = this.props

		if (key === sorting) {
			if (sortingType === 'ASC') {
				onChangeSorting(key, 'DESC')
			} else {
				onChangeSorting(key, 'ASC')
			}
		} else {
			onChangeSorting(key, 'ASC')
		}
	}

	divisionTask = (
		tasks = this.state.tasks,
		visibleData = this.state.visibleData,
		scrollTop = false,
	) => {
		const { sorting, sortingType, translations } = this.props

		const division = {
			[translations.overdue]: [],
			[translations.today]: [],
			[translations.tomorrow]: [],
			[translations.thisWeek]: [],
			[translations.nextWeek]: [],
			[translations.thisMonth]: [],
			[translations.nextMonth]: [],
			[translations.later]: [],
			[translations.other]: [],
			[translations.finished]: [],
		}

		tasks &&
			Promise.all(
				tasks.map((task) => {
					let div
					if (task.finish) {
						div = translations.finished
						return division[div].push(task)
					}
					div = this.getDateDivision(task.date)
					return division[div].push(task)
				}),
			).then(() => {
				const data = []
				Object.keys(division).map((div) =>
					sortingByType(division[div], sorting, sortingType).map((task, index) => {
						data.push({ task, div, showDiv: index === 0 })
					}),
				)

				if (visibleData < this.state.visibleData) {
					this.setState({
						data,
						tasks,
						visibleData,
						animations: {},
						loading: false,
					})
				} else {
					this.setState({
						data,
						tasks,
						animations: {},
						loading: false,
					})
				}

				if (scrollTop && tasks.length) {
					this.flatList.scrollToIndex({ animated: false, index: 0 })
				}
			})
	}

	getDateDivision = (date) => {
		const { translations, settings } = this.props
		let newDate, text, now

		if (!date) {
			text = translations.other
			return text
		}
		if (dateTime(date)) {
			newDate = moment(date, dateTimeFormat)
			now = new Date()
		} else {
			newDate = moment(date, dateFormat)
			now = new Date().setHours(0, 0, 0, 0)
		}

		let week = 'week'
		if (settings.firstDayOfWeek === 'Monday') week = 'isoWeek'

		if (+newDate < +now) text = translations.overdue
		else if (+newDate <= moment(now).endOf('day')) text = translations.today
		else if (+newDate <= +moment(now).add(1, 'days').endOf('day')) text = translations.tomorrow
		else if (newDate <= moment(now).endOf(week)) text = translations.thisWeek
		else if (+newDate <= +moment(now).add(1, 'week').endOf(week)) text = translations.nextWeek
		else if (newDate <= moment(now).endOf('month')) text = translations.thisMonth
		else if (newDate <= moment(now).add(1, 'month').endOf('month')) text = translations.nextMonth
		else text = translations.later

		return text
	}

	loadNextData = () => {
		const { visibleData, data } = this.state
		if (visibleData < data.length) {
			this.setState({ visibleData: visibleData + 8 })
		}
	}

	toggleConfigCategory = () => {
		const { showConfigCategory } = this.state
		this.setState({ showConfigCategory: !showConfigCategory })
	}

	convertTimeCycle = (date) => {
		const { settings } = this.props
		const allDay = !dateTime(date)

		if (allDay) return date

		if (settings.timeFormat) {
			return date
		}

		return moment(date, dateTimeFormat).format(dateTimeAFormat)
	}

	selectedCategoryHandler = (
		category = this.state.selectedCategory,
		index = this.state.selectedIndex,
	) => {
		const { selectedCategory } = this.state
		const { tasks, finished, translations } = this.props

		if (this.dropdown) {
			this.dropdown.hide()
			this.rotate(0)
		}

		if (category.name === translations.newCategory) {
			this.toggleConfigCategory()
			return
		}

		let filterTask = tasks
		if (category.name === translations.finished) {
			filterTask = finished
		} else if (category.name !== translations.all) {
			filterTask = tasks.filter((task) => task.category.id === category.id)
		}

		if (category !== selectedCategory) {
			this.setState(
				{
					selectedCategory: category,
					selectedIndex: +index,
				},
				() => this.divisionTask(filterTask, 8, true),
			)
		} else {
			this.setState(
				{
					selectedCategory: category,
					selectedIndex: +index,
				},
				() => this.divisionTask(filterTask),
			)
		}
	}

	renderDropdownData = () => {
		const { categories, translations } = this.props
		if (!categories.length) return null
		const dropdownData = []
		const all = {
			id: -1,
			name: translations.all,
		}
		const finish = {
			id: -2,
			name: translations.finished,
		}
		const newCate = {
			id: -3,
			name: translations.newCategory,
		}
		dropdownData.push(all, ...categories, finish, newCate)
		this.setState({ dropdownData })
	}

	dropdownRenderRow = (rowData, index) => {
		const { selectedCategory } = this.state
		const { tasks, finished, theme } = this.props

		let data
		if (rowData.id === -3) {
			data = {
				icon: 'playlist-add',
				amount: false,
				bgColor: theme.secondaryBackgroundColor,
			}
		} else if (rowData.id === -1) {
			data = {
				icon: 'dehaze',
				amount: tasks.length,
				bgColor: theme.primaryBackgroundColor,
			}
		} else if (rowData.id === -2) {
			data = {
				icon: 'done',
				amount: finished.length,
				bgColor: theme.primaryBackgroundColor,
			}
		} else {
			const amountOfTasks = tasks.filter((task) => task.category.id === rowData.id)
			data = {
				icon: 'bookmark-border',
				amount: amountOfTasks.length,
				bgColor: theme.primaryBackgroundColor,
			}
		}

		return (
			<TouchableOpacity
				onPress={() => this.selectedCategoryHandler(rowData, index)}
				underlayColor={theme.primaryColor}
			>
				<View style={[styles.dropdownRow, { backgroundColor: data.bgColor }]}>
					<Icon
						name={data.icon}
						style={styles.dropdownIcon}
						color={selectedCategory.id === rowData.id ? theme.primaryColor : theme.thirdTextColor}
					/>
					<Text
						style={[
							styles.dropdownRowText,
							selectedCategory.id === rowData.id
								? { color: theme.primaryColor }
								: { color: theme.thirdTextColor },
						]}
					>
						{rowData.name}
					</Text>
					<Text
						style={[
							styles.dropdownRowText,
							selectedCategory.id === rowData.id
								? { color: theme.primaryColor }
								: { color: theme.thirdTextColor },
						]}
					>
						{data.amount ? `(${data.amount})` : ''}
					</Text>
				</View>
			</TouchableOpacity>
		)
	}

	updateTask = (task, action = null) => {
		this.setState({ selectedTask: task }, () => {
			if (action === 'delete') {
				this.checkDeleteHandler()
			} else if (task.finish) {
				this.undoTask(task)
			} else {
				this.checkTaskRepeatHandler(task)
			}
		})
	}

	getTaskDateLabel = (task) => {
		const { translations, settings } = this.props

		if (task.date) {
			if (!task.finish && settings.showDeadlineTime) {
				const isDateTime = dateTime(task.date)
				const firstDate = {
					date: moment(task.date, isDateTime ? dateTimeFormat : dateFormat),
					dateTime: isDateTime,
				}
				const secondDate = {
					date: moment(),
					dateTime: true,
				}

				const dateDifference = dateDiff(firstDate, secondDate, translations, settings.lang)
				if (dateDifference) {
					return `${this.convertTimeCycle(task.date)} (${dateDifference.value} ${
						dateDifference.prefix
					})`
				}
			}
			return this.convertTimeCycle(task.date)
		}
		return task.description ?? ''
	}

	refreshComponent = (visibleData = 8) => {
		const { onInitToDo } = this.props

		onInitToDo((tasks, finished) => {
			const { selectedCategory } = this.state
			const { translations } = this.props
			let filterTask = tasks

			if (selectedCategory === translations.newCategory) {
				this.toggleConfigCategory()
				return
			}

			if (selectedCategory === translations.finished) {
				filterTask = finished
			} else if (selectedCategory !== translations.all) {
				filterTask = tasks.filter((task) => task.category === selectedCategory)
			}

			this.renderDropdownData()
			this.divisionTask(filterTask, visibleData)
		})
	}

	getFilterData = () => {
		const { data, visibleData } = this.state

		return data.filter(({ task }, index) => {
			if (index > visibleData) {
				return false
			}

			const searchText = this.state.searchText.toLowerCase()
			if (searchText.length > 0 && task.name.toLowerCase().indexOf(searchText) < 0) {
				if (task.description.toLowerCase().indexOf(searchText) < 0) {
					if (task.category.name.toLowerCase().indexOf(searchText) < 0) {
						return false
					}
				}
			}

			return true
		})
	}

	renderTaskRow = ({ task, div, showDiv }) => {
		const { priorityColors, animations } = this.state
		const { translations, theme, navigation } = this.props

		const moveValue = animations[`move${task.id}`] ? animations[`move${task.id}`] : 0
		const hideTask = animations[`hide${task.id}`] ? 0 : 'auto'

		return (
			<View>
				{showDiv && (
					<Subheader
						text={div}
						style={{
							text:
								div === translations.overdue
									? { color: theme.warningColor }
									: { color: theme.thirdTextColor },
						}}
					/>
				)}
				<Animated.View style={{ height: hideTask, left: moveValue }}>
					<View style={styles.taskRow}>
						<ListItem
							divider
							dense
							onPress={() =>
								navigation.navigate('ConfigTask', { task: task.id, finished: task.finish })
							}
							style={{
								container: {
									...shadow,
									height: 80,
									backgroundColor: theme.primaryBackgroundColor,
								},
								leftElementContainer: {
									marginRight: -50,
								},
							}}
							leftElement={
								<View
									style={{
										...styles.taskRowLeftElement,
										backgroundColor: priorityColors[task.priority].bgColor,
									}}
								/>
							}
							centerElement={
								<View>
									<Text
										numberOfLines={1}
										style={{
											...styles.taskName,
											color: theme.secondaryTextColor,
										}}
									>
										{task.name}
									</Text>
									<View style={styles.taskDate}>
										<Text
											numberOfLines={1}
											style={{
												margin: 2,
												color: task.finish
													? theme.thirdTextColor
													: div === translations.overdue
													? theme.warningColor
													: theme.thirdTextColor,
											}}
										>
											{this.getTaskDateLabel(task)}
										</Text>
										{task.repeat !== 'noRepeat' && (
											<Icon
												size={16}
												color={theme.thirdTextColor}
												style={{ alignSelf: 'center' }}
												name='autorenew'
											/>
										)}
									</View>
									<Text
										numberOfLines={1}
										style={{
											margin: 2,
											color: theme.thirdTextColor,
										}}
									>
										{task.category ? task.category.name : ' '}
									</Text>
								</View>
							}
							rightElement={
								<View style={styles.rightElements}>
									<IconToggle
										color={task.finish ? theme.undoIconColor : theme.doneIconColor}
										style={{
											container: {
												marginRight: task.finish ? -10 : 5,
											},
										}}
										size={32}
										name={task.finish ? 'replay' : 'done'}
										onPress={() => this.updateTask(task)}
									/>
									{task.finish && (
										<IconToggle
											onPress={() => this.updateTask(task, 'delete')}
											name='delete'
											color={theme.warningColor}
											size={28}
										/>
									)}
								</View>
							}
						/>
					</View>
				</Animated.View>
			</View>
		)
	}

	render() {
		const {
			showConfigCategory,
			dropdownData,
			selectedIndex,
			visibleData,
			rotateInterpolate,
			bottomHidden,
			searchText,
			selectedCategory,
			dialog,
			showDialog,
			loading,
		} = this.state
		const { theme, navigation, sortingType, settings, sorting, finished, translations } = this.props

		const filterData = this.getFilterData()

		return (
			<View style={flex}>
				<Toolbar
					searchable={{
						autoFocus: true,
						placeholder: translations.search,
						onChangeText: (value) => this.setState({ searchText: value }),
						onSearchCloseRequested: () => this.setState({ searchText: '' }),
					}}
					leftElement='menu'
					onLeftElementPress={() => navigation.navigate('Drawer')}
					centerElement={
						<>
							{dropdownData ? (
								<ModalDropdown
									ref={(e) => {
										this.dropdown = e
									}}
									style={styles.dropdown}
									textStyle={styles.dropdownText}
									dropdownStyle={{
										...styles.dropdownDropdown,
										backgroundColor: theme.primaryBackgroundColor,
									}}
									defaultValue={selectedCategory.name}
									defaultIndex={selectedIndex}
									options={dropdownData}
									onDropdownWillShow={() => this.rotate(1)}
									onDropdownWillHide={() => this.rotate(0)}
									renderButtonText={({ name }) => name}
									renderRow={(renderRow, index) => this.dropdownRenderRow(renderRow, index)}
								>
									<View style={styles.dropdownButton}>
										<Text
											style={[
												styles.dropdownText,
												{
													color: theme.primaryTextColor,
												},
											]}
										>
											{selectedCategory.name}
										</Text>
										<Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
											<Icon
												style={styles.dropdownButtonIcon}
												color={theme.primaryTextColor}
												name='expand-more'
											/>
										</Animated.View>
									</View>
								</ModalDropdown>
							) : (
								<Spinner />
							)}
						</>
					}
				/>

				{searchText.length > 0 && (
					<View style={foundResults}>
						<Text style={{ color: theme.thirdTextColor }}>
							{translations.found}:{' '}
							{getVariety(
								filterData.length,
								translations.resultSingular,
								translations.resultPlural,
								translations.resultGenitive,
								settings.lang,
							)}
						</Text>
					</View>
				)}

				<ConfigCategory
					category={false}
					showDialog={showConfigCategory}
					toggleModal={this.toggleConfigCategory}
				/>

				<Dialog {...dialog} theme={theme} showDialog={showDialog} />

				<FlatList
					ref={(e) => {
						this.flatList = e
					}}
					keyboardShouldPersistTaps='always'
					keyboardDismissMode='interactive'
					onScroll={this.onScroll}
					scrollEventThrottle={16}
					refreshControl={
						<RefreshControl
							refreshing={loading}
							tintColor={theme.primaryColor}
							onRefresh={this.refreshComponent}
						/>
					}
					ListEmptyComponent={
						<EmptyList color={theme.thirdTextColor} text={translations.emptyList} />
					}
					data={filterData}
					initialNumToRender={8}
					onEndReachedThreshold={0.2}
					onEndReached={this.loadNextData}
					renderItem={({ item, index }) => this.renderTaskRow(item, index)}
					keyExtractor={({ task }) => `${task.id}`}
					onRefresh={this.refreshComponent}
					refreshing={loading}
					ListFooterComponent={
						filterData.length > visibleData ? <Spinner /> : <View style={styles.footerMargin} />
					}
				/>

				<View>
					{selectedCategory.name !== translations.finished ? (
						<ActionButton
							hidden={bottomHidden}
							onPress={() => navigation.navigate('ConfigTask', { category: selectedCategory })}
							icon='add'
							style={{
								container: { backgroundColor: theme.warningColor },
								icon: { color: theme.primaryTextColor },
							}}
						/>
					) : finished.length ? (
						<ActionButton
							hidden={bottomHidden}
							style={{
								container: { backgroundColor: theme.warningColor },
								icon: { color: theme.primaryTextColor },
							}}
							onPress={() => this.showDialog('deleteAll')}
							icon='delete-sweep'
						/>
					) : null}
				</View>

				<BottomNavigation
					style={{ container: { backgroundColor: theme.primaryBackgroundColor } }}
					hidden={bottomHidden}
					active={sorting}
				>
					<BottomNavigation.Action
						key='byAZ'
						style={{ label: { fontSize: 13 } }}
						icon='format-line-spacing'
						label={sortingType === 'ASC' ? 'A-Z' : 'Z-A'}
						onPress={() => this.setSortingType('byAZ')}
					/>
					<BottomNavigation.Action
						key='byDate'
						style={{ label: { fontSize: 13 } }}
						icon='insert-invitation'
						label={translations.date}
						onPress={() => this.setSortingType('byDate')}
					/>
					<BottomNavigation.Action
						key='byCategory'
						style={{ label: { fontSize: 13 } }}
						icon='bookmark-border'
						label={translations.category}
						onPress={() => this.setSortingType('byCategory')}
					/>
					<BottomNavigation.Action
						key='byPriority'
						style={{ label: { fontSize: 13 } }}
						icon='priority-high'
						label={translations.priority}
						onPress={() => this.setSortingType('byPriority')}
					/>
				</BottomNavigation>
			</View>
		)
	}
}

const mapStateToProps = (state) => ({
	sorting: state.settings.settings.sorting,
	sortingType: state.settings.settings.sortingType,
	theme: state.theme.theme,
	settings: state.settings.settings,
	tasks: state.tasks.tasks,
	finished: state.tasks.finished,
	categories: state.categories.categories,
	showModal: state.config.showModal,
	refresh: state.tasks.refresh,
	translations: {
		...state.settings.translations.TaskList,
		...state.settings.translations.common,
		...state.settings.translations.times,
	},
})

const mapDispatchToProps = (dispatch) => ({
	onInitToDo: (callback) => dispatch(actions.initToDo(callback)),
	onFinishTask: (task, endTask, primaryColor, translations, callback) =>
		dispatch(actions.finishTask(task, endTask, primaryColor, translations, callback)),
	onRemoveTask: (task) => dispatch(actions.removeTask(task)),
	onUndoTask: (task) => dispatch(actions.undoTask(task)),
	onAddEndedTask: () => dispatch(actions.addEndedTask()),
	onChangeSorting: (sorting, type) => dispatch(actions.changeSorting(sorting, type)),
})

export default connect(mapStateToProps, mapDispatchToProps)(TaskList)
