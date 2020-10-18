import React, { Component } from 'react'
import { Platform, Text, TouchableOpacity, View } from 'react-native'
import { Button, IconToggle, Toolbar } from 'react-native-material-ui'
import SettingsList from 'react-native-settings-list'
import { ColorWheel } from 'react-native-color-wheel'
import colorsys from 'colorsys'
import Modal from 'react-native-modalbox'
import { connect } from 'react-redux'
import Spinner from '../../components/UI/Spinner/Spinner'
import Template from '../Template/Template'
import Dialog from '../../components/UI/Dialog/Dialog'
import { checkValid, generateDialogObject } from '../../shared/utility'
import { BannerAd } from '../../shared/bannerAd'
import styles from './Theme.styles'

import * as actions from '../../store/actions'

class Theme extends Component {
	state = {
		customTheme: { id: false, name: '' },
		customThemeCopy: { id: false, name: '' },
		newThemeName: '',
		defaultName: this.props.translations.defaultName,

		showColorPicker: false,
		colorPickerTitle: '',
		selectedColor: '',
		actualColor: '',

		dialog: {},
		showModal: false,

		control: {
			label: this.props.translations.themeNameLabel,
			required: true,
			characterRestriction: 30,
		},
		loading: true,
	}

	componentDidMount() {
		const { navigation } = this.props

		const theme = navigation.getParam('theme', false)
		this.initTheme(theme)
	}

	initTheme = (id) => {
		if (id !== false) {
			const { onInitCustomTheme } = this.props

			onInitCustomTheme(id, (customTheme) => {
				this.setState({
					customTheme,
					customThemeCopy: JSON.parse(JSON.stringify(customTheme)),
					newThemeName: customTheme.name,
					loading: false,
				})
			})
		} else {
			const { onInitTheme, translations } = this.props

			onInitTheme((customTheme) => {
				customTheme.id = false
				customTheme.name = translations.defaultName
				this.setState({
					customTheme,
					customThemeCopy: JSON.parse(JSON.stringify(customTheme)),
					newThemeName: customTheme.name,
					loading: false,
				})
			})
		}
	}

	showDialog = (action) => {
		const { translations, onUpdateModal, navigation } = this.props

		let dialog
		if (action === 'exit') {
			dialog = generateDialogObject(translations.defaultTitle, translations.exitDescription, {
				[translations.yes]: () => {
					onUpdateModal(false)
					navigation.goBack()
				},
				[translations.save]: () => {
					onUpdateModal(false)
					this.checkValid('name', true)
				},
				[translations.cancel]: () => onUpdateModal(false),
			})
		} else if (action === 'delete') {
			dialog = generateDialogObject(translations.defaultTitle, translations.deleteDescription, {
				[translations.yes]: () => {
					onUpdateModal(false)
					this.deleteTheme()
					navigation.goBack()
				},
				[translations.no]: () => onUpdateModal(false),
			})
		} else if (action === 'changeName') {
			const { newThemeName, defaultName, control } = this.state

			dialog = generateDialogObject(
				translations.changeNameTitle,
				{
					elementConfig: control,
					focus: true,
					value: newThemeName === defaultName ? '' : newThemeName,
					onChange: (value, control) => {
						this.setState({ newThemeName: value, control }, () => {
							this.showDialog(action)
						})
					},
				},
				{
					[translations.save]: () => {
						if (!control.error) {
							const { customTheme, newThemeName } = this.state
							customTheme.name = newThemeName
							this.setState({ showModal: false, customTheme })
						}
					},
					[translations.cancel]: () => {
						const { customTheme, control } = this.state
						delete control.error
						this.setState({
							showModal: false,
							newThemeName: customTheme.name,
							control,
						})
					},
				},
			)

			dialog.input = true
			return this.setState({ dialog, showModal: true })
		}

		onUpdateModal(true, dialog)
	}

	deleteTheme = () => {
		const { customTheme } = this.state
		const { theme, onDeleteTheme } = this.props

		if (theme.id === customTheme.id) {
			const { onSetSelectedTheme } = this.props
			onSetSelectedTheme(0) // Set default theme
		}
		onDeleteTheme(customTheme.id)
	}

	checkChanges = (name = this.state.customTheme.name) => {
		const { customTheme, customThemeCopy, control } = this.state

		return (
			checkValid(control, name) && JSON.stringify(customTheme) !== JSON.stringify(customThemeCopy)
		)
	}

	configColorPicker = (colorPickerTitle, selectedColor) => {
		this.setState({ colorPickerTitle, selectedColor, showColorPicker: true })
	}

	onSaveColor = () => {
		const { selectedColor, actualColor, customTheme } = this.state
		if (actualColor && actualColor.constructor.name === 'Object') {
			customTheme[selectedColor] = colorsys.hsvToHex(actualColor)
		}

		this.setState({ customTheme, actualColor: '', showColorPicker: false })
	}

	saveTheme = () => {
		const { customTheme } = this.state
		const { navigation, onSaveTheme } = this.props

		onSaveTheme(customTheme)
		navigation.goBack()
	}

