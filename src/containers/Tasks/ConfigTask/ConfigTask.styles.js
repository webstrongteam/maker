import { StyleSheet } from 'react-native'

export default StyleSheet.create({
	container: {
		paddingLeft: 20,
		paddingRight: 20,
		paddingBottom: 20,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	datePicker: {
		marginRight: 5,
		borderBottomWidth: 0.5,
		borderLeftWidth: 0,
		borderRightWidth: 0,
		borderTopWidth: 0,
		width: '85%',
		justifyContent: 'center',
	},
	category: {
		flex: 1,
		borderWidth: 0,
	},
	select: {
		width: '100%',
		height: 50,
		borderWidth: 0,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	selectedOption: {
		marginLeft: 10,
	},
})
