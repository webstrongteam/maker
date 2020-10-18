import React, { Component } from 'react'
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { Icon, IconToggle, Toolbar } from 'react-native-material-ui'
import SortableListView from 'react-native-sortable-list'
import { selectionAsync } from 'expo-haptics'
import { connect } from 'react-redux'
import { empty, listContainer, listRow, shadow } from '../../../shared/styles'
import Input from '../../../components/UI/Input/Input'
import { generateDialogObject } from '../../../shared/utility'
import ConfigQuicklyTask from '../ConfigQuicklyTask/ConfigQuicklyTask'
import Spinner from '../../../components/UI/Spinner/Spinner'
import Template from '../../Template/Template'
import Dialog from '../../../components/UI/Dialog/Dialog'
import styles from './QuicklyTaskList.styles'

import * as actions from '../../../store/actions'

class QuicklyTaskList extends Component {
	state = {
		quicklyTasks: [],
		showModal: false,
		showInputModal: false,
		selectedTask: false,
		list: {
			id: false,
			// eslint-disable-next-line react/destructuring-assignment
			name: this.props.translations.listName,
		},
		// eslint-disable-next-line react/destructuring-assignment
		newListName: this.props.translations.listName,
		order: [],
		control: {
			// eslint-disable-next-line react/destructuring-assignment
			label: this.props.translations.listName,
			required: true,
			characterRestriction: 20,
		},
		input: {
			control: {
				// eslint-disable-next-line react/destructuring-assignment
				label: this.props.translations.quicklyAdding,
				required: true,
				characterRestriction: 40,
			},
			value: '',
		},
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

	// eslint-disable-next-line react/destructuring-assignment
	reloadTasks = (list = this.state.list) => {
		this.setState({ loading: true }, () => {
			const { onInitList } = this.props

			onInitList(list.id, (tasks) => {
				const order = [...tasks.map(({ order_nr }) => order_nr)]
				this.setState({
					quicklyTasks: tasks,
					newListName: list.name,
					order,
					list,
					loading: false,
				})
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
		const { input, list, quicklyTasks } = this.state
		const { onSaveQuicklyTask } = this.props

		if (!input.control.error) {
			const newTask = {
				id: false,
				name: input.value,
				order_nr: quicklyTasks.length,
			}
			onSaveQuicklyTask(newTask, list, (list) => {
				input.value = ''
				this.setState({ input })
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

	updateOrder = (order) => {
		const { quicklyTasks, list } = this.state
		const { onSaveQuicklyTask } = this.props

		order.map((o, i) => {
			quicklyTasks[i].order_nr = +o
			onSaveQuicklyTask(quicklyTasks[i], list)
		})
	}

	saveList = (list) => {
		const { onSaveList } = this.props

		onSaveList(list, (savedList) => {
			this.setState({ list: savedList })
		})
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
			order,
			loading,
		} = this.state
		const { navigation, theme, translations, onInitLists } = this.props

		return (
			<Template bgColor={theme.secondaryBackgroundColor}>
				<Toolbar
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
							<TouchableOpacity onPress={() => this.showDialog()}>
								<Text
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
					<KeyboardAvoidingView
						behavior={Platform.OS === 'ios' ? 'padding' : 'none'}
						style={{ flex: 1 }}
					>
						<View style={{ flex: 1, justifyContent: 'space-between' }}>
							{quicklyTasks.length ? (
								<SortableListView
									activeOpacity={0.4}
									data={quicklyTasks}
									order={order}
									style={{ paddingTop: 5 }}
									onRowActive={selectionAsync}
									onRowMoved={(e) => {
										order.splice(e.to, 0, order.splice(e.from, 1)[0])
										this.updateOrder(order)
									}}
									renderRow={({ data }) => (
										<TouchableOpacity
											style={{
												...shadow,
												...listRow,
												backgroundColor: theme.primaryBackgroundColor,
											}}
											onPress={() => this.toggleModalHandler(data.id)}
										>
											<View style={listContainer}>
												<View
													style={{
														width: '75%',
														marginTop: 5,
														marginBottom: 5,
													}}
												>
													<Text
														numberOfLines={1}
														style={{
															...styles.taskName,
															color: theme.secondaryTextColor,
														}}
													>
														{data.name}
													</Text>
												</View>
												<View style={styles.taskIconContainer}>
													<IconToggle
														color={theme.doneIconColor}
														onPress={() => this.removeTask(data)}
														name='done'
													/>
													<Icon name='dehaze' />
												</View>
											</View>
										</TouchableOpacity>
									)}
								/>
							) : (
								<ScrollView>
									<Text style={[empty, { color: theme.thirdTextColor }]}>
										{translations.emptyList}
									</Text>
								</ScrollView>
							)}
							<View
								style={{
									marginRight: 30,
									marginBottom: 15,
									bottom: 10,
									flexDirection: 'row',
									alignItems: 'center',
								}}
							>
								<Input
									elementConfig={input.control}
									focus={false}
									value={input.value}
									changed={(value) => {
										const { input } = this.state
										input.value = value
										this.setState({ input })
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
