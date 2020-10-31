import React, { Component } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { ActionButton, IconToggle, ListItem, Toolbar } from 'react-native-material-ui'
import { generateDialogObject } from '../../shared/utility'
import { empty, flex, shadow } from '../../shared/styles'
import { DOWN, UP } from '../../shared/consts'
import Spinner from '../../components/Spinner/Spinner'
import Dialog from '../../components/Dialog/Dialog'
import styles from './QuicklyList.styles'

import * as actions from '../../store/actions'
import { connect } from 'react-redux'

class QuicklyList extends Component {
	state = {
		amounts: {},
		searchText: '',

		offset: 0,
		scrollDirection: 0,
		bottomHidden: false,
		dialog: null,
		showDialog: false,
		loading: true,
	}

	componentDidMount() {
		this.reloadListsAmount()
	}

	componentDidUpdate(prevProps) {
		if (prevProps.lists !== this.props.lists) {
			this.reloadListsAmount()
		}
	}

	reloadListsAmount = () => {
		const { lists } = this.props
		const { amounts } = this.state

		if (lists.length) {
			const { onInitList } = this.props
			lists.map((list) => {
				onInitList(list.id, (tasks) => {
					amounts[list.id] = tasks.length
					this.setState({ amounts, loading: false })
				})
			})
		} else {
			this.setState({ loading: false })
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
			this.state.scrollDirection = currentDirection

			this.setState({
				bottomHidden: currentDirection === DOWN,
			})
		}
	}

	showDialog = (list_id) => {
		const { translations, onRemoveList } = this.props

		const cancelHandler = () => this.setState({ showDialog: false })

		const dialog = generateDialogObject(
			cancelHandler,
			translations.defaultTitle,
			`${translations.dialogDescription}`,
			{
				[translations.yes]: () => {
					cancelHandler()
					onRemoveList(list_id)
				},
				[translations.no]: cancelHandler,
			},
		)

		this.setState({ dialog, showDialog: true })
	}

	renderQuicklyList = () => {
		const { amounts } = this.state
		const { lists, theme, navigation, translations } = this.props

		return lists.map((list, index) => {
			// Searching system
			const searchText = this.state.searchText.toLowerCase()
			if (searchText.length > 0 && list.name.toLowerCase().indexOf(searchText) < 0) {
				return null
			}

			return (
				<View key={index} style={styles.quicklyTaskList}>
					<ListItem
						divider
						dense
						onPress={() => navigation.navigate('QuicklyTaskList', { list })}
						style={{
							container: [shadow, { backgroundColor: theme.primaryBackgroundColor }],
							primaryText: {
								fontSize: 18,
								color: theme.secondaryTextColor,
							},
							secondaryText: {
								color: theme.thirdTextColor,
							},
						}}
						centerElement={{
							primaryText: list.name,
							secondaryText: `${translations.totalTasks} ${
								amounts[list.id] ? amounts[list.id] : 0
							}`,
						}}
						rightElement={
							<View style={styles.rightElements}>
								<IconToggle
									onPress={() => this.showDialog(list.id, list.name)}
									name='delete'
									color={theme.warningColor}
									size={26}
								/>
							</View>
						}
					/>
				</View>
			)
		})
	}

	render() {
		const { bottomHidden, showDialog, dialog, loading } = this.state
		const { lists, theme, navigation, translations } = this.props

		return (
			<View style={flex}>
				<Toolbar
					searchable={{
						autoFocus: true,
						placeholder: translations.search,
						onChangeText: (value) => this.setState({ searchText: value }),
						onSearchClosed: () => this.setState({ searchText: '' }),
					}}
					leftElement='menu'
					centerElement={translations.quicklyLists}
					onLeftElementPress={() => navigation.navigate('Drawer')}
				/>

				<Dialog {...dialog} showDialog={showDialog} />

				{!loading ? (
					<ScrollView
						scrollEventThrottle={16}
						keyboardShouldPersistTaps='always'
						keyboardDismissMode='interactive'
						onScroll={this.onScroll}
						style={styles.scrollView}
					>
						{lists && lists.length ? (
							<View style={styles.quicklyTaskListWrapper}>{this.renderQuicklyList()}</View>
						) : (
							<Text style={[empty, { color: theme.thirdTextColor }]}>{translations.emptyList}</Text>
						)}
					</ScrollView>
				) : (
					<Spinner />
				)}

				<View style={styles.actionButtonWrapper}>
					<ActionButton
						hidden={bottomHidden}
						onPress={() => navigation.navigate('QuicklyTaskList', { list: false })}
						icon='add'
						style={{
							container: { backgroundColor: theme.warningColor },
							icon: { color: theme.primaryTextColor },
						}}
					/>
				</View>
			</View>
		)
	}
}

const mapStateToProps = (state) => ({
	theme: state.theme.theme,
	settings: state.settings.settings,
	lists: state.lists.lists,
	translations: {
		...state.settings.translations.QuicklyList,
		...state.settings.translations.common,
	},
})

const mapDispatchToProps = (dispatch) => ({
	onInitList: (id, callback) => dispatch(actions.initList(id, callback)),
	onRemoveList: (list_id) => dispatch(actions.removeList(list_id)),
})

export default connect(mapStateToProps, mapDispatchToProps)(QuicklyList)
