import React, { Component } from 'react'
import { Platform, StatusBar, View } from 'react-native'
import { getTheme, Snackbar, ThemeContext } from 'react-native-material-ui'
import { connect } from 'react-redux'
import { initDatabase, initTheme } from '../../db'
import Dialog from '../../components/UI/Dialog/Dialog'

import * as actions from '../../store/actions'

class Template extends Component {
	state = {
		uiTheme: false,
		ready: false,
	}

	componentDidMount() {
		const { theme } = this.props
		this.setState({
			uiTheme: {
				primaryColor: theme.primaryColor,
				accentColor: theme.warningColor,
				primaryTextColor: theme.primaryTextColor,
				secondaryTextColor: theme.secondaryTextColor,
				canvasColor: theme.secondaryBackgroundColor,
				alternateTextColor: theme.primaryTextColor,
				disabledColor: theme.primaryTextColor,
				pickerHeaderColor: theme.primaryTextColor,
			},
			ready: true,
		})
	}

	componentDidUpdate(prevProps) {
		const { theme } = this.props

		if (prevProps.theme !== theme) {
			initDatabase(() => {
				initTheme((state) => this.setState(state))
			})
		}
	}

	render() {
		const { uiTheme, ready } = this.state
		const {
			showModal,
			modal,
			showSnackbar,
			snackbarText,
			bgColor,
			theme,
			children,
			onUpdateSnackbar,
		} = this.props

		return (
			<>
				{ready && (
					<ThemeContext.Provider value={getTheme(uiTheme)}>
						<View
							style={{
								height: Platform.OS === 'ios' ? 20 : StatusBar.currentHeight,
								backgroundColor: '#af3f1f',
							}}
						>
							<StatusBar backgroundColor='rgba(0, 0, 0, 0.2)' translucent />
						</View>
						<View
							style={{
								flex: 1,
								backgroundColor: bgColor ? bgColor : theme.primaryBackgroundColor,
							}}
						>
							{children}
						</View>

						<Dialog
							showModal={showModal}
							input={modal.input}
							select={modal.select}
							selectedValue={modal.selectedValue}
							title={modal.title}
							body={modal.body}
							buttons={modal.buttons}
						/>

						<Snackbar
							visible={showSnackbar}
							message={snackbarText}
							style={{ container: { backgroundColor: '#1a1a1a' } }}
							onPress={() => onUpdateSnackbar(false)}
							onRequestClose={() => onUpdateSnackbar(false)}
						/>
					</ThemeContext.Provider>
				)}
			</>
		)
	}
}

const mapStateToProps = (state) => ({
	theme: state.theme.theme,
	showModal: state.config.showModal,
	modal: state.config.modal,
	showSnackbar: state.config.showSnackbar,
	snackbarText: state.config.snackbarText,
})
const mapDispatchToProps = (dispatch) => ({
	onUpdateSnackbar: (showSnackbar, snackbarText) =>
		dispatch(actions.updateSnackbar(showSnackbar, snackbarText)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Template)