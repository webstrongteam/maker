import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { ListItem } from 'react-native-material-ui'
import Dialog from 'react-native-dialog'
import Input from '../Input/Input'
import styles from './Dialog.styles'

const GetDialog = (props) => {
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
	<Dialog.Container onBackdropPress={props.cancelHandler} visible={props.showDialog}>
		<View
			style={{ ...styles.dialogContainer, backgroundColor: props.theme.primaryBackgroundColor }}
		>
			<View style={styles.dialogTitle}>
				{props.title && (
					<Dialog.Title style={{ textAlign: 'center', color: props.theme.secondaryTextColor }}>
						{props.title}
					</Dialog.Title>
				)}
			</View>

			{props.body ? (
				<Dialog.Description
					style={{ ...styles.dialogDescription, color: props.theme.thirdTextColor }}
				>
					{props.body}
				</Dialog.Description>
			) : (
				<View>{props.children ? props.children : null}</View>
			)}

			<View style={styles.dialogButtons}>
				{props.buttons &&
					props.buttons.map((button) => (
						<Dialog.Button key={button.label} label={button.label} onPress={button.onPress} />
					))}
			</View>
		</View>
	</Dialog.Container>
)

const selectDialog = (props) => (
	<Dialog.Container onBackdropPress={props.cancelHandler} visible={props.showDialog}>
		<View
			style={{ ...styles.dialogContainer, backgroundColor: props.theme.primaryBackgroundColor }}
		>
			<View style={styles.dialogTitle}>
				{props.title && (
					<Dialog.Title style={{ color: props.theme.thirdTextColor, textAlign: 'center' }}>
						{props.title}
					</Dialog.Title>
				)}
			</View>

			{props.body && (
				<View>
					{props.body.map((option, index) => (
						<TouchableOpacity key={index} onPress={() => option.onClick(option.value)}>
							<ListItem
								divider
								dense
								style={{
									contentViewContainer: {
										backgroundColor: props.theme.primaryBackgroundColor,
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

			<View style={styles.dialogButtons}>
				{props.buttons &&
					props.buttons.map((button) => (
						<Dialog.Button key={button.label} label={button.label} onPress={button.onPress} />
					))}
			</View>
		</View>
	</Dialog.Container>
)

const inputDialog = (props) => (
	<Dialog.Container onBackdropPress={props.cancelHandler} visible={props.showDialog}>
		<View
			style={{ ...styles.dialogContainer, backgroundColor: props.theme.primaryBackgroundColor }}
		>
			<View style={styles.dialogTitle}>
				{props.title && (
					<Dialog.Title style={{ textAlign: 'center', color: props.theme.thirdTextColor }}>
						{props.title}
					</Dialog.Title>
				)}
			</View>

			{props.body && (
				<Input
					elementConfig={props.body.elementConfig ? props.body.elementConfig : null}
					focus={props.body.focus}
					value={props.body.value}
					changed={props.body.onChange}
				/>
			)}

			<View style={styles.dialogButtons}>
				{props.buttons &&
					props.buttons.map((button) => (
						<Dialog.Button key={button.label} label={button.label} onPress={button.onPress} />
					))}
			</View>
		</View>
	</Dialog.Container>
)

export default GetDialog
