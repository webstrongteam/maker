import React, {Component} from "react";
import {View} from 'react-native';
import {ListItem} from "react-native-material-ui";
import Dialog from '../../../../components/UI/Dialog/Dialog';
import Input from '../../../../components/UI/Input/Input';
import {generateDialogObject, valid} from "../../../../shared/utility";

import {connect} from "react-redux";

class OtherRepeat extends Component {
    state = {
        controls: {
            value: {
                label: this.props.translations.valueLabel,
                number: true,
                positiveNumber: true,
                required: true,
                characterRestriction: 4,
            }
        },
        repeatTimes: ['days', 'week', 'month', 'year'],
        dialog: null,
        loading: true
    };

    componentDidMount() {
        this.showDialog();
    }

    checkValid = (name, save = false, value = this.props.repeat) => {
        const {translations} = this.props;
        const controls = this.state.controls;
        valid(controls, value, name, translations, (newControls) => {
            this.props.onSetRepeat(value);
            if (save && !newControls[name].error) {
                this.props.save();
            }
            this.setState({controls: newControls});
        })
    };

    showDialog = () => {
        const dialog = generateDialogObject(
            this.props.translations.dialogTitle,
            false,
            {
                Save: () => {
                    this.checkValid('value', true);
                },
                Cancel: () => this.props.cancel()
            }
        );
        this.setState({loading: false, dialog});
    };

    render() {
        const {loading, dialog, repeatTimes, controls} = this.state;
        const {showModal, repeat, selectedTime, theme, translations} = this.props;

        return (
            <React.Fragment>
                {!loading &&
                <Dialog
                    showModal={showModal}
                    title={dialog.title}
                    buttons={dialog.buttons}
                >
                    <Input
                        elementConfig={controls.value}
                        focus={true}
                        value={repeat}
                        changed={value => this.checkValid('value', false, value)}
                    />

                    <View style={{marginBottom: 10, color: theme.textColor}}>
                        {repeatTimes.map((time, index) => (
                            <ListItem
                                divider
                                dense
                                onPress={() => this.props.onSelectTime(index + '')}
                                style={{
                                    contentViewContainer: {
                                        backgroundColor: '#fff'
                                    },
                                    primaryText: {
                                        color: index + '' === selectedTime ?
                                            theme.primaryColor : theme.textColor
                                    }
                                }}
                                centerElement={{
                                    primaryText: translations[time]
                                }}
                            />
                        ))}
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
            ...state.settings.translations.validation
        }
    }
};

export default connect(mapStateToProps)(OtherRepeat);