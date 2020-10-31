import React, { Component } from 'react'
import { Platform, ScrollView, TouchableOpacity, View } from 'react-native'
import { Button, ListItem } from 'react-native-material-ui'
import Input from '../../../../components/Input/Input'
import { getTimeVariant } from '../../../../shared/utility'
import { flex } from '../../../../shared/styles'
import styles from './RepeatTime.styles'

import { connect } from 'react-redux'

const repeatTimes = ['minute', 'hour', 'day', 'week', 'month', 'year']

class RepeatTime extends Component {
	state = {
		control: {
			label: this.props.translations.valueLabel,
			number: true,
			positiveNumber: true,
			required: true,
			characterRestriction: 4,
			keyboardType: 'number-pad',
		},
		repeat: null,
		selectedTime: '2',
		loading: true,
	}

	componentDidMount() {
		const { repeat } = this.props
		const { selectedTime } = this.props
		let newState = {}

		if (!selectedTime) {
			const { usingTime } = this.props

			if (usingTime) {
				newState.selectedTime = '0'
			} else {
				newState.selectedTime = '2'
			}
		} else {
			newState.selectedTime = selectedTime
		}
		if (+selectedTime !== 6 && repeat) {
			newState.repeat = repeat
		}

		this.setState({ ...newState, loading: false })
	}

	render() {
		const { control, repeat, selectedTime, loading } = this.state
		const { usingTime, lang, theme, translations, save, close } = this.props

		if (loading) {
			return <></>
		}

		return (
			<View style={flex}>
				<ScrollView>
					<Input
						elementConfig={control}
						focus={false}
						value={repeat}
						changed={(val, control) => {
							this.setState({ control, repeat: val })
						}}
					/>

					<View style={{ marginTop: 10, color: theme.primaryTextColor }}>
						{repeatTimes.map((time, index) => {
							if (!usingTime && (time === 'hour' || time === 'minute')) return null
							return (
								<TouchableOpacity
									key={index}
									onPress={() => this.setState({ selectedTime: `${index}` })}
								>
									<ListItem
										divider
										dense
										style={{
											contentViewContainer: {
												backgroundColor:
													Platform.OS === 'ios' ? theme.secondaryBackgroundColor : 'transparent',
											},
											primaryText: {
												color:
													`${index}` === `${selectedTime}`
														? theme.primaryColor
														: theme.thirdTextColor,
											},
										}}
										centerElement={{
											primaryText: getTimeVariant(+repeat, time, lang, translations),
										}}
									/>
								</TouchableOpacity>
							)
						})}
					</View>
					<View style={styles.buttons}>
						<Button
							raised
							icon='done'
							text={translations.save}
							onPress={() => {
								const { control, repeat, selectedTime } = this.state
								if (!control.error) {
									save(repeat, selectedTime)
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
	lang: state.settings.settings.lang,
	translations: {
		...state.settings.translations.OtherRepeat,
		...state.settings.translations.times,
		...state.settings.translations.common,
	},
})

export default connect(mapStateToProps)(RepeatTime)
