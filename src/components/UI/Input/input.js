import React from 'react';
import { StyleSheet, View, TextInput, Text, Picker } from 'react-native';

const input = (props) => {
    let inputElement = null;
    let validationError = null;
    const inputClasses = [classes.InputElement];

    if (props.invalid && props.shouldValidate && props.touched) {
        validationError = (
            <Text style={classes.Error}>
                Please enter a valid {props.valueName}!
            </Text>
        );
    }

    switch (props.elementType) {
        case ('input'):
            inputElement = <TextInput
                style={inputClasses}
                {...props.elementConfig}
                onChangeText={props.changed}
                value={props.value} />;
            break;
        case ('textarea'):
            inputElement = <TextInput
                style={inputClasses}
                multiline={true}
                numberOfLines={4}
                {...props.elementConfig}
                onChangeText={props.changed}
                value={props.value} />;
            break;
        case ('select'):
            inputElement = (
                <Picker
                    selectedValue={props.value}
                    style={inputClasses}
                    onValueChange={props.changed}>
                    {props.elementConfig.options.map(option =>(
                        <Picker.Item key={option.value} label={option.value} value={option.value}>
                            {option.displayValue}
                        </Picker.Item>
                    ))}
                </Picker>
            );
            break;
        default:
            inputElement = <TextInput
                style={inputClasses}
                {...props.elementConfig}
                onChangeText={props.changed}
                value={props.value} />;
    }

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