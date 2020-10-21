import React, { Component } from 'react'
import {
	FlatList,
	KeyboardAvoidingView,
	Platform,
	RefreshControl,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { IconToggle, Toolbar } from 'react-native-material-ui'
import { connect } from 'react-redux'
import { empty, listContainer, listRow, shadow, flex } from '../../../shared/styles'
import Input from '../../../components/UI/Input/Input'
import { generateDialogObject } from '../../../shared/utility'
import ConfigQuicklyTask from '../ConfigQuicklyTask/ConfigQuicklyTask'
import Spinner from '../../../components/UI/Spinner/Spinner'
import Template from '../../Template/Template'
import Dialog from '../../../components/UI/Dialog/Dialog'
import styles from './QuicklyTaskList.styles'

import * as actions from '../../../store/actions'

const initialNumToRender = 16

class QuicklyTaskList extends Component {
	state = {
		quicklyTasks: [],
		showModal: false,
		showInputModal: false,
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
		visibleData: initialNumToRender,
		searchText: '',
		loading: true,
	}

	componentDidMount() {
		const { navigation } = this.props

		const list = navigation.getParam('list', false)
		if (list && list.id !== false) {
			this.reloadTasks(list)
		} else {
			this.setState({ loading: false })
		}
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
		const { showModal } = this.state
		if (selected !== false) {
			if (list) this.reloadTasks(list)

			this.setState({
				showModal: !showModal,
				selectedTask: selected,
			})
		} else {
			this.setState({
				showModal: !showModal,
				selectedTask: false,
			})
		}
	}

	showDialog = () => {
		const { newListName, control } = this.state
		const { translations } = this.props

		const dialog = generateDialogObject(
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
						this.setState({ showInputModal: false })
					}
				},
				[translations.cancel]: () => {
					const { list, control } = this.state
					delete control.error
					this.setState({
						showInputModal: false,
						newListName: list.name,
						control,
					})
				},
			},
		)

		dialog.input = true
		this.setState({ showInputModal: true, dialog })
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

	removeTask = (row) => {
		const { onRemoveQuicklyTask, onSaveQuicklyTask } = this.props

		onRemoveQuicklyTask(row.id, () => {
			const { quicklyTasks, list } = this.state
			Promise.all(
				quicklyTasks.map(
					(task) =>
						new Promise((resolve) => {
							if (task.order_nr > row.order_nr) {
								task.order_nr -= 1
								onSaveQuicklyTask(task, list, resolve)
							} else resolve()
						}),
				),
			).then(() => this.reloadTasks())
		})
	}

	saveList = (list) => {
		const { onSaveList } = this.props

		onSaveList(list, (savedList) => {
			this.setState({ list: savedList })
		})
	}

	loadNextData = () => {
		const { visibleData, quicklyTasks } = this.state
		if (visibleData < quicklyTasks.length) {
			this.setState({ visibleData: visibleData + initialNumToRender })
		}
	}

	renderTaskRow = (item, index) => {
		const { theme } = this.props

		// Searching system
		const searchText = this.state.searchText.toLowerCase()
		if (searchText.length > 0 && item.name.toLowerCase().indexOf(searchText) < 0) {
			return null
		}

		return (
			<TouchableOpacity
				style={{
					...shadow,
					...listRow,
					backgroundColor: theme.primaryBackgroundColor,
				}}
				onPress={() => this.toggleModalHandler(item.id)}
			>
				<View style={listContainer}>
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
							onPress={() => this.removeTask(item)}
							name='done'
						/>
					</View>
				</View>
			</TouchableOpacity>
		)
	}

	render() {
		const {
			showModal,
			showInputModal,
			dialog,
			selectedTask,
			input,
			list,
			quicklyTasks,
			visibleData,
			loading,
		} = this.state
		const { navigation, theme, translations, onInitLists } = this.props

		return (
			<Template bgColor={theme.secondaryBackgroundColor}>
				<Toolbar
					searchable={{
						autoFocus: true,
						placeholder: translations.search,
						onChangeText: (value) => this.setState({ searchText: value }),
						onSearchClosed: () => this.setState({ searchText: '' }),
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
										fontWeight: 'bold',
										fontSize: 20,
									}}
								>
									{list.name}
								</Text>
							</TouchableOpacity>
						) : (
							<View style={{ marginTop: 10 }}>
								<Spinner color={theme.secondaryBackgroundColor} size='small' />
							</View>
						)
					}
				/>

				{showModal && (
					<ConfigQuicklyTask
						showModal={showModal}
						task_id={selectedTask}
						list={list}
						taskLength={quicklyTasks.length}
						toggleModal={(selected, list) => this.toggleModalHandler(selected, list)}
					/>
				)}

				{dialog && (
					<Dialog
						showModal={showInputModal}
						input
						title={dialog.title}
						body={dialog.body}
						buttons={dialog.buttons}
					/>
				)}

				{!loading ? (
					<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'none'} style={flex}>
						<View style={{ flex: 1, justifyContent: 'space-between' }}>
							<FlatList
								keyboardShouldPersistTaps='handled'
								keyboardDismissMode='interactive'
								data={quicklyTasks.filter((d, i) => i <= visibleData)}
								refreshControl={
									<RefreshControl
										refreshing={loading}
										tintColor={theme.primaryColor}
										onRefresh={this.reloadTasks}
									/>
								}
								style={{ paddingTop: 5 }}
								onEndReached={this.loadNextData}
								initialNumToRender={initialNumToRender}
								ListEmptyComponent={
									<Text style={[empty, { color: theme.thirdTextColor }]}>
										{translations.emptyList}
									</Text>
								}
								renderItem={({ item, index }) => this.renderTaskRow(item, index)}
								keyExtractor={(item) => `${item.id}`}
								onRefresh={this.reloadTasks}
								refreshing={loading}
								ListFooterComponent={quicklyTasks.length > visibleData && <Spinner />}
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
								<View style={{ marginLeft: -20 }}>
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
