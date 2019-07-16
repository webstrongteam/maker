import React from "react";
import {View} from 'react-native';
import Dialog from "react-native-dialog";

import {connect} from 'react-redux';

const dialog = (props) => (
    <Dialog.Container
        contentStyle={{backgroundColor: props.theme.secondaryBackgroundColor}}
        visible={props.showModal}>
        <Dialog.Title
            style={{color: props.theme.textColor}}>
            {props.title}
        </Dialog.Title>

        {props.description ?
            <Dialog.Description
                style={{color: props.theme.textColor}}>
                {props.description}
            </Dialog.Description> :
            <View>
                {props.children}
            </View>
        }

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

export default connect(mapStateToProps)(dialog);