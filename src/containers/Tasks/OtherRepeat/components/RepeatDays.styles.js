import { StyleSheet } from 'react-native'

export default StyleSheet.create({
	title: {
		margin: 40,
		fontSize: 21,
		textAlign: 'center',
	},
	repeatTimesWrapper: {
		flex: 1,
		marginTop: 20,
		flexDirection: 'row',
		justifyContent: 'center',
		flexWrap: 'wrap',
	},
	buttons: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		margin: 50,
	},
})
