import React, { PureComponent } from 'react'
import { Icon, Toolbar } from 'react-native-material-ui'
import SettingsList from 'react-native-settings-list'
import { Text, View } from 'react-native'
import { connect } from 'react-redux'
import Template from '../Template/Template'
import Spinner from '../../components/UI/Spinner/Spinner'
import { iconStyle } from '../../shared/styles'
import { generateDialogObject } from '../../shared/utility'
import { BannerAd } from '../../shared/bannerAd'
import styles from './Settings.styles'

import * as actions from '../../store/actions'

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
		const { onInitSettings } = this.props

		onInitSettings(() => this.setState({ loading: false }))
	}

	componentDidUpdate(prevProps) {
		const { settings } = this.props

		if (prevProps.settings.lang !== settings.lang) {
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
		const { onUpdateSnackbar } = this.props

		onUpdateSnackbar(visible, message)
	}

	toggleSetting = (value, name) => {
		let newValue

		if (value) newValue = 1
		else newValue = 0

		this.props[`onChange${name}`](newValue, name)
	}

	showDialog = (action) => {
		const { translations, onUpdateModal } = this.props

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
						onUpdateModal(false)
						onChangeFirstDayOfWeek(value)
						onRefreshTask()
						this.toggleSnackbar(translations.firstDaySnackbar)
					},
				})
			})
			dialog = generateDialogObject(translations.showFirstDayOfWeekTitle, options, {
				[translations.cancel]: () => onUpdateModal(false),
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
						onUpdateModal(false)
						onChangeLang(value)
						this.toggleSnackbar(translations.langSnackbar)
					},
				})
			})
			dialog = generateDialogObject(translations.showLanguagesTitle, options, {
				[translations.cancel]: () => onUpdateModal(false),
			})

			dialog.select = true
			dialog.selectedValue = settings.lang
		}

		onUpdateModal(true, dialog)
	}

	render() {
		const { loading, daysOfWeek } = this.state
		const { navigation, settings, theme, translations } = this.props

		return (
			<Template bgColor={theme.secondaryBackgroundColor}>
				<Toolbar
					leftElement='arrow-back'
					onLeftElementPress={() => navigation.goBack()}
					centerElement={translations.settings}
				/>

				{!loading ? (
					<>
						<SettingsList
							backgroundColor={theme.secondaryBackgroundColor}
							borderColor={theme.secondaryBackgroundColor}
							defaultItemSize={50}
						>
							<SettingsList.Item
								hasNavArrow={false}
								title={translations.app}
								titleStyle={{ color: '#009688', fontWeight: '500' }}
								itemWidth={50}
								borderHide='Both'
							/>
							<SettingsList.Item
								icon={
									<View style={iconStyle}>
										<Icon
											color={theme.thirdTextColor}
											style={{ alignSelf: 'center' }}
											name='alarm'
										/>
									</View>
								}
								hasNavArrow={false}
								itemWidth={70}
								hasSwitch
								switchState={!!settings.timeFormat}
								switchOnValueChange={(value) => this.toggleSetting(value, 'TimeFormat')}
								titleStyle={{ color: theme.thirdTextColor, fontSize: 16 }}
								title={translations.timeCycle}
							/>
							<SettingsList.Item
								icon={
									<View style={iconStyle}>
										<Icon
											color={theme.thirdTextColor}
											style={{ alignSelf: 'center' }}
											name='event'
										/>
									</View>
								}
								hasNavArrow
								itemWidth={70}
								hasSwitch={false}
								titleInfo={daysOfWeek.find((d) => d.value === settings.firstDayOfWeek).name}
								onPress={() => this.showDialog('showFirstDayOfWeek')}
								titleStyle={{ color: theme.thirdTextColor, fontSize: 16 }}
								title={translations.firstDayOfWeek}
							/>
							<SettingsList.Item
								icon={
									<View style={iconStyle}>
										<Icon
											color={theme.thirdTextColor}
											style={{ alignSelf: 'center' }}
											name='done'
										/>
									</View>
								}
								hasNavArrow={false}
								itemWidth={70}
								hasSwitch
								switchState={!!settings.confirmFinishingTask}
								switchOnValueChange={(value) => this.toggleSetting(value, 'ConfirmFinishingTask')}
								titleStyle={{ color: theme.thirdTextColor, fontSize: 16 }}
								title={translations.confirmFinishing}
							/>
							<SettingsList.Item
								icon={
									<View style={iconStyle}>
										<Icon
											color={theme.thirdTextColor}
											style={{ alignSelf: 'center' }}
											name='autorenew'
										/>
									</View>
								}
								hasNavArrow={false}
								itemWidth={70}
								hasSwitch
								switchState={!!settings.confirmRepeatingTask}
								switchOnValueChange={(value) => this.toggleSetting(value, 'ConfirmRepeatingTask')}
								titleStyle={{ color: theme.thirdTextColor, fontSize: 16 }}
								title={translations.confirmRepeating}
							/>
							<SettingsList.Item
								icon={
									<View style={iconStyle}>
										<Icon
											color={theme.thirdTextColor}
											style={{ alignSelf: 'center' }}
											name='delete'
										/>
									</View>
								}
								hasNavArrow={false}
								itemWidth={70}
								hasSwitch
								switchState={!!settings.confirmDeletingTask}
								switchOnValueChange={(value) => this.toggleSetting(value, 'ConfirmDeletingTask')}
								titleStyle={{ color: theme.thirdTextColor, fontSize: 16 }}
								title={translations.confirmDeleting}
							/>
							<SettingsList.Item
								icon={
									<View style={iconStyle}>
										<Icon
											color={theme.thirdTextColor}
											style={{ alignSelf: 'center' }}
											name='timelapse'
										/>
									</View>
								}
								hasNavArrow={false}
								itemWidth={70}
								hasSwitch
								switchState={!!settings.showDeadlineTime}
								switchOnValueChange={(value) => this.toggleSetting(value, 'ShowDeadlineTime')}
								titleStyle={{ color: theme.thirdTextColor, fontSize: 16 }}
								title={translations.showDeadlineTime}
							/>
							<SettingsList.Item
								hasNavArrow={false}
								title={translations.general}
								titleStyle={{ color: '#009688', fontWeight: '500' }}
								itemWidth={50}
								borderHide='Both'
							/>
							<SettingsList.Item
								icon={
									<View style={iconStyle}>
										<Icon
											color={theme.thirdTextColor}
											style={{ alignSelf: 'center' }}
											name='g-translate'
										/>
									</View>
								}
								hasNavArrow
								itemWidth={70}
								hasSwitch={false}
								titleInfo={settings.lang}
								onPress={() => this.showDialog('showLanguages')}
								titleStyle={{ color: theme.thirdTextColor, fontSize: 16 }}
								title={translations.language}
							/>
							<SettingsList.Item
								icon={
									<View style={iconStyle}>
										<Icon
											color={theme.thirdTextColor}
											style={{ alignSelf: 'center' }}
											name='view-compact'
										/>
									</View>
								}
								hasNavArrow={false}
								itemWidth={70}
								hasSwitch
								switchState={!!settings.hideTabView}
								switchOnValueChange={(value) => this.toggleSetting(value, 'HideTabView')}
								titleStyle={{ color: theme.thirdTextColor, fontSize: 16 }}
								title={translations.hideTabView}
							/>
						</SettingsList>
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
				<BannerAd />
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
	onUpdateModal: (showModal, modal) => dispatch(actions.updateModal(showModal, modal)),
	onRefreshTask: () => dispatch(actions.onRefresh()),
})

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
