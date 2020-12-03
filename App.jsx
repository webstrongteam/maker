import React, { Component } from 'react'
import { ActivityIndicator, NativeModules, View, LogBox } from 'react-native'
import { applyMiddleware, combineReducers, createStore } from 'redux'
import { getTheme, ThemeContext } from 'react-native-material-ui'
import * as Analytics from 'expo-firebase-analytics'
import { loadAsync } from 'expo-font'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import { setCustomText } from 'react-native-global-props'
import { activity } from './src/shared/styles'
import { initApp, initTheme } from './src/database/db'

import Router from './src/router'
import tasksReducer from './src/store/reducers/tasks'
import listsReducer from './src/store/reducers/lists'
import cateReducer from './src/store/reducers/categories'
import themeReducer from './src/store/reducers/theme'
import profileReducer from './src/store/reducers/profile'
import settingsReducer from './src/store/reducers/settings'
import configReducer from './src/store/reducers/config'

const { UIManager } = NativeModules

const rootReducer = combineReducers({
	tasks: tasksReducer,
	lists: listsReducer,
	categories: cateReducer,
	theme: themeReducer,
	profile: profileReducer,
	settings: settingsReducer,
	config: configReducer,
})

export const store = createStore(rootReducer, applyMiddleware(thunk))

class App extends Component {
	state = {
		uiTheme: false,
		ready: false,
	}

	async componentDidMount() {
		await loadAsync({
			Ubuntu: require('./src/assets/fonts/Ubuntu.ttf'),
		})

		// Setting default styles for all Text components.
		const customTextProps = {
			style: { fontFamily: 'Ubuntu' },
		}
		setCustomText(customTextProps)

		initApp(() => {
			initTheme((state) => {
				Analytics.logEvent('successStartedApp', {
					name: 'startedApp',
				})

				this.setState(state)
			})
		})
	}

	UNSAFE_componentWillMount() {
		if (UIManager.setLayoutAnimationEnabledExperimental) {
			UIManager.setLayoutAnimationEnabledExperimental(true)
		}
	}

	render() {
		const { uiTheme, ready } = this.state
		// TODO: only ignore known logs
		LogBox.ignoreAllLogs(true)

		return ready ? (
			<Provider store={store}>
				<ThemeContext.Provider value={getTheme(uiTheme)}>
					<Router />
				</ThemeContext.Provider>
			</Provider>
		) : (
			<View style={activity}>
				<ActivityIndicator size='large' color='#f4511e' />
			</View>
		)
	}
}

export default App
