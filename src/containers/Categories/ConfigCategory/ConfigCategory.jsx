import React, { Component } from 'react'
import { connect } from 'react-redux'
import Dialog from '../../../components/UI/Dialog/Dialog'
import Input from '../../../components/UI/Input/Input'
import { generateDialogObject } from '../../../shared/utility'

import * as actions from '../../../store/actions'

class ConfigCategory extends Component {
	state = {
		category: { id: false, name: '' },
		control: {
			label: this.props.translations.nameLabel,
			required: true,
			characterRestriction: 20,
		},
		editCategory: null,
		dialog: false,
	}

	componentDidMount() {
		const { category } = this.props
		this.initCategory(category)
	}

	componentDidUpdate(prevProps) {
		const { category } = this.props

		if (prevProps.category !== category) {
			this.initCategory(category)
		}
	}

	initCategory = (id) => {
		const { translations, onInitCategory } = this.props

		if (id !== false) {
			onInitCategory(id, (category) => {
				this.setState({ category, editCategory: true })
				this.showDialog(translations.editCategory)
			})
		} else {
			this.setState({
				category: { id: false, name: '' },
				editCategory: false,
			})
			this.showDialog(translations.newCategory)
		}
	}

	showDialog = (title) => {
		const {
			translations,
			onSaveCategory,
			onInitCategories,
			toggleModal,
			onRefreshTask,
		} = this.props

		const dialog = generateDialogObject(title, false, {
			[translations.save]: () => {
				const { category, control, editCategory } = this.state
				if (!control.error) {
					onSaveCategory(category, (newCategory) => {
						onInitCategories(() => {
							editCategory && onRefreshTask()
							toggleModal(newCategory)
							this.setState({ category: { id: false, name: '' } })
						})
					})
				}
			},
			[translations.cancel]: () => {
				toggleModal()
				this.setState({ category: { id: false, name: '' } })
			},
		})
		this.setState({ dialog })
	}

	render() {
		const { dialog, control, category } = this.state
		const { showModal } = this.props

		return (
			<>
				{dialog && category && (
					<Dialog showModal={showModal} title={dialog.title} buttons={dialog.buttons}>
						<Input
							elementConfig={control}
							focus
							value={category.name}
							changed={(value, control) => {
								const { category } = this.state
								category.name = value
								this.setState({ category, control })
							}}
						/>
					</Dialog>
				)}
			</>
		)
	}
}

const mapStateToProps = (state) => ({
	translations: {
		...state.settings.translations.ConfigCategory,
		...state.settings.translations.validation,
		...state.settings.translations.common,
	},
})
const mapDispatchToProps = (dispatch) => ({
	onInitCategories: (callback) => dispatch(actions.initCategories(callback)),
	onInitCategory: (id, callback) => dispatch(actions.initCategory(id, callback)),
	onSaveCategory: (category, callback) => dispatch(actions.saveCategory(category, callback)),
	onRefreshTask: () => dispatch(actions.onRefresh()),
})
export default connect(mapStateToProps, mapDispatchToProps)(ConfigCategory)
