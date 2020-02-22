import React, {Component} from "react";
import {Platform, TouchableOpacity, View} from 'react-native';
import {ListItem} from "react-native-material-ui";
import Dialog from '../../../../components/UI/Dialog/Dialog';
import Input from '../../../../components/UI/Input/Input';
import {generateDialogObject} from "../../../../shared/utility";

import {connect} from "react-redux";

class OtherRepeat extends Component {
    state = {
        control: {
            label: this.props.translations.valueLabel,
            number: true,
            positiveNumber: true,
            required: true,
            characterRestriction: 4,
            keyboardType: 'number-pad'
        },
        repeatTimes: ['minutes', 'hours', 'days', 'week', 'month', 'year'],
        dialog: null
    };

    componentDidMount() {
        this.showDialog();
    }

    showDialog = () => {
        const {translations} = this.props;
        const dialog = generateDialogObject(
            translations.dialogTitle,
            null,
            {
                [translations.save]: () => {
                    if (!this.state.control.error) {
                        this.props.save()
                    }
                },
                [translations.cancel]: () => this.props.cancel()
            }
        );
        this.setState({dialog});
    };

    render() {
        const {dialog, repeatTimes, control} = this.state;
        const {showModal, usingTime, repeat, selectedTime, theme, translations} = this.props;

        return (
            <React.Fragment>
                {dialog &&
                <Dialog
                    showModal={showModal}
                    title={dialog.title}
                    buttons={dialog.buttons}
                >
                    <Input
                        elementConfig={control}
                        focus={true}
                        value={repeat}
                        changed={(val, control) => {
                            this.setState({control});
                            this.props.onSetRepeat(val);
                        }}
                    />

                    <View style={{marginBottom: 10, color: theme.primaryTextColor}}>
                        {repeatTimes.map((time, index) => {
                            if (!usingTime && (time === 'hours' || time === 'minutes')) return null;
                            return (
                                <TouchableOpacity key={index} onPress={() => this.props.onSelectTime(index + '')}>
                                    <ListItem
                                        divider
                                        dense
                                        style={{
                                            contentViewContainer: {
                                                backgroundColor: Platform.OS === 'ios' ?
                                                    theme.secondaryBackgroundColor : 'transparent'
                                            },
                                            primaryText: {
                                                color: index + '' === selectedTime + '' ?
                                                    theme.primaryColor : theme.thirdTextColor
                                            }
                                        }}
                                        centerElement={{
                                            primaryText: translations[time]
                                        }}
                                    />
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </Dialog>
                }
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        translations: {
            ...state.settings.translations.OtherRepeat,
            ...state.settings.translations.common
        }
    }
};

export default connect(mapStateToProps)(OtherRepeat);