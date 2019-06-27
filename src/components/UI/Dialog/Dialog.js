import React from "react";
import Dialog from "react-native-dialog";

const dialog = (props) => (
    <Dialog.Container visible={props.showModal}>
        <Dialog.Title>{props.title}</Dialog.Title>
        <Dialog.Description>{props.description}</Dialog.Description>
        {props.buttons.map(button => (
            <Dialog.Button
                key={button.label}
                label={button.label}
                onPress={button.onPress}
            />
        ))}
    </Dialog.Container>
);

export default dialog;