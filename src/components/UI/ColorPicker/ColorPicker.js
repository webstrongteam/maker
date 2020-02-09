import React from "react";
import {ColorPicker} from 'react-native-color-picker'
import Dialog from "react-native-dialog";

const colorPicker = (props) => (
    <Dialog.Container visible={props.show}>
        <Dialog.Title>{props.title}</Dialog.Title>
        <ColorPicker
            defaultColor={props.defaultColor}
            onColorChange={color => props.changeColor(color)}
        />
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