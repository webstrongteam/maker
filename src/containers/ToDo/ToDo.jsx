import React, { Component } from 'react'
import { SceneMap, TabBar, TabView } from 'react-native-tab-view'
import { connect } from 'react-redux'
import Spinner from '../../components/UI/Spinner/Spinner'
import TaskList from '../Tasks/TaskList'
import Template from '../Template/Template'
import QuicklyList from '../QuicklyList/QuicklyList'

import * as actions from '../../store/actions'

class ToDo extends Component {
	state = {
		loading: true,
		tabs: {
			index: 0,
			routes: [
				// eslint-disable-next-line react/destructuring-assignment
				{ key: 'tasks', title: this.props.translations.tasks },
				// eslint-disable-next-line react/destructuring-assignment
				{ key: 'lists', title: this.props.translations.quicklyLists },
			],
		},
	}

	componentDidMount() {
		const { props } = this

		props.onInitTheme()
		props.onInitCategories()
		props.onInitProfile()
		props.onInitToDo()
		props.onInitLists()
		props.onInitSettings(() => {
			this.setState({ loading: false })
		})
	}

	componentDidUpdate(prevProps) {
		const { translations } = this.props

		if (prevProps.translations !== translations) {
			const { tabs } = this.state

			tabs.routes[0].title = translations.tasks
			tabs.routes[1].title = translations.quicklyLists
			this.setState({ tabs })
		}
	}

	render() {
		const { tabs, loading } = this.state
		const { navigation, theme, hideTabView } = this.props

		return (
			<>
				{theme && !loading ? (
					<Template bgColor={theme.secondaryBackgroundColor}>
						<TabView
							navigationState={tabs}
							tabStyle={{ backgroundColor: theme.primaryColor }}
							onIndexChange={(index) => {
								tabs.index = index
								this.setState({ tabs })
							}}
							renderScene={SceneMap({
								tasks: () => <TaskList navigation={navigation} />,
								lists: () => <QuicklyList navigation={navigation} />,
							})}
							renderTabBar={(props) => (
								<TabBar
									{...props}
									onTabPress={({ route }) => {
										props.jumpTo(route.key)
									}}
									indicatorStyle={{ backgroundColor: theme.primaryTextColor }}
									style={{
										backgroundColor: theme.primaryColor,
										height: hideTabView ? 0 : 50,
									}}
								/>
							)}
							renderLazyPlaceholder={() => <Spinner color='#f4511e' />}
							lazy
						/>
					</Template>
				) : (
					<Spinner color='#f4511e' />
				)}
			</>
		)
	}
}

const mapStateToProps = (state) => ({
	theme: state.theme.theme,
	lang: state.settings.settings.lang,
	hideTabView: state.settings.settings.hideTabView,
	translations: state.settings.translations.ToDo,
})
const mapDispatchToProps = (dispatch) => ({
	onInitToDo: () => dispatch(actions.initToDo()),
	onInitLists: () => dispatch(actions.initLists()),
	onInitCategories: () => dispatch(actions.initCategories()),
	onInitTheme: () => dispatch(actions.initTheme()),
	onInitProfile: () => dispatch(actions.initProfile()),
	onInitSettings: (callback) => dispatch(actions.initSettings(callback)),
})

export default connect(mapStateToProps, mapDispatchToProps)(ToDo)
