import { Dimensions, Platform, StyleSheet } from 'react-native'

const { width } = Dimensions.get('window')

export default StyleSheet.create({
	dropdown: {
		width: 230,
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		alignSelf: 'flex-start',
	},
	dropdownButton: {
		width: 230,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	dropdownButtonIcon: {
		marginVertical: 10,
		marginHorizontal: 6,
		textAlignVertical: 'center',
	},
	dropdownText: {
		marginVertical: 10,
		marginHorizontal: 6,
		fontSize: 18,
		textAlign: 'left',
		textAlignVertical: 'center',
	},
	dropdownDropdown: {
		backgroundColor: 'red',
		marginTop: Platform.OS === 'ios' ? 5 : -32,
		justifyContent: 'flex-start',
		width: 230,
		height: 'auto',
		maxHeight: width - 90,
		borderWidth: 2,
		borderRadius: 3,
	},
	dropdownRow: {
		flexDirection: 'row',
		height: 45,
		width: '100%',
		alignItems: 'center',
	},
	dropdownIcon: {
		marginTop: Platform.OS === 'ios' ? 6 : 2,
		marginLeft: 5,
		width: 30,
		height: 30,
		textAlignVertical: 'center',
	},
	dropdownRowText: {
		marginHorizontal: 4,
		fontSize: 17,
		textAlignVertical: 'center',
	},
	rightElements: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	taskRow: {
		marginLeft: 15,
		marginRight: 15,
		marginBottom: 15,
	},
	taskRowLeftElement: {
		marginLeft: -20,
		width: 15,
		height: '100%',
	},
	taskName: {
		margin: 2,
		fontSize: 17,
	},
	taskDate: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	footerMargin: {
		marginBottom: 56,
	},
})
