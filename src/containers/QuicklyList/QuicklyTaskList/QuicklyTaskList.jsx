import React, { Component } from 'react'
import {
	FlatList,
	KeyboardAvoidingView,
	Platform,
	RefreshControl,
	Text,
	TouchableOpacity,
	View,
	Keyboard,
} from 'react-native'
import { IconToggle, Toolbar } from 'react-native-material-ui'
import { listRow, shadow, flex, foundResults } from '../../../shared/styles'
import Input from '../../../components/Input/Input'
import { generateDialogObject, getVariety } from '../../../shared/utility'
import EmptyList from '../../../components/EmptyList/EmptyList'
import ConfigQuicklyTask from '../ConfigQuicklyTask/ConfigQuicklyTask'
import Spinner from '../../../components/Spinner/Spinner'
import Template from '../../Template/Template'
import Dialog from '../../../components/Dialog/Dialog'
import styles from './QuicklyTaskList.styles'

import * as actions from '../../../store/actions'
import { connect } from 'react-redux'

const initialNumToRender = 16

class QuicklyTaskList extends Component {
	state = {
		quicklyTasks: [],
		showDialog: false,
		showInputDialog: false,
		selectedTask: false,
		list: {
			id: false,
			name: this.props.translations.listName,
		},
		newListName: this.props.translations.listName,
		control: {
			label: this.props.translations.listName,
			required: true,
			characterRestriction: 20,
		},
		input: {
			control: {
				label: this.props.translations.quicklyAdding,
				required: true,
				characterRestriction: 40,
			},
			value: '',
		},
		keyboardDidShow: false,
		visibleData: 16,
		searchText: '',
		loading: true,
	}

