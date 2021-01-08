import { StyleSheet, Platform } from 'react-native'

export default StyleSheet.create({
	dialogContainer: {
		borderRadius: 5,
		paddingTop: 20,
		marginTop: -40,
		paddingLeft: 20,
		marginLeft: -20,
		paddingRight: 20,
		marginRight: -20,
		paddingBottom: 20,
		marginBottom: Platform.OS === 'ios' ? 0 : -20,
	},
	dialogTitle: {
		marginBottom: 15,
	},
	dialogDescription: {
		marginLeft: 15,
		marginRight: 15,
		marginBottom: 10,
		textAlign: 'left',
	},
	dialogButtons: {
		marginTop: 15,
		marginBottom: Platform.OS === 'ios' ? -5 : 0,
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
})
