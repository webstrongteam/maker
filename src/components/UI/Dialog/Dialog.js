import React from "react";
import {Platform, TouchableWithoutFeedback, View, Keyboard} from 'react-native';
import Dialog from "react-native-dialog";
import {ListItem} from "react-native-material-ui";
import Input from "../Input/Input";

import {connect} from 'react-redux';

const dialog = (props) => {
    if (props.select) {
        return selectDialog(props);
    } else if (props.input) {
        return inputDialog(props);
    } else {
        return defaultDialog(props);
    }
};

const defaultDialog = (props) => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Dialog.Container
            contentStyle={{backgroundColor: props.theme.secondaryBackgroundColor}}
            visible={props.showModal}>
            {props.title &&
            <Dialog.Title
                style={{color: props.theme.thirdTextColor}}>
                {props.title}
            </Dialog.Title>
            }

        {props.body ?
            <Dialog.Description
                style={{color: props.theme.thirdTextColor}}>
                {props.body}
            </Dialog.Description> :
            <View>
                {props.children ? props.children : null}
            </View>
        }

            {props.buttons &&
            props.buttons.map(button => (
                <Dialog.Button
                    key={button.label}
                    label={button.label}
                    onPress={button.onPress}
                />
            ))
            }
        </Dialog.Container>
    </TouchableWithoutFeedback>
);

const selectDialog = (props) => (
    <Dialog.Container
        contentStyle={{backgroundColor: props.theme.secondaryBackgroundColor}}
        visible={props.showModal}>
        {props.title &&
        <Dialog.Title
            style={{color: props.theme.thirdTextColor}}>
            {props.title}
        </Dialog.Title>
        }

        {props.body &&
        <View style={{marginBottom: 10}}>
            {props.body.map((option, index) => (
                <ListItem
                    divider
                    dense
                    key={index}
                    onPress={() => option.onClick(option.value)}
                    style={{
                        contentViewContainer: {
                            backgroundColor: Platform.OS === 'ios' ? '#fff' : 'transparent'
                        },
                        primaryText: {
                            color: option.value === props.selectedValue ?
                                props.theme.primaryColor : props.theme.thirdTextColor
                        },
                        ...option.style
                    }}
                    centerElement={{
                        primaryText: option.name
                    }}
                />
            ))}
        </View>
        }

        {props.buttons &&
        props.buttons.map(button => (
            <Dialog.Button
                key={button.label}
                label={button.label}
                onPress={button.onPress}
            />
        ))
        }
    </Dialog.Container>
);

const inputDialog = (props) => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Dialog.Container
            contentStyle={{backgroundColor: props.theme.secondaryBackgroundColor}}
            visible={props.showModal}>
            {props.title &&
            <Dialog.Title
                style={{color: props.theme.thirdTextColor}}>
                {props.title}
            </Dialog.Title>
            }

            {props.body &&
            <Input
                elementConfig={props.body.elementConfig ? props.body.elementConfig : null}
                focus={props.body.focus}
                value={props.body.value}
                changed={props.body.onChange}
            />
            }

            {props.buttons &&
            props.buttons.map(button => (
                <Dialog.Button
                    key={button.label}
                    label={button.label}
                    onPress={button.onPress}
                />
            ))
            }
        </Dialog.Container>
    </TouchableWithoutFeedback>
);

const mapStateToProps = state => {
    return {theme: state.theme.theme}
};

export default connect(mapStateToProps)(dialog);