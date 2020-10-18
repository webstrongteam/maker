import { StyleSheet } from 'react-native'

export default StyleSheet.create({
	container: {
		width: '100%',
		flex: 1,
		paddingLeft: 25,
		paddingRight: 25,
		alignItems: 'center',
		justifyContent: 'center',
	},
	primaryText: {
		fontSize: 15,
		textAlign: 'center',
		paddingTop: 10,
		paddingBottom: 10,
	},
	secondaryText: {
		fontSize: 13,
		textAlign: 'center',
		paddingTop: 20,
		paddingBottom: 5,
	},
	copy: {
		textAlign: 'center',
		paddingTop: 10,
		paddingBottom: 10,
		opacity: 0.5,
		fontSize: 10,
	},
	logo: {
		height: 150,
		width: 150,
		borderRadius: 65,
		marginTop: 10,
		marginBottom: 10,
		alignSelf: 'center',
	},
	github: {
		height: 125,
		width: 125,
		opacity: 0.5,
		borderRadius: 65,
		marginTop: 10,
		marginBottom: 10,
		alignSelf: 'center',
		borderWidth: 2,
	},
})
