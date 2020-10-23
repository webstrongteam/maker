import React from 'react'
import { Keyboard, Platform, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { ListItem } from 'react-native-material-ui'
import Dialog from 'react-native-dialog'
import { connect } from 'react-redux'
import Input from '../Input/Input'

const dialog = (props) => {
	if (props.select) {
		return selectDialog(props)
	}
	if (props.input) {
		return inputDialog(props)
	}
	return defaultDialog(props)
}

const checkSelectedOption = (value, selectedValue) => {
	if (value.id && selectedValue.id) {
		return +value.id === +selectedValue.id
	}
	return value === selectedValue
}

const defaultDialog = (props) => (
	<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
		<Dialog.Container
			contentStyle={{ backgroundColor: props.theme.secondaryBackgroundColor }}
			visible={props.showModal}
		>
			{props.title && (
				<Dialog.Title style={{ textAlign: 'center', color: props.theme.thirdTextColor }}>
					{props.title}
				</Dialog.Title>
			)}

			{props.body ? (
				<Dialog.Description style={{ color: props.theme.thirdTextColor }}>
					{props.body}
				</Dialog.Description>
			) : (
				<View>{props.children ? props.children : null}</View>
			)}

			{props.buttons &&
				props.buttons.map((button) => (
					<Dialog.Button key={button.label} label={button.label} onPress={button.onPress} />
				))}
		</Dialog.Container>
	</TouchableWithoutFeedback>
)

const selectDialog = (props) => (
	<Dialog.Container
		contentStyle={{ backgroundColor: props.theme.secondaryBackgroundColor }}
		visible={props.showModal}
	>
		{props.title && (
			<Dialog.Title style={{ color: props.theme.thirdTextColor }}>{props.title}</Dialog.Title>
		)}

		{props.body && (
			<View style={{ marginBottom: 10 }}>
				{props.body.map((option, index) => (
					<TouchableOpacity key={index} onPress={() => option.onClick(option.value)}>
						<ListItem
							divider
							dense
							style={{
								contentViewContainer: {
									backgroundColor:
										Platform.OS === 'ios' ? props.theme.secondaryBackgroundColor : 'transparent',
								},
								primaryText: {
									color: checkSelectedOption(option.value, props.selectedValue)
										? props.theme.primaryColor
										: props.theme.thirdTextColor,
								},
								...option.style,
							}}
							centerElement={{
								primaryText: option.name,
							}}
						/>
					</TouchableOpacity>
				))}
			</View>
		)}

		{props.buttons &&
			props.buttons.map((button) => (
				<Dialog.Button key={button.label} label={button.label} onPress={button.onPress} />
			))}
	</Dialog.Container>
)

const inputDialog = (props) => (
	<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
		<Dialog.Container
			contentStyle={{ backgroundColor: props.theme.secondaryBackgroundColor }}
			visible={props.showModal}
		>
			{props.title && (
				<Dialog.Title style={{ textAlign: 'center', color: props.theme.thirdTextColor }}>
					{props.title}
				</Dialog.Title>
			)}

			{props.body && (
				<Input
					elementConfig={props.body.elementConfig ? props.body.elementConfig : null}
					focus={props.body.focus}
					value={props.body.value}
					changed={props.body.onChange}
				/>
			)}

			{props.buttons &&
				props.buttons.map((button) => (
					<Dialog.Button key={button.label} label={button.label} onPress={button.onPress} />
				))}
		</Dialog.Container>
	</TouchableWithoutFeedback>
)

const mapStateToProps = (state) => ({ theme: state.theme.theme })

export default connect(mapStateToProps)(dialog)
