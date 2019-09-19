import React from "react";
import Dialog from "react-native-dialog";

import {connect} from 'react-redux';
import Input from "../Input/Input";

const inputDialog = (props) => (
    <Dialog.Container
        contentStyle={{backgroundColor: props.theme.secondaryBackgroundColor}}
        visible={props.showModal}>
        <Dialog.Title
            style={{color: props.theme.textColor}}>
            {props.title}
        </Dialog.Title>

        <Input
            focus={props.focus}
            value={props.value}
            changed={props.onChange}
        />

        {props.buttons.map(button => (
            <Dialog.Button
                key={button.label}
                label={button.label}
                onPress={button.onPress}
            />
        ))}
    </Dialog.Container>
);

const mapStateToProps = state => {
    return {theme: state.theme.theme}
};

export default connect(mapStateToProps)(inputDialog);