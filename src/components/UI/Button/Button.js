import React from 'react';
import {Button, View} from 'react-native';
import styles from './Button.styles';

const button = (props) => (
    <View style={styles.button}>
        <Button
            color={props.color}
            disabled={props.disabled}
            title={props.title}
            onPress={props.clicked}/>
    </View>
);

export default button;