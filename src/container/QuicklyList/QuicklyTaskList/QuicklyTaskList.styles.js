import {StyleSheet} from "react-native";

export default StyleSheet.create({
    taskContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    taskRow: {
        backgroundColor: "#fff",
        marginTop: 10,
        marginLeft: 10,
        marginRight: 10,
        height: 50
    },
    taskName: {
        marginLeft: 15,
        fontSize: 18,
        color: "#000"
    },
    taskIconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15
    }
});
