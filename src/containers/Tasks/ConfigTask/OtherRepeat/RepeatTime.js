import React, {Component} from 'react';
import {Platform, ScrollView, TouchableOpacity, View} from "react-native";
import Input from "../../../../components/UI/Input/Input";
import {Button, ListItem} from "react-native-material-ui";

import {connect} from "react-redux";

class RepeatTime extends Component {
    state = {
        control: {
            label: this.props.translations.valueLabel,
            number: true,
            positiveNumber: true,
            required: true,
            characterRestriction: 4,
            keyboardType: 'number-pad'
        },
        repeat: '',
        selectedTime: '2',
        repeatTimes: ['minutes', 'hours', 'days', 'weeks', 'months', 'years']
    };

    componentDidMount() {
        if (!this.props.selectedTime) {
            if (this.props.usingTime) {
                this.setState({selectedTime: '0'});
            } else {
                this.setState({selectedTime: '2'});
            }
        } else {
            this.setState({selectedTime: this.props.selectedTime});
        }
        if (+this.props.selectedTime !== 6) {
            this.setState({repeat: this.props.repeat});
        }
    }

    render() {
        const {control, repeat, selectedTime, repeatTimes} = this.state;
        const {usingTime, theme, translations} = this.props;

        return (
            <View style={{flex: 1}}>
                <ScrollView>
                    <Input
                        elementConfig={control}
                        focus={false}
                        value={repeat}
                        changed={(val, control) => {
                            this.setState({control, repeat: val});
                        }}
                    />

                    <View style={{marginTop: 10, color: theme.primaryTextColor}}>
                        {repeatTimes.map((time, index) => {
                            if (!usingTime && (time === 'hours' || time === 'minutes')) return null;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => this.setState({selectedTime: index + ''})}>
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
                    <View style={{
                        flex: 2,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        margin: 50
                    }}>
                        <Button raised icon="done" text={translations.save}
                                onPress={() => {
                                    const {control, repeat, selectedTime} = this.state;
                                    if (!control.error) {
                                        this.props.save(repeat, selectedTime);
                                    }
                                }}
                                style={{
                                    container: {backgroundColor: theme.doneIconColor},
                                    text: {color: theme.primaryTextColor}
                                }}
                        />
                        <Button raised icon="clear" text={translations.cancel}
                                onPress={this.props.close}
                                style={{
                                    container: {backgroundColor: theme.warningColor},
                                    text: {color: theme.primaryTextColor}
                                }}
                        />
                    </View>
                </ScrollView>
            </View>
        )
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

export default connect(mapStateToProps)(RepeatTime);