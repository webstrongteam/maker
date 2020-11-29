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
import axios from 'axios'
import { Button, Toolbar } from 'react-native-material-ui'
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

	sendReport = () => {
		const { title, description, controls } = this.state
		const { translations, settings } = this.props

		if (!controls.title.error && !controls.description.error) {
			this.setState({ sending: true }, () => {
				axios
					.post(`${config.API_URL}/send-email`, {
						subject: `Maker - ${title}`,
						message: `${description}<p>version: ${settings.version}</p> <p>system: ${Platform.OS}</p>`,
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
					.catch(() => {
						this.toggleSnackbar(translations.errorSend, true)
						this.setState({ sending: false })
					})
			})
		}
	}

	render() {
		const { title, description, sending, controls } = this.state
		const { navigation, theme, translations } = this.props

		const validDate = !controls.title.error && !controls.description.error

		return (
			<Template bgColor={theme.secondaryBackgroundColor}>
				<Toolbar
					leftElement='arrow-back'
					onLeftElementPress={navigation.goBack}
					centerElement={translations.title}
				/>
				<KeyboardAvoidingView behavior='padding' style={flex}>
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
								<Button
									raised
									icon='send'
									disabled={!validDate}
									text={translations.sendButton}
									onPress={this.sendReport}
									style={{
										container: { backgroundColor: validDate ? theme.doneIconColor : '#bfbfbf' },
										text: { color: theme.primaryTextColor },
									}}
								/>
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
	translations: state.settings.translations.Report,
})

const mapDispatchToProps = (dispatch) => ({
	onUpdateSnackbar: (showSnackbar, snackbarText) =>
		dispatch(actions.updateSnackbar(showSnackbar, snackbarText)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Report)
