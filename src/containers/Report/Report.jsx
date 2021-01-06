import React, { Component } from 'react'
import {
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Text,
	TouchableWithoutFeedback,
	View,
} from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import axios from 'axios'
import * as Analytics from 'expo-firebase-analytics'
import { Button, Toolbar } from 'react-native-material-ui'
import { valid } from '../../shared/utility'
import { flex } from '../../shared/styles'
import config from '../../config/config'
import Spinner from '../../components/Spinner/Spinner'
import Input from '../../components/Input/Input'
import Template from '../Template/Template'
import styles from './Report.styles'

import * as actions from '../../store/actions'
import { connect } from 'react-redux'

class Report extends Component {
	state = {
		title: '',
		description: '',
		sending: false,
		controls: {
			title: {
				label: this.props.translations.titleLabel,
				required: true,
				characterRestriction: 50,
			},
			description: {
				label: this.props.translations.descriptionLabel,
				required: true,
				multiline: true,
			},
		},
	}

	changeTitle = (text, control) => {
		const { controls } = this.state

		controls.title = control
		this.setState({ title: text, controls })
	}

	changeDescription = (text, control) => {
		const { controls } = this.state

		controls.description = control
		this.setState({ description: text, controls })
	}

	toggleSnackbar = (message, visible = true) => {
		const { onUpdateSnackbar } = this.props

		onUpdateSnackbar(visible, message)
	}

	checkValidation = () => {
		const { controls, title, description } = this.state
		const { translations } = this.props
		const newControls = controls

		valid(controls.title, title, translations, (newControl) => {
			newControls.title = newControl
		})
		valid(controls.description, description, translations, (newControl) => {
			newControls.description = newControl
		})

		this.setState({ controls: newControls }, this.sendReport)
	}

	sendReport = () => {
		const { title, description, controls } = this.state
		const { translations, settings } = this.props

		if (!controls.title.error && !controls.description.error) {
			this.setState({ sending: true }, () => {
				axios
					.post(`${config.API_URL}/send-email`, {
						subject: title,
						message: `<p>${description}</p> <p>Version: ${settings.version}</p> <p>System: ${Platform.OS}</p>`,
						to: 'maker@webstrong.pl',
					})
					.then(() => {
						this.toggleSnackbar(translations.correctSend, true)

						const { controls } = this.state
						controls.title.error = true
						controls.description.error = true

						this.setState({
							title: '',
							description: '',
							sending: false,
							controls,
						})
					})
					.catch(({ message }) => {
						Analytics.logEvent('sendReportError', {
							error: message,
						})

						this.toggleSnackbar(translations.errorSend, true)
						this.setState({ sending: false })
					})
			})
		}
	}

	render() {
		const { title, description, sending, controls } = this.state
		const { navigation, theme, translations } = this.props

		const validData = !controls.title.error && !controls.description.error

		return (
			<Template bgColor={theme.secondaryBackgroundColor}>
				<Toolbar
					leftElement='arrow-back'
					onLeftElementPress={navigation.goBack}
					centerElement={translations.title}
				/>
				<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'none'} style={flex}>
					<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
						<View style={styles.formWrapper}>
							<View>
								<Text style={{ ...styles.headerText, color: theme.thirdTextColor }}>
									{translations.headerText}
								</Text>
							</View>
							<ScrollView>
								<View style={styles.form}>
									<Input
										elementConfig={controls.title}
										focus={false}
										value={title}
										changed={(value, control) => {
											this.changeTitle(value, control)
										}}
									/>
									<Input
										elementConfig={controls.description}
										focus={false}
										value={description}
										changed={(value, control) => {
											this.changeDescription(value, control)
										}}
									/>
								</View>
							</ScrollView>
							{sending ? (
								<Spinner />
							) : (
								<TouchableOpacity onPress={this.checkValidation}>
									<Button
										raised
										icon='send'
										disabled={!validData}
										text={translations.sendButton}
										style={{
											container: {
												marginLeft: 20,
												marginRight: 20,
												backgroundColor: validData ? theme.doneIconColor : '#bfbfbf',
											},
											text: { color: theme.primaryTextColor },
										}}
									/>
								</TouchableOpacity>
							)}
						</View>
					</TouchableWithoutFeedback>
				</KeyboardAvoidingView>
			</Template>
		)
	}
}

const mapStateToProps = (state) => ({
	theme: state.theme.theme,
	settings: state.settings.settings,
	translations: {
		...state.settings.translations.Report,
		...state.settings.translations.validation,
	},
})

const mapDispatchToProps = (dispatch) => ({
	onUpdateSnackbar: (showSnackbar, snackbarText) =>
		dispatch(actions.updateSnackbar(showSnackbar, snackbarText)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Report)
