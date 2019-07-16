import React from "react";
import {View} from 'react-native';
import {ColorPicker} from 'react-native-color-picker'
import Dialog from "react-native-dialog";

const colorPicker = (props) => (
    <Dialog.Container visible={props.show}>
        <Dialog.Title>{props.title}</Dialog.Title>
        <View style={{flex: 1}}>
            <ColorPicker
                defaultColor={props.defaultColor}
                onColorChange={color => props.changeColor(color)}
                style={{flex: 1}}
            />
        </View>
        <Dialog.Button
            label="Save"
            onPress={props.save}
        />
        <Dialog.Button
            label="Cancel"
            onPress={props.cancel}
        />
    </Dialog.Container>
);

export default colorPicker;