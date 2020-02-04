import React from 'react';
import {Button, StyleSheet, View} from 'react-native';
import styles from './Button.styles';

const button = (props) => (
    <View style={styles.Button}>
        <Button
            color={props.color}
            disabled={props.disabled}
            title={props.title}
            onPress={props.clicked}/>
    </View>
);

export default button;