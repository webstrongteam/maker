import React from 'react';
import { StyleSheet, Button, View } from 'react-native';

const button = (props) => (
    <View style={classes.Button}>
        <Button
            color={props.color}
            disabled={props.disabled}
            title={props.title}
            onPress={props.clicked} />
    </View>
);

const classes = StyleSheet.create({
   Button: {
        paddingTop: 30,
       paddingLeft: 100,
       paddingRight: 100
   }
});

export default button;