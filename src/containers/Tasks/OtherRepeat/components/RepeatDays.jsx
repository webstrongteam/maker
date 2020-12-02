import React, { Component } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Avatar, Button } from 'react-native-material-ui'
import { weekdaysCodes } from '../../../../shared/consts'
import styles from './RepeatDays.styles'

import { connect } from 'react-redux'

class RepeatDays extends Component {
	state = {}

	componentDidMount() {
		const { selectedTime, repeat, firstDayOfWeek } = this.props
		let newState = {}

		if (firstDayOfWeek === 'Monday') {
			newState.repeatTimes = [
				'monday',
				'tuesday',
				'wednesday',
				'thursday',
				'friday',
				'saturday',
				'sunday',
			]
		} else {
			newState.repeatTimes = [
				'sunday',
				'monday',
				'tuesday',
				'wednesday',
				'thursday',
				'friday',
				'saturday',
			]
		}

		if (`${selectedTime}` === '6') {
			newState.repeat = `${repeat}`
		} else {
			newState.repeat = ''
		}

		this.setState(newState)
	}

	checkDay = (index) => {
		const { repeat } = this.state

		if (repeat.includes(`${index}`)) {
			this.setState({ repeat: repeat.replace(`${index}`, '') })
		} else {
			this.setState({ repeat: repeat + index })
		}
	}

	render() {
		const { repeat, repeatTimes } = this.state
		const { theme, translations, save, close } = this.props

		if (!repeatTimes) {
			return <></>
		}

		return (
			<View style={{ flex: 1, backgroundColor: theme.secondaryBackgroundColor }}>
				<ScrollView>
					<Text
						style={{
							...styles.title,
							color: theme.thirdTextColor,
						}}
					>
						{translations.repeatDaysTitle}
					</Text>
					<View
						style={{
							...styles.repeatTimesWrapper,
							color: theme.primaryTextColor,
						}}
					>
						{repeatTimes.map((day, index) => (
							<TouchableOpacity key={index} onPress={() => this.checkDay(weekdaysCodes[day])}>
								<Avatar
									size={82}
									style={{
										container: {
											margin: 5,
											backgroundColor: repeat.includes(weekdaysCodes[day])
												? theme.primaryColor
												: theme.thirdTextColor,
										},
										content: { fontSize: 26 },
									}}
									text={translations[day]}
								/>
							</TouchableOpacity>
						))}
					</View>
					<View style={styles.buttons}>
						<Button
							raised
							icon='done'
							text={translations.save}
							onPress={() => {
								const { repeat } = this.state
								if (repeat.length) {
									save(repeat, '6')
								}
							}}
							style={{
								container: { backgroundColor: theme.doneIconColor },
								text: { color: theme.primaryTextColor },
							}}
						/>
						<Button
							raised
							icon='clear'
							text={translations.cancel}
							onPress={close}
							style={{
								container: { backgroundColor: theme.warningColor },
								text: { color: theme.primaryTextColor },
							}}
						/>
					</View>
				</ScrollView>
			</View>
		)
	}
}

const mapStateToProps = (state) => ({
	theme: state.theme.theme,
	firstDayOfWeek: state.settings.settings.firstDayOfWeek,
	translations: {
		...state.settings.translations.common,
		...state.settings.translations.OtherDays,
	},
})

export default connect(mapStateToProps)(RepeatDays)
