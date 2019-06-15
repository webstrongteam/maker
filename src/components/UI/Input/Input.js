import React from 'react';
import { StyleSheet, View, TextInput, Text } from 'react-native';

const input = (props) => {
    let validationError = null;
    const inputClasses = [classes.InputElement];

    if (props.invalid && props.shouldValidate) {
        validationError = (
            <Text style={classes.Error}>
                Please enter a valid {props.valueName}!
            </Text>
        );
    }

    const inputElement = <TextInput
        {...props.elementConfig}
        style={inputClasses}
        autoFocus={props.focus ? props.focus : false}
        onChangeText={props.changed}
        value={props.value}
    />;

    return (
        <View style={classes.container}>
            <View style={classes.inputContainer}>
                {validationError}
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
        backgroundColor: '#fff',
        alignItems: "center",
        justifyContent: "center"
    },
    inputContainer: {
        marginTop: 20,
        width: "100%",
    },
    InputElement: {
        width: "100%",
        padding: 10,
        borderWidth: 0.5,
        borderColor: '#ddd',
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