import React from "react";
import {View} from 'react-native';
import Dialog from "react-native-dialog";
import {ListItem} from "react-native-material-ui";

import {connect} from 'react-redux';

const dialog = (props) => {
    if (props.select) {
        return select(props);
    } else {
        return defaultDialog(props);
    }
};

const defaultDialog = (props) => (
    <Dialog.Container
        contentStyle={{backgroundColor: props.theme.secondaryBackgroundColor}}
        visible={props.showModal}>
        {props.title &&
        <Dialog.Title
            style={{color: props.theme.textColor}}>
            {props.title}
        </Dialog.Title>
        }

        {props.body ?
            <Dialog.Description
                style={{color: props.theme.textColor}}>
                {props.body}
            </Dialog.Description> :
            <View>
                {props.children ? props.children : null}
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

const select = (props) => (
    <Dialog.Container
        contentStyle={{backgroundColor: props.theme.secondaryBackgroundColor}}
        visible={props.showModal}>
        <Dialog.Title
            style={{color: props.theme.textColor}}>
            {props.title}
        </Dialog.Title>

        <View style={{marginBottom: 10}}>
            {props.body.map((option, index) => (
                <ListItem
                    divider
                    dense
                    key={index}
                    onPress={() => option.onClick(option.value)}
                    style={{
                        contentViewContainer: {
                            backgroundColor: '#fff'
                        },
                        primaryText: {
                            color: option.value === props.selectedValue ?
                                props.theme.primaryColor : props.theme.textColor
                        },
                        ...option.style
                    }}
                    centerElement={{
                        primaryText: option.name
                    }}
                />
            ))}
        </View>

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