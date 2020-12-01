import React, { PureComponent } from 'react'
import { ScrollView, View } from 'react-native'
import { IconToggle, ListItem, Toolbar } from 'react-native-material-ui'
import { listRow, shadow, flex } from '../../shared/styles'
import ConfigCategory from './ConfigCategory/ConfigCategory'
import Template from '../Template/Template'
import { generateDialogObject } from '../../shared/utility'
import Dialog from '../../components/Dialog/Dialog'

import * as actions from '../../store/actions'
import { connect } from 'react-redux'

class CategoriesList extends PureComponent {
	state = {
		showConfigCategory: false,
		taskPerCategory: {},
		selectedCategory: false,
		dialog: null,
		showDialog: false,
		ready: false,
	}

	componentDidMount() {
		const { tasks } = this.props
		const { taskPerCategory } = this.state

		if (!tasks) {
			return this.setState({ ready: true })
		}

		tasks.map((task) => {
			if (!taskPerCategory[task.category.id]) taskPerCategory[task.category.id] = 1
			else taskPerCategory[task.category.id]++
		})

		this.setState({ taskPerCategory, ready: true })
	}

	deleteCategory = (id) => {
		const { taskPerCategory } = this.state
		const { onRemoveCategory, onRefreshTask } = this.props

		if (taskPerCategory[id]) {
			onRemoveCategory(id, () => {
				onRefreshTask()
			})
		} else {
			onRemoveCategory(id)
		}
	}

	toggleModalHandler = (selected = false) => {
		const { showConfigCategory } = this.state

		if (selected !== false) {
			this.setState({
				showConfigCategory: !showConfigCategory,
				selectedCategory: selected,
			})
		} else {
			this.setState({
				showConfigCategory: !showConfigCategory,
				selectedCategory: false,
			})
		}
	}

	showDialog = (id) => {
		const { translations } = this.props

		const cancelHandler = () => this.setState({ showDialog: false })

		const dialog = generateDialogObject(
			cancelHandler,
			translations.deleteCategoryTitle,
			translations.deleteCategoryDescription,
			{
				[translations.yes]: () => {
					this.setState({ showDialog: false })
					this.deleteCategory(id)
				},
				[translations.cancel]: cancelHandler,
			},
		)

		this.setState({ dialog, showDialog: true })
	}

	deleteCategoryHandler = (id) => {
		if (this.state.taskPerCategory[id]) {
			this.showDialog(id)
		} else {
			this.deleteCategory(id)
		}
	}

	render() {
		const {
			showConfigCategory,
			selectedCategory,
			taskPerCategory,
			dialog,
			showDialog,
			ready,
		} = this.state
		const { categories, navigation, theme, translations } = this.props

		return (
			<Template bgColor={theme.secondaryBackgroundColor}>
				<Toolbar
					leftElement='arrow-back'
					rightElement={
						<IconToggle
							color={theme.primaryTextColor}
							onPress={this.toggleModalHandler}
							name='add'
						/>
					}
					onLeftElementPress={navigation.goBack}
					centerElement={translations.title}
				/>

				{showConfigCategory && (
					<ConfigCategory
						showDialog={showConfigCategory}
						category={selectedCategory}
						toggleModal={this.toggleModalHandler}
					/>
				)}

				<Dialog {...dialog} theme={theme} showDialog={showDialog} />

				{ready && (
					<View style={flex}>
						<ScrollView style={{ paddingTop: 5 }}>
							{categories.map((cate) => (
								<ListItem
									key={cate.id}
									style={{
										container: {
											...shadow,
											...listRow,
											backgroundColor: theme.primaryBackgroundColor,
										},
									}}
									rightElement={
										cate.id !== 0 ? (
											<IconToggle
												onPress={() => this.deleteCategoryHandler(cate.id)}
												name='delete'
												color={theme.warningColor}
											/>
										) : null
									}
									centerElement={{
										primaryText: `${cate.name} (${
											taskPerCategory[cate.id] ? taskPerCategory[cate.id] : 0
										})`,
									}}
									onPress={() => this.toggleModalHandler(cate.id)}
								/>
							))}
						</ScrollView>
					</View>
				)}
			</Template>
		)
	}
}

const mapStateToProps = (state) => ({
	tasks: state.tasks.tasks,
	categories: state.categories.categories,
	theme: state.theme.theme,
	translations: {
		...state.settings.translations.Categories,
		...state.settings.translations.common,
	},
})

const mapDispatchToProps = (dispatch) => ({
	onRemoveCategory: (id, callback) => dispatch(actions.removeCategory(id, callback)),
	onRefreshTask: () => dispatch(actions.onRefresh()),
})

export default connect(mapStateToProps, mapDispatchToProps)(CategoriesList)
