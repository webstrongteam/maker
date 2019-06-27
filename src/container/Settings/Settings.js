import React, {Component} from 'react';
import {Toolbar, Icon} from 'react-native-material-ui';
import Template from '../Template/Template';
import SettingsList from 'react-native-settings-list';
import {View, StyleSheet, ActivityIndicator, Text} from 'react-native';

import { connect } from 'react-redux';
import * as actions from "../../store/actions";

class Themes extends Component {
    state = {
        loading: true,
        showDialog: false
    };

    componentDidMount() {
        this.props.onInitSettings();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.settings !== prevProps.settings && this.props.settings.id === 0) {
            this.setState({ loading: false });
        }
    }

    convertBoolean = (boolean) => {
        return !!boolean;
    };

    toggleSetting = (value, name) => {
        if (value) value = 1;
        else value = 0;
        this.props['onChange'+name](value, name);
    };

    showDialog = (option) => {
        if (option === 'firstDayOfWeek') {
            // Maybe dropdown?
        }
    };

    render() {
        const { loading } = this.state;
        const { navigation, settings, theme } = this.props;

        return (
            <Template bgColor={theme.secondaryBackgroundColor}>
                <Toolbar
                    leftElement="arrow-back"
                    onLeftElementPress={() => {
                        navigation.goBack();
                    }}
                    centerElement='Settings'
                />

                {!loading ?
                    <SettingsList borderColor='#d6d5d9' defaultItemSize={50}>
                        <SettingsList.Item
                            hasNavArrow={false}
                            title='General'
                            titleStyle={{color: '#009688', fontWeight: '500'}}
                            itemWidth={50}
                            borderHide={'Both'}
                        />
                        <SettingsList.Item
                            icon={
                                <View style={styles.iconStyle}>
                                    <Icon color={theme.textColor} style={{alignSelf: 'center'}} name="alarm"/>
                                </View>
                            }
                            hasNavArrow={false}
                            itemWidth={70}
                            hasSwitch={true}
                            switchState={this.convertBoolean(settings.timeFormat)}
                            switchOnValueChange={(value) => this.toggleSetting(value, 'TimeFormat')}
                            titleStyle={{color: theme.textColor, fontSize: 16}}
                            title='24H time cycle'
                        />
                        <SettingsList.Item
                            icon={
                                <View style={styles.iconStyle}>
                                    <Icon color={theme.textColor} style={{alignSelf: 'center'}} name="event"/>
                                </View>
                            }
                            hasNavArrow={true}
                            itemWidth={70}
                            hasSwitch={false}
                            titleInfo={settings.firstDayOfWeek}
                            onPress={this.showDialog('firstDayOfWeek')}
                            titleStyle={{color: theme.textColor, fontSize: 16}}
                            title='First day of week'
                        />
                        <SettingsList.Item
                            icon={
                                <View style={styles.iconStyle}>
                                    <Icon color={theme.textColor} style={{alignSelf: 'center'}} name="done"/>
                                </View>
                            }
                            hasNavArrow={false}
                            itemWidth={70}
                            hasSwitch={true}
                            switchState={this.convertBoolean(settings.confirmFinishingTask)}
                            switchOnValueChange={(value) => this.toggleSetting(value, 'ConfirmFinishingTask')}
                            titleStyle={{color: theme.textColor, fontSize: 16}}
                            title='Confirm finishing task'
                        />
                        <SettingsList.Item
                            icon={
                                <View style={styles.iconStyle}>
                                    <Icon color={theme.textColor} style={{alignSelf: 'center'}} name="autorenew"/>
                                </View>
                            }
                            hasNavArrow={false}
                            itemWidth={70}
                            hasSwitch={true}
                            switchState={this.convertBoolean(settings.confirmRepeatingTask)}
                            switchOnValueChange={(value) => this.toggleSetting(value, 'ConfirmRepeatingTask')}
                            titleStyle={{color: theme.textColor, fontSize: 16}}
                            title='Confirm repeating task'
                        />
                        <SettingsList.Item
                            icon={
                                <View style={styles.iconStyle}>
                                    <Icon color={theme.textColor} style={{alignSelf: 'center'}} name="delete"/>
                                </View>
                            }
                            hasNavArrow={false}
                            itemWidth={70}
                            hasSwitch={true}
                            switchState={this.convertBoolean(settings.confirmDeletingTask)}
                            switchOnValueChange={(value) => this.toggleSetting(value, 'ConfirmDeletingTask')}
                            titleStyle={{color: theme.textColor, fontSize: 16}}
                            title='Confirm deleting task'
                        />
                    </SettingsList> :
                    <View style={[styles.container, styles.horizontal]}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                }
                <View style={styles.version}>
                    <Text style={{color: theme.textColor}}>Version: {settings.version}</Text>
                </View>
            </Template>
        );
    }
}

const styles = StyleSheet.create({
    iconStyle: {
        marginLeft:15,
        marginRight:5,
        alignSelf:'center',
        justifyContent:'center'
    },
    container: {
        flex: 1,
        alignItems: 'center'
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 50
    },
    version: {
        marginLeft: 'auto',
        marginRight: 'auto',
        opacity: 0.35
    }
});

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        settings: state.settings
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onInitSettings: () => dispatch(actions.initSettings()),
        onChangeFirstDayOfWeek: (value) => dispatch(actions.changeFirstDayOfWeek(value)),
        onChangeTimeFormat: (value) => dispatch(actions.changeTimeFormat(value)),
        onChangeConfirmRepeatingTask: (value) => dispatch(actions.changeConfirmRepeatingTask(value)),
        onChangeConfirmFinishingTask: (value) => dispatch(actions.changeConfirmFinishingTask(value)),
        onChangeConfirmDeletingTask: (value) => dispatch(actions.changeConfirmDeletingTask(value)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Themes);