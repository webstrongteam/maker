import React, { Component } from 'react'
import { Platform } from 'react-native'
import { SceneMap, TabBar, TabView } from 'react-native-tab-view'
import Modal from 'react-native-modalbox'
import { connect } from 'react-redux'
import RepeatTime from './RepeatTime'
import RepeatDays from './RepeatDays'
import Spinner from '../../../../components/UI/Spinner/Spinner'

class OtherRepeat extends Component {
	state = {
		tabs: {
			index: 0,
			routes: [
				{ key: 'time', title: this.props.translations.repeatTime },
				{ key: 'days', title: this.props.translations.repeatDay },
			],
		},
	}

	saveHandler = (repeat, selectedTime) => {
		const { save } = this.props

		save(repeat, selectedTime)
	}

	render() {
		const { tabs } = this.state
		const { showModal, usingTime, repeat, selectedTime, theme, cancel } = this.props

		return (
			<Modal
				coverScreen
				style={{
					marginTop: Platform.OS === 'ios' ? 20 : 0,
					backgroundColor: theme.secondaryBackgroundColor,
				}}
				isOpen={showModal}
				swipeToClose={false}
				onClosed={cancel}
			>
				<TabView
					navigationState={tabs}
					style={{ flex: 1, justifyContent: 'center', textAlign: 'center' }}
					tabStyle={{ backgroundColor: theme.primaryColor }}
					onIndexChange={(index) => {
						tabs.index = index
						this.setState({ tabs })
					}}
					renderScene={SceneMap({
						time: () => (
							<RepeatTime
								save={this.saveHandler}
								close={cancel}
								usingTime={usingTime}
								repeat={repeat}
								selectedTime={selectedTime}
							/>
						),
						days: () => (
							<RepeatDays
								save={this.saveHandler}
								close={cancel}
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
			</Modal>
		)
	}
}

const mapStateToProps = (state) => ({
	theme: state.theme.theme,
	translations: state.settings.translations.OtherRepeat,
})

export default connect(mapStateToProps)(OtherRepeat)