	componentDidMount() {
		const { navigation } = this.props

		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () =>
			this.keyboardDidShow(true),
		)
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () =>
			this.keyboardDidShow(false),
		)

		const list = navigation.getParam('list', false)
		if (list && list.id !== false) {
			this.reloadTasks(list)
		} else {
			this.setState({ loading: false })
		}
	}

	componentWillUnmount() {
		this.keyboardDidShowListener.remove()
		this.keyboardDidHideListener.remove()
	}

	keyboardDidShow = (status) => {
		this.setState({ keyboardDidShow: status })
	}

	reloadTasks = (list = this.state.list) => {
		const { onInitList } = this.props
		onInitList(list.id, (tasks) => {
			this.setState({
				quicklyTasks: tasks,
				newListName: list.name,
				list,
				loading: false,
			})
		})
	}

	toggleModalHandler = (selected = false, list = false) => {
		const { showDialog } = this.state
		if (selected !== false) {
			if (list) this.reloadTasks(list)

			this.setState({
				showDialog: !showDialog,
				selectedTask: selected,
			})
		} else {
			this.setState({
				showDialog: !showDialog,
				selectedTask: false,
			})
		}
	}

	showDialog = () => {
		const { newListName, list, control } = this.state
		const { translations } = this.props

		const cancelHandler = () => {
			delete control.error
			this.setState({
				showInputDialog: false,
				newListName: list.name,
				control,
			})
		}

		const dialog = generateDialogObject(
			cancelHandler,
			translations.dialogTitle,
			{
				elementConfig: control,
				focus: true,
				value: newListName === translations.listName ? '' : newListName,
				onChange: (value, control) => {
					this.setState({ newListName: value, control }, this.showDialog)
				},
			},
			{
				[translations.save]: () => {
					const { list, newListName, control } = this.state
					if (!control.error) {
						this.saveList({
							id: list.id,
							name: newListName,
						})
						this.setState({ showInputDialog: false })
					}
				},
				[translations.cancel]: cancelHandler,
			},
		)

		this.setState({ showInputDialog: true, dialog })
	}

	addTask = () => {
		const { input, list } = this.state
		const { onSaveQuicklyTask } = this.props

		if (!input.control.error) {
			const newTask = {
				id: false,
				name: input.value,
			}

			onSaveQuicklyTask(newTask, list, (list) => {
				this.setState({ input: { ...input, value: null } })
				this.reloadTasks(list)
			})
		}
	}

	saveList = (list) => {
		const { onSaveList } = this.props

		onSaveList(list, (savedList) => {
			this.setState({ list: savedList })
		})
	}

	finishTask = (id) => {
		const { onRemoveQuicklyTask } = this.props

		onRemoveQuicklyTask(id, () => this.reloadTasks())
	}

	loadNextData = () => {
		const { visibleData, quicklyTasks } = this.state
		if (visibleData < quicklyTasks.length) {
			this.setState({ visibleData: visibleData + initialNumToRender })
		}
	}

	getFilterData = () => {
		const { quicklyTasks, visibleData } = this.state

		return quicklyTasks.filter((task, index) => {
			if (index > visibleData) {
				return false
			}

			const searchText = this.state.searchText.toLowerCase()
			return !(searchText.length > 0 && task.name.toLowerCase().indexOf(searchText) < 0)
		})
	}

	renderTaskRow = (item, index) => {
		const { keyboardDidShow } = this.state
		const { theme } = this.props

		return (
			<TouchableOpacity
				style={{
					...shadow,
					...listRow,
					backgroundColor: theme.primaryBackgroundColor,
				}}
				onPress={() => {
					if (keyboardDidShow) {
						Keyboard.dismiss()
					} else {
						this.toggleModalHandler(item.id)
					}
				}}
			>
				<View style={styles.listContainer}>
					<View style={styles.taskNameWrapper}>
						<Text
							numberOfLines={1}
							style={{
								...styles.taskName,
								color: theme.secondaryTextColor,
							}}
						>
							{index + 1}. {item.name}
						</Text>
					</View>
					<View style={styles.taskIconContainer}>
						<IconToggle
							color={theme.doneIconColor}
							onPress={() => this.finishTask(item.id)}
							name='done'
						/>
					</View>
				</View>
			</TouchableOpacity>
		)
	}

	render() {
		const {
			showDialog,
			showInputDialog,
			dialog,
			selectedTask,
			input,
			list,
			searchText,
			visibleData,
			loading,
		} = this.state
		const { navigation, theme, lang, translations, onInitLists } = this.props

		const filterData = this.getFilterData()

		return (
			<Template bgColor={theme.secondaryBackgroundColor}>
				<Toolbar
					searchable={{
						autoFocus: true,
						placeholder: translations.search,
						onChangeText: (value) => this.setState({ searchText: value }),
						onSearchCloseRequested: () => this.setState({ searchText: '' }),
					}}
					leftElement='arrow-back'
					rightElement={
						<>
							<IconToggle color={theme.primaryTextColor} onPress={this.showDialog} name='edit' />
							<IconToggle
								color={theme.primaryTextColor}
								name='add'
								onPress={this.toggleModalHandler}
							/>
						</>
					}
					onLeftElementPress={() => {
						onInitLists()
						navigation.goBack()
					}}
					centerElement={
						list.name && !loading ? (
							<TouchableOpacity onPress={this.showDialog}>
								<Text
									numberOfLines={1}
									style={{
										color: theme.primaryTextColor,
										fontSize: 20,
									}}
								>
									{list.name}
								</Text>
							</TouchableOpacity>
						) : (
							<View style={styles.spinnerWrapper}>
								<Spinner color={theme.secondaryBackgroundColor} size='small' />
							</View>
						)
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
								lang,
							)}
						</Text>
					</View>
				)}

				{showDialog && (
					<ConfigQuicklyTask
						showDialog={showDialog}
						task_id={selectedTask}
						list={list}
						taskLength={filterData.length}
						toggleModal={(selected, list) => this.toggleModalHandler(selected, list)}
					/>
				)}

				<Dialog {...dialog} input theme={theme} showDialog={showInputDialog} />

				{!loading ? (
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'none'} style={flex}>
						<View style={styles.quicklyTaskListWrapper}>
							<FlatList
								keyboardShouldPersistTaps='handled'
								keyboardDismissMode='interactive'
								data={filterData}
								refreshControl={
									<RefreshControl
										refreshing={loading}
										tintColor={theme.primaryColor}
										onRefresh={this.reloadTasks}
									/>
								}
								style={styles.quicklyTaskList}
								onEndReached={this.loadNextData}
								initialNumToRender={initialNumToRender}
								ListEmptyComponent={
									<EmptyList color={theme.thirdTextColor} text={translations.emptyList} />
								}
								renderItem={({ item, index }) => this.renderTaskRow(item, index)}
								keyExtractor={(item) => `${item.id}`}
								onRefresh={this.reloadTasks}
								refreshing={loading}
								ListFooterComponent={filterData.length > visibleData && <Spinner />}
							/>

							<View style={styles.inputWrapper}>
								<Input
									elementConfig={input.control}
									focus={false}
									value={input.value}
									changed={(value) => {
										const { input } = this.state
										this.setState({ input: { ...input, value } })
									}}
								/>
								<View style={styles.addIcon}>
									<IconToggle onPress={this.addTask} name='add' />
								</View>
							</View>
						</View>
					</KeyboardAvoidingView>
				) : (
					<Spinner />
				)}
			</Template>
		)
	}
}

const mapStateToProps = (state) => ({
	theme: state.theme.theme,
	lang: state.settings.settings.lang,
	translations: {
		...state.settings.translations.QuicklyTaskList,
		...state.settings.translations.validation,
		...state.settings.translations.common,
	},
})

const mapDispatchToProps = (dispatch) => ({
	onInitLists: () => dispatch(actions.initLists()),
	onInitList: (id, callback) => dispatch(actions.initList(id, callback)),
	onSaveQuicklyTask: (task, list, callback) =>
		dispatch(actions.saveQuicklyTask(task, list, callback)),
	onSaveList: (list, callback) => dispatch(actions.saveList(list, callback)),
	onRemoveQuicklyTask: (id, callback) => dispatch(actions.removeQuicklyTask(id, callback)),
})

export default connect(mapStateToProps, mapDispatchToProps)(QuicklyTaskList)
