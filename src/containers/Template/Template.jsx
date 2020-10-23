import React, { Component } from 'react'
import { Platform, StatusBar, View } from 'react-native'
import { getTheme, Snackbar, ThemeContext } from 'react-native-material-ui'
import { connect } from 'react-redux'
import { initDatabase, initTheme } from '../../db'

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
		if (prevProps.theme !== this.props.theme) {
			initDatabase(() => {
				initTheme((state) => this.setState(state))
			})
		}
	}

	render() {
		const { uiTheme, ready } = this.state
		const { showSnackbar, snackbarText, bgColor, theme, children, onUpdateSnackbar } = this.props

		return (
			<>
				{ready && (
					<ThemeContext.Provider value={getTheme(uiTheme)}>
						<View
							style={{
								height: Platform.OS === 'ios' ? 20 : StatusBar.currentHeight,
								backgroundColor: theme.primaryColor,
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

						<Snackbar
							visible={showSnackbar}
							message={snackbarText}
							style={{
								container: { backgroundColor: theme.primaryBackgroundColor },
								message: { color: theme.thirdTextColor },
							}}
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
	showSnackbar: state.config.showSnackbar,
	snackbarText: state.config.snackbarText,
})
const mapDispatchToProps = (dispatch) => ({
	onUpdateSnackbar: (showSnackbar, snackbarText) =>
		dispatch(actions.updateSnackbar(showSnackbar, snackbarText)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Template)