	render() {
		const {
			customTheme,
			loading,
			showColorPicker,
			selectedColor,
			colorPickerTitle,
			dialog,
			showModal,
		} = this.state
		const { navigation, theme, translations } = this.props

		return (
			<Template bgColor={theme.secondaryBackgroundColor}>
				<Toolbar
					leftElement='arrow-back'
					rightElement={
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<IconToggle
								color={theme.primaryTextColor}
								onPress={() => this.showDialog('changeName')}
								name='edit'
							/>
							{this.checkChanges() && (
								<IconToggle name='save' color={theme.primaryTextColor} onPress={this.saveTheme} />
							)}
							{customTheme.id !== false && (
								<IconToggle
									name='delete'
									color={theme.primaryTextColor}
									onPress={() => this.showDialog('delete')}
								/>
							)}
						</View>
					}
					onLeftElementPress={() => {
						if (this.checkChanges()) {
							this.showDialog('exit')
						} else navigation.goBack()
					}}
					centerElement={
						!loading ? (
							<TouchableOpacity onPress={() => this.showDialog('changeName')}>
								<Text
									style={{
										color: theme.primaryTextColor,
										fontWeight: 'bold',
										fontSize: 18,
									}}
								>
									{customTheme.name}
								</Text>
							</TouchableOpacity>
						) : (
							<View style={{ marginTop: 10, marginRight: 40 }}>
								<Spinner color={theme.secondaryBackgroundColor} size='small' />
							</View>
						)
					}
				/>

				{dialog && (
					<Dialog
						showModal={showModal}
						input
						title={dialog.title}
						body={dialog.body}
						buttons={dialog.buttons}
					/>
				)}

				<Modal
					coverScreen
					style={{
						marginTop: Platform.OS === 'ios' ? 20 : 0,
						backgroundColor: theme.secondaryBackgroundColor,
					}}
					isOpen={showColorPicker}
					swipeToClose={showColorPicker}
					onClosed={() => this.setState({ showColorPicker: false })}
				>
					<View style={{ flex: 1, padding: 45 }}>
						<View style={{ flex: 1 }}>
							<Text
								style={{
									color: theme.secondaryTextColor,
									fontSize: 21,
									textAlign: 'center',
								}}
							>
								{colorPickerTitle}
							</Text>
						</View>
						<ColorWheel
							style={{ flex: 5 }}
							initialColor={customTheme[selectedColor]}
							onColorChangeComplete={(color) => this.setState({ actualColor: color })}
						/>
						<View
							style={{
								flex: 2,
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'space-between',
							}}
						>
							<Button
								raised
								icon='done'
								text={translations.save}
								onPress={this.onSaveColor}
								style={{
									container: { backgroundColor: theme.doneIconColor },
									text: { color: theme.primaryTextColor },
								}}
							/>
							<Button
								raised
								accent
								icon='clear'
								text={translations.cancel}
								onPress={() => this.setState({ showColorPicker: false })}
								style={{
									container: { backgroundColor: theme.warningColor },
									text: { color: theme.primaryTextColor },
								}}
							/>
						</View>
					</View>
				</Modal>

				{!loading ? (
					<SettingsList
						backgroundColor={theme.primaryBackgroundColor}
						borderColor={theme.secondaryBackgroundColor}
						defaultItemSize={50}
					>
						<SettingsList.Item
							hasNavArrow={false}
							title={translations.main}
							titleStyle={{ color: '#009688', fontWeight: '500' }}
							itemWidth={50}
							borderHide='Both'
						/>
						{Object.keys(customTheme).map((key) => {
							if (key === 'id' || key === 'name') return null
							const themeList = []
							if (key === 'primaryTextColor') {
								themeList.push(<SettingsList.Header headerStyle={{ marginTop: -5 }} />)
								themeList.push(
									<SettingsList.Item
										hasNavArrow={false}
										title={translations.fonts}
										titleStyle={styles.titleStyle}
										itemWidth={70}
										borderHide='Both'
									/>,
								)
							} else if (key === 'doneIconColor') {
								themeList.push(<SettingsList.Header headerStyle={{ marginTop: -5 }} />)
								themeList.push(
									<SettingsList.Item
										hasNavArrow={false}
										title={translations.icons}
										titleStyle={styles.titleStyle}
										itemWidth={70}
										borderHide='Both'
									/>,
								)
							} else if (key === 'lowColor') {
								themeList.push(<SettingsList.Header headerStyle={{ marginTop: -5 }} />)
								themeList.push(
									<SettingsList.Item
										hasNavArrow={false}
										title={translations.priorities}
										titleStyle={styles.titleStyle}
										itemWidth={70}
										borderHide='Both'
									/>,
								)
							}
							themeList.push(
								<SettingsList.Item
									itemWidth={70}
									titleStyle={{ color: theme.thirdTextColor, fontSize: 16 }}
									title={translations[key]}
									onPress={() => this.configColorPicker(translations[key], key)}
									arrowIcon={
										<View
											style={[
												styles.colorPreview,
												{
													borderColor: theme.thirdTextColor,
													backgroundColor: customTheme[key],
												},
											]}
										/>
									}
								/>,
							)
							return themeList
						})}
					</SettingsList>
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
	translations: {
		...state.settings.translations.Theme,
		...state.settings.translations.validation,
		...state.settings.translations.common,
	},
})
const mapDispatchToProps = (dispatch) => ({
	onInitTheme: (callback) => dispatch(actions.initTheme(callback)),
	onInitCustomTheme: (id, callback) => dispatch(actions.initCustomTheme(id, callback)),
	onSaveTheme: (theme) => dispatch(actions.saveTheme(theme)),
	onSetSelectedTheme: (id) => dispatch(actions.setSelectedTheme(id)),
	onDeleteTheme: (id) => dispatch(actions.deleteTheme(id)),
	onUpdateModal: (showModal, modal) => dispatch(actions.updateModal(showModal, modal)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Theme)
