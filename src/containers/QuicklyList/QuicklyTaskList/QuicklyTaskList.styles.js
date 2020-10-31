import { StyleSheet } from 'react-native'

export default StyleSheet.create({
	taskName: {
		marginLeft: 15,
		fontSize: 16,
		color: '#000',
	},
	taskIconContainer: {
		marginRight: 15,
	},
	taskNameWrapper: {
		width: '80%',
		marginTop: 5,
		marginBottom: 5,
	},
	inputWrapper: {
		marginRight: 30,
		marginBottom: 15,
		bottom: 10,
		flexDirection: 'row',
		alignItems: 'center',
	},
	listContainer: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	spinnerWrapper: {
		marginTop: 10,
	},
	quicklyTaskListWrapper: {
		flex: 1,
		justifyContent: 'space-between',
	},
	quicklyTaskList: {
		paddingTop: 5,
	},
	addIcon: {
		marginLeft: -20,
	},
})
