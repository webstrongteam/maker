import React, { Component } from 'react'
import { SceneMap, TabBar, TabView } from 'react-native-tab-view'
import Template from '../../Template/Template'
import RepeatTime from './components/RepeatTime'
import RepeatDays from './components/RepeatDays'
import Spinner from '../../../components/Spinner/Spinner'
import styles from './OtherRepeat.styles'

import { connect } from 'react-redux'

class OtherRepeat extends Component {
	state = {
		tabs: {
			index: 0,
			routes: [
				{ key: 'time', title: this.props.translations.repeatTime },
				{ key: 'days', title: this.props.translations.repeatDay },
			],
		},
		loading: true,
	}

	componentDidMount() {
		const { navigation } = this.props

		const data = {
			usingTime: navigation.getParam('usingTime', undefined),
			repeat: navigation.getParam('repeat', undefined),
			selectedTime: navigation.getParam('selectedTime', undefined),
			saveHandler: navigation.getParam('saveHandler', undefined),
		}

		this.setState({ ...data, loading: false })
	}

	saveHandler = (repeat, selectedTime) => {
		this.state.saveHandler(repeat, selectedTime)
		this.props.navigation.goBack()
	}

	render() {
		const { tabs, usingTime, repeat, selectedTime, loading } = this.state
		const { navigation, theme } = this.props

		if (loading) {
			return <Spinner />
		}

		return (
			<Template>
				<TabView
					navigationState={tabs}
					style={styles.tabView}
					tabStyle={{ backgroundColor: theme.primaryColor }}
					onIndexChange={(index) => {
						tabs.index = index
						this.setState({ tabs })
					}}
					renderScene={SceneMap({
						time: () => (
							<RepeatTime
								save={this.saveHandler}
								close={() => navigation.goBack()}
								usingTime={usingTime}
								repeat={repeat}
								selectedTime={selectedTime}
							/>
						),
						days: () => (
							<RepeatDays
								save={this.saveHandler}
								close={() => navigation.goBack()}
								repeat={repeat}
								selectedTime={selectedTime}
							/>
						),
					})}
					renderTabBar={(props) => (
						<TabBar
							{...props}
							onTabPress={({ route }) => {
								props.jumpTo(route.key)
							}}
							indicatorStyle={{ backgroundColor: theme.primaryTextColor }}
							style={{ backgroundColor: theme.primaryColor }}
						/>
					)}
					renderLazyPlaceholder={() => <Spinner />}
					lazy
				/>
			</Template>
		)
	}
}

const mapStateToProps = (state) => ({
	theme: state.theme.theme,
	translations: state.settings.translations.OtherRepeat,
})

export default connect(mapStateToProps)(OtherRepeat)
