import React, { PureComponent } from 'react'
import { Toolbar } from 'react-native-material-ui'
import { Text, View } from 'react-native'
import SettingsList from './SettingsList/SettingsList'
import Template from '../Template/Template'
import Spinner from '../../components/Spinner/Spinner'
import Dialog from '../../components/Dialog/Dialog'
import { generateDialogObject } from '../../shared/utility'
import styles from './Settings.styles'

import * as actions from '../../store/actions'
import { connect } from 'react-redux'

class Settings extends PureComponent {
	state = {
		daysOfWeek: [
			{ name: this.props.translations.sunday, value: 'Sunday' },
			{ name: this.props.translations.monday, value: 'Monday' },
		],
		languages: [
			{ name: this.props.translations.english, short_name: 'en' },
			{ name: this.props.translations.polish, short_name: 'pl' },
		],
		loading: true,
	}

	componentDidMount() {
		this.props.onInitSettings(() => this.setState({ loading: false }))
	}

	componentDidUpdate(prevProps) {
		if (prevProps.settings.lang !== this.props.settings.lang) {
			const { translations } = this.props
			const daysOfWeek = [
				{ name: translations.sunday, value: 'Sunday' },
				{ name: translations.monday, value: 'Monday' },
			]
			const languages = [
				{ name: translations.english, short_name: 'en' },
				{ name: translations.polish, short_name: 'pl' },
			]
			this.setState({ daysOfWeek, languages })
		}
	}

	toggleSnackbar = (message, visible = true) => {
		this.props.onUpdateSnackbar(visible, message)
	}

	toggleSetting = (value, name) => {
		let newValue

		if (value) newValue = 1
		else newValue = 0

		this.props[`onChange${name}`](newValue, name)
	}

	showDialog = (action) => {
		const { translations } = this.props

		const cancelHandler = () => this.setState({ showDialog: false })

		let dialog
		if (action === 'showFirstDayOfWeek') {
			const { daysOfWeek } = this.state
			const { settings, onChangeFirstDayOfWeek, onRefreshTask } = this.props

			const options = []
			daysOfWeek.map((day) => {
				options.push({
					name: day.name,
					value: day.value,
					onClick: (value) => {
						cancelHandler()
						onChangeFirstDayOfWeek(value)
						onRefreshTask()
						this.toggleSnackbar(translations.firstDaySnackbar)
					},
				})
			})
			dialog = generateDialogObject(cancelHandler, translations.showFirstDayOfWeekTitle, options, {
				[translations.cancel]: cancelHandler,
			})

			dialog.select = true
			dialog.selectedValue = settings.firstDayOfWeek
		} else if (action === 'showLanguages') {
			const { languages } = this.state
			const { settings, onChangeLang } = this.props

			const options = []
			languages.map((lang) => {
				options.push({
					name: lang.name,
					value: lang.short_name,
					onClick: (value) => {
						cancelHandler()
						onChangeLang(value)
						this.toggleSnackbar(translations.langSnackbar)
					},
				})
			})
			dialog = generateDialogObject(cancelHandler, translations.showLanguagesTitle, options, {
				[translations.cancel]: cancelHandler,
			})

			dialog.select = true
			dialog.selectedValue = settings.lang
		}

		this.setState({ showDialog: true, dialog })
	}

	render() {
		const { loading, daysOfWeek, dialog, showDialog } = this.state
		const { navigation, settings, theme, translations } = this.props

		return (
			<Template bgColor={theme.secondaryBackgroundColor}>
				<Toolbar
					leftElement='arrow-back'
					onLeftElementPress={() => navigation.goBack()}
					centerElement={translations.settings}
				/>

				<Dialog {...dialog} theme={theme} showDialog={showDialog} />

				{!loading ? (
					<>
						<SettingsList
							translations={translations}
							theme={theme}
							settings={settings}
							daysOfWeek={daysOfWeek}
							showDialog={this.showDialog}
							toggleSetting={this.toggleSetting}
						/>
						<View style={styles.version}>
							<Text style={{ color: theme.thirdTextColor }}>
								{translations.version}: &nbsp;
								{settings.version}
							</Text>
						</View>
					</>
				) : (
					<Spinner />
				)}
			</Template>
		)
	}
}

const mapStateToProps = (state) => ({
	theme: state.theme.theme,
	settings: state.settings.settings,
	translations: {
		...state.settings.translations.Settings,
		...state.settings.translations.common,
	},
})

const mapDispatchToProps = (dispatch) => ({
	onInitSettings: (callback) => dispatch(actions.initSettings(callback)),
	onChangeLang: (value) => dispatch(actions.changeLang(value)),
	onChangeFirstDayOfWeek: (value) => dispatch(actions.changeFirstDayOfWeek(value)),
	onChangeTimeFormat: (value) => dispatch(actions.changeTimeFormat(value)),
	onChangeConfirmRepeatingTask: (value) => dispatch(actions.changeConfirmRepeatingTask(value)),
	onChangeConfirmFinishingTask: (value) => dispatch(actions.changeConfirmFinishingTask(value)),
	onChangeConfirmDeletingTask: (value) => dispatch(actions.changeConfirmDeletingTask(value)),
	onChangeHideTabView: (value) => dispatch(actions.changeHideTabView(value)),
	onChangeShowDeadlineTime: (value) => dispatch(actions.changeShowDeadlineTime(value)),
	onUpdateSnackbar: (showSnackbar, snackbarText) =>
		dispatch(actions.updateSnackbar(showSnackbar, snackbarText)),
	onRefreshTask: () => dispatch(actions.onRefresh()),
})

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
