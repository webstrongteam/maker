import React from "react";
import Dialog from "react-native-dialog";

const dialog = (props) => (
    <Dialog.Container visible={props.showModal}>
        <Dialog.Title>{props.title}</Dialog.Title>
        <Dialog.Description>{props.description}</Dialog.Description>
        {Object.keys(props.buttons).map(button => (
            <Dialog.Button
                key={button}
                label={props.buttons[button].label}
                onPress={props.buttons[button].onPress}
            />
        ))}
    </Dialog.Container>
);

export default dialog;