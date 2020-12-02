import React, { Component } from 'react'
import Dialog from '../../../components/Dialog/Dialog'
import { generateDialogObject } from '../../../shared/utility'

import * as actions from '../../../store/actions'
import { connect } from 'react-redux'

class ConfigQuicklyTask extends Component {
	state = {
		task: {
			id: false,
			name: '',
			order_nr: null,
			list_id: false,
		},
		control: {
			label: this.props.translations.quicklyTaskName,
			required: true,
			characterRestriction: 40,
		},
		dialog: null,
	}

	componentDidMount() {
		this.initQuicklyTask(this.props.task_id)
	}

	initQuicklyTask = (task_id) => {
		const { translations } = this.props

		if (task_id !== false) {
			const { onInitQuicklyTask } = this.props

			onInitQuicklyTask(task_id, (res) => {
				this.setState({ task: res })
				this.showDialog(translations.editTask)
			})
		} else {
			this.setState({
				task: {
					id: false,
					name: '',
					order_nr: null,
					list_id: false,
				},
			})
			this.showDialog(translations.newTask)
		}
	}

	showDialog = (title) => {
		const { task, control } = this.state
		const { toggleModal, translations } = this.props

		const dialog = generateDialogObject(
			toggleModal,
			title,
			{
				elementConfig: control,
				focus: true,
				value: task.name,
				onChange: (value, control) => {
					const { task } = this.state
					task.name = value
					this.setState({ task, control }, () => {
						this.showDialog(title)
					})
				},
			},
			{
				[translations.save]: () => {
					const { control } = this.state
					const { list, taskLength, onSaveQuicklyTask } = this.props
					if (!control.error) {
						if (task.order_nr === null) {
							task.order_nr = taskLength
						}
						onSaveQuicklyTask(task, list, (list) => {
							toggleModal(task, list)
						})
					}
				},
				[translations.cancel]: toggleModal,
			},
		)

		this.setState({ dialog })
	}

	render() {
		const { dialog } = this.state
		const { theme, showDialog } = this.props

		return <Dialog {...dialog} input theme={theme} showDialog={showDialog} />
	}
}

const mapStateToProps = (state) => ({
	theme: state.theme.theme,
	translations: {
		...state.settings.translations.ConfigQuicklyTask,
		...state.settings.translations.validation,
		...state.settings.translations.common,
	},
})

const mapDispatchToProps = (dispatch) => ({
	onInitQuicklyTask: (id, callback) => dispatch(actions.initQuicklyTask(id, callback)),
	onSaveQuicklyTask: (task, list, callback) =>
		dispatch(actions.saveQuicklyTask(task, list, callback)),
})
export default connect(mapStateToProps, mapDispatchToProps)(ConfigQuicklyTask)
