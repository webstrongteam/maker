import React, { Component } from 'react'
import { Platform, Text, TouchableOpacity, View } from 'react-native'
import { Button, IconToggle, Toolbar } from 'react-native-material-ui'
import SettingsList from 'react-native-settings-list'
import { ColorWheel } from 'react-native-color-wheel'
import colorsys from 'colorsys'
import Modal from 'react-native-modalbox'
import Spinner from '../../../components/Spinner/Spinner'
import Template from '../../Template/Template'
import Dialog from '../../../components/Dialog/Dialog'
import { checkValid, generateDialogObject } from '../../../shared/utility'
import { settingsHeading, flex } from '../../../shared/styles'
import { headingWidth, itemWidth } from '../../../shared/consts'
import styles from './Theme.styles'

import * as actions from '../../../store/actions'
import { connect } from 'react-redux'

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
		showDialog: false,

		control: {
			label: this.props.translations.themeNameLabel,
			required: true,
			characterRestriction: 30,
		},
		loading: true,
	}

	componentDidMount() {
		const theme = this.props.navigation.getParam('theme', false)
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
		const { translations, navigation } = this.props

		const cancelHandler = () => this.setState({ showDialog: false })

		let dialog
		if (action === 'exit') {
			dialog = generateDialogObject(
				cancelHandler,
				translations.defaultTitle,
				translations.exitDescription,
				{
					[translations.yes]: () => {
						cancelHandler()
						navigation.goBack()
					},
					[translations.save]: () => {
						const { navigation, onSaveTheme } = this.props

						cancelHandler()
						onSaveTheme(this.state.customTheme)
						navigation.goBack()
					},
					[translations.cancel]: cancelHandler,
				},
			)
		} else if (action === 'delete') {
			dialog = generateDialogObject(
				cancelHandler,
				translations.defaultTitle,
				translations.deleteDescription,
				{
					[translations.yes]: () => {
						cancelHandler()
						this.deleteTheme()
						navigation.goBack()
					},
					[translations.no]: cancelHandler,
				},
			)
		} else if (action === 'changeName') {
			const { newThemeName, defaultName, control } = this.state

			const cancelHandler = () => {
				const { customTheme, control } = this.state
				delete control.error
				this.setState({
					showDialog: false,
					newThemeName: customTheme.name,
					control,
				})
			}

			dialog = generateDialogObject(
				cancelHandler,
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
							this.setState({ showDialog: false, customTheme })
						}
					},
					[translations.cancel]: cancelHandler,
				},
			)

			dialog.input = true
		}

		this.setState({ dialog, showDialog: true })
	}

	deleteTheme = () => {
		const { customTheme } = this.state
		const { theme, onDeleteTheme } = this.props

		if (theme.id === customTheme.id) {
			this.props.onSelectTheme(0) // Set default theme
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

		onSaveTheme(customTheme, (id) => {
			this.props.onSelectTheme(id)
			navigation.goBack()
		})
	}

	render() {
		const {
			customTheme,
			loading,
			showColorPicker,
			selectedColor,
			colorPickerTitle,
			dialog,
			showDialog,
		} = this.state
		const { navigation, theme, translations } = this.props

		return (
			<Template bgColor={theme.secondaryBackgroundColor}>
				<Toolbar
					leftElement='arrow-back'
					rightElement={
						<View style={styles.rightElement}>
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
										fontSize: 18,
									}}
								>
									{customTheme.name}
								</Text>
							</TouchableOpacity>
						) : (
							<View style={styles.spinnerWrapper}>
								<Spinner color={theme.secondaryBackgroundColor} size='small' />
							</View>
						)
					}
				/>

				<Dialog {...dialog} theme={theme} showDialog={showDialog} />

				{/* TODO: Move it to router */}
				<Modal
					coverScreen
					style={{
						marginTop: Platform.OS === 'ios' ? 20 : 0,
						backgroundColor: theme.secondaryBackgroundColor,
					}}
					isOpen={showColorPicker}
					swipeToClose={false}
					onClosed={() => this.setState({ showColorPicker: false })}
				>
					<View style={styles.modalContent}>
						<View style={flex}>
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
							style={styles.colorWheel}
							initialColor={customTheme[selectedColor]}
							onColorChangeComplete={(color) => this.setState({ actualColor: color })}
						/>
						<View style={styles.colorWheelButtons}>
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
						defaultItemSize={headingWidth}
					>
						<SettingsList.Item
							hasNavArrow={false}
							title={translations.main}
							titleStyle={settingsHeading}
							itemWidth={headingWidth}
							borderHide='Both'
						/>
						{Object.keys(customTheme).map((key) => {
							if (key === 'id' || key === 'name') return null
							const themeList = []
							if (key === 'primaryTextColor') {
								themeList.push(<SettingsList.Header headerStyle={styles.headerStyle} />)
								themeList.push(
									<SettingsList.Item
										hasNavArrow={false}
										title={translations.fonts}
										titleStyle={settingsHeading}
										itemWidth={itemWidth}
										borderHide='Both'
									/>,
								)
							} else if (key === 'doneIconColor') {
								themeList.push(<SettingsList.Header headerStyle={styles.headerStyle} />)
								themeList.push(
									<SettingsList.Item
										hasNavArrow={false}
										title={translations.icons}
										titleStyle={settingsHeading}
										itemWidth={itemWidth}
										borderHide='Both'
									/>,
								)
							} else if (key === 'lowColor') {
								themeList.push(<SettingsList.Header headerStyle={styles.headerStyle} />)
								themeList.push(
									<SettingsList.Item
										hasNavArrow={false}
										title={translations.priorities}
										titleStyle={settingsHeading}
										itemWidth={itemWidth}
										borderHide='Both'
									/>,
								)
							}
							themeList.push(
								<SettingsList.Item
									itemWidth={itemWidth}
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
	onSaveTheme: (theme, callback) => dispatch(actions.saveTheme(theme, callback)),
	onSelectTheme: (id) => dispatch(actions.selectTheme(id)),
	onDeleteTheme: (id) => dispatch(actions.deleteTheme(id)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Theme)
