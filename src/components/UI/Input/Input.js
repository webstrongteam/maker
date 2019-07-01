import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextField } from 'react-native-material-textfield';

const input = (props) => {
    const inputClasses = [classes.InputElement];

    const inputElement = <TextField
        {...props.elementConfig}
        style={props.style ? props.style : inputClasses}
        tintColor={props.color}
        autoFocus={props.focus ? props.focus : false}
        onChangeText={props.changed}
        value={props.value}
    />;

    return (
        <View style={classes.container}>
            <View style={classes.inputContainer}>
                {inputElement}
            </View>
        </View>
    );
};

const classes = StyleSheet.create({
    container: {
        paddingLeft: 20,
        paddingRight: 20,
        display: 'flex',
        alignItems: "center",
        justifyContent: "center"
    },
    inputContainer: {
        width: "100%",
    },
    InputElement: {
        width: "100%"
    },
    Invalid: {
        borderColor: '#944317',
        backgroundColor: 'salmon'
    },
    Error: {
        fontWeight: 'bold',
        color: '#944317'
    }
});

export default input;