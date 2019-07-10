import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextField } from 'react-native-material-textfield';
import {fullWidth} from '../../../shared/styles';

import { connect } from 'react-redux';

const input = (props) => {
    const inputElement = <TextField
        {...props.elementConfig}
        style={props.style ? props.style : fullWidth}
        textColor={props.theme.textColor}
        baseColor={props.theme.textColor}
        tintColor={props.theme.primaryColor}
        autoFocus={props.focus ? props.focus : false}
        onChangeText={props.changed}
        value={props.value}
    />;

    return (
        <View style={styles.container}>
            <View style={fullWidth}>
                {inputElement}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingLeft: 20,
        paddingRight: 20,
        display: 'flex',
        alignItems: "center",
        justifyContent: "center"
    }
});

const mapStateToProps = state => {
    return {theme: state.theme.theme}
};

export default connect(mapStateToProps)(input);