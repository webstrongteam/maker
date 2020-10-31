import { StyleSheet } from 'react-native'

export default StyleSheet.create({
	colorPreview: {
		marginTop: 10,
		marginRight: 10,
		width: 50,
		height: 50,
		borderStyle: 'dashed',
		borderRadius: 30,
		borderWidth: 0.75,
	},
	rightElement: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	spinnerWrapper: {
		marginTop: 10,
		marginRight: 40,
	},
	modalContent: {
		flex: 1,
		padding: 45,
	},
	colorWheel: {
		flex: 5,
	},
	colorWheelButtons: {
		flex: 2,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	headerStyle: {
		marginTop: -5,
	},
})
