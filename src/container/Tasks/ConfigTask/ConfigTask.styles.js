import {StyleSheet} from "react-native";

export default StyleSheet.create({
    container: {
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 20,
        display: 'flex',
        alignItems: "center",
        justifyContent: "center"
    },
    datePicker: {
        marginRight: 5,
        marginLeft: 5,
        borderBottomWidth: 0.5,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderTopWidth: 0
    },
    category: {
        flex: 1,
        borderWidth: 0
    },
    selectCategory: {
        height: 50,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    select: {
        width: '100%',
        height: 50,
        borderWidth: 0
    },
    selectedOption: {
        marginLeft: 10
    }
});