import React, {Component} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from "react-native";
import {Avatar, Button} from "react-native-material-ui";

import {connect} from "react-redux";

class RepeatDays extends Component {
    state = {
        repeat: '',
        selectedTime: '6',
        repeatTimes: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    };

    componentDidMount() {
        if (this.props.selectedTime + '' === '6') {
            this.setState({repeat: this.props.repeat + ''})
        }
    }

    checkDay = (index) => {
        const {repeat} = this.state;

        if (repeat.includes(index + '')) {
            this.setState({repeat: repeat.replace(index + '', '')})
        } else {
            this.setState({repeat: repeat + index});
        }
    };

    render() {
        const {repeat, repeatTimes} = this.state;
        const {theme, translations} = this.props;

        return (
            <View style={{flex: 1}}>
                <ScrollView>
                    <Text style={{
                        margin: 40,
                        color: theme.thirdTextColor,
                        fontSize: 21, textAlign: 'center'
                    }}>
                        {translations.repeatDaysTitle}
                    </Text>
                    <View style={{
                        flex: 1,
                        marginTop: 20,
                        flexDirection: 'row',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        color: theme.primaryTextColor
                    }}>
                        {repeatTimes.map((day, index) => {
                            return (
                                <TouchableOpacity key={index} onPress={() => this.checkDay(index)}>
                                    <Avatar
                                        size={82}
                                        style={{
                                            container: {
                                                margin: 5,
                                                backgroundColor: repeat.includes(index + '') ? theme.primaryColor : theme.thirdTextColor
                                            },
                                            content: {fontSize: 26}
                                        }}
                                        text={translations[day]}/>
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
                                    const {repeat, selectedTime} = this.state;
                                    if (repeat.length) {
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
            ...state.settings.translations.OtherDays,
            ...state.settings.translations.common
        }
    }
};

export default connect(mapStateToProps)(RepeatDays);