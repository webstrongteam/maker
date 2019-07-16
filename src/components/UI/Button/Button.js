import React from 'react';
import {Button, StyleSheet, View} from 'react-native';

const button = (props) => (
    <View style={styles.Button}>
        <Button
            color={props.color}
            disabled={props.disabled}
            title={props.title}
            onPress={props.clicked}/>
    </View>
);

const styles = StyleSheet.create({
    Button: {
        paddingTop: 30,
        paddingLeft: 100,
        paddingRight: 100
    }
});

export default button;