export default StyleSheet.create({    container: {

        dropdown: {
        width: 230,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        alignSelf: 'flex-start'
    },
    dropdownButton: {
        width: 230,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    dropdownButtonIcon: {
        marginVertical: 10,
        marginHorizontal: 6,
        textAlignVertical: 'center'
    },
    dropdownText: {
        marginVertical: 10,
        marginHorizontal: 6,
        fontSize: 18,
        textAlign: 'left',
        textAlignVertical: 'center',
    },
    dropdownDropdown: {
        marginTop: Platform.OS === 'ios' ? 5 : -20,
        justifyContent: 'flex-start',
        width: 230,
        height: 'auto',
        maxHeight: 425,
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
        marginLeft: 4,
        width: 30,
        height: 30,
        textAlignVertical: 'center',
    },
    dropdownRowText: {
        marginHorizontal: 4,
        fontSize: 17,
        textAlignVertical: 'center',
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3
    },
    rightElements: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
});
