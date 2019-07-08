import React, {Component} from 'react';
import {Toolbar, Icon, ListItem, Snackbar} from 'react-native-material-ui';
import Template from '../Template/Template';
import SettingsList from 'react-native-settings-list';
import {View, StyleSheet, ActivityIndicator, Text} from 'react-native';
import {activity, iconStyle} from '../../shared/styles';
import Dialog from "react-native-dialog";
import {BannerAd} from "../../../adsAPI";

import { connect } from 'react-redux';
import * as actions from "../../store/actions";

class Themes extends Component {
    state = {
        loading: true,
        showWeekDialog: false,
        showLangDialog: false,
        snackbar: {
            visible: false,
            message: ''
        }
    };

    componentDidMount() {
        this.props.onInitSettings(() => this.setState({ loading: false }));
    }

    toggleSnackbar = (message, visible = true) => {
        this.setState({snackbar: {visible, message}});
    };

    toggleSetting = (value, name) => {
        if (value) value = 1;
        else value = 0;
        this.props['onChange'+name](value, name);
    };

    render() {
        const { loading, showWeekDialog, showLangDialog, snackbar } = this.state;
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

                <Snackbar visible={snackbar.visible} message={snackbar.message} onRequestClose={() => this.toggleSnackbar('', false)} />

                <Dialog.Container visible={showWeekDialog}>
                    <Dialog.Title>Select first day of week</Dialog.Title>
                    <ListItem
                        divider
                        dense
                        onPress={() => {
                            this.setState({ showWeekDialog: false });
                            this.props.onChangeFirstDayOfWeek('Sunday');
                            this.toggleSnackbar('First day of week has been changed');
                        }}
                        style={{
                            primaryText: {
                                color: settings.firstDayOfWeek === 'Sunday' ?
                                    theme.primaryColor : theme.textColor
                            }
                        }}
                        centerElement={{
                            primaryText: "Sunday",
                        }}
                    />
                    <ListItem
                        dense
                        onPress={() => {
                            this.setState({ showWeekDialog: false });
                            this.props.onChangeFirstDayOfWeek('Monday');
                            this.toggleSnackbar('First day of week has been changed');
                        }}
                        style={{
                            primaryText: {
                                color: settings.firstDayOfWeek === 'Monday' ?
                                    theme.primaryColor : theme.textColor
                            }
                        }}
                        centerElement={{
                            primaryText: "Monday",
                        }}
                    />
                    <Dialog.Button
                        label="Cancel"
                        onPress={() => this.setState({ showWeekDialog: false })}
                    />
                </Dialog.Container>

                <Dialog.Container visible={showLangDialog}>
                    <Dialog.Title>Select language</Dialog.Title>
                    <ListItem
                        divider
                        dense
                        onPress={() => {
                            this.setState({ showLangDialog: false });
                            this.props.onChangeLang('en');
                        }}
                        style={{
                            primaryText: {
                                color: settings.lang === 'en' ?
                                    theme.primaryColor : theme.textColor
                            }
                        }}
                        centerElement={{
                            primaryText: "English",
                        }}
                    />
                    <Dialog.Button
                        label="Cancel"
                        onPress={() => this.setState({ showLangDialog: false })}
                    />
                </Dialog.Container>

                {!loading ?
                <React.Fragment>
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
                                <View style={iconStyle}>
                                    <Icon color={theme.textColor} style={{alignSelf: 'center'}} name="alarm"/>
                                </View>
                            }
                            hasNavArrow={false}
                            itemWidth={70}
                            hasSwitch={true}
                            switchState={!!settings.timeFormat}
                            switchOnValueChange={(value) => this.toggleSetting(value, 'TimeFormat')}
                            titleStyle={{color: theme.textColor, fontSize: 16}}
                            title='24H time cycle'
                        />
                        <SettingsList.Item
                            icon={
                                <View style={iconStyle}>
                                    <Icon color={theme.textColor} style={{alignSelf: 'center'}} name="event"/>
                                </View>
                            }
                            hasNavArrow={true}
                            itemWidth={70}
                            hasSwitch={false}
                            titleInfo={settings.firstDayOfWeek}
                            onPress={() => this.setState({ showWeekDialog: true })}
                            titleStyle={{color: theme.textColor, fontSize: 16}}
                            title='First day of week'
                        />
                        <SettingsList.Item
                            icon={
                                <View style={iconStyle}>
                                    <Icon color={theme.textColor} style={{alignSelf: 'center'}} name="g-translate" />
                                </View>
                            }
                            hasNavArrow={true}
                            itemWidth={70}
                            hasSwitch={false}
                            titleInfo={settings.lang}
                            onPress={() => this.setState({ showLangDialog: true })}
                            titleStyle={{color: theme.textColor, fontSize: 16}}
                            title='Language'
                        />
                        <SettingsList.Item
                            icon={
                                <View style={iconStyle}>
                                    <Icon color={theme.textColor} style={{alignSelf: 'center'}} name="done"/>
                                </View>
                            }
                            hasNavArrow={false}
                            itemWidth={70}
                            hasSwitch={true}
                            switchState={!!settings.confirmFinishingTask}
                            switchOnValueChange={(value) => this.toggleSetting(value, 'ConfirmFinishingTask')}
                            titleStyle={{color: theme.textColor, fontSize: 16}}
                            title='Confirm finishing task'
                        />
                        <SettingsList.Item
                            icon={
                                <View style={iconStyle}>
                                    <Icon color={theme.textColor} style={{alignSelf: 'center'}} name="autorenew"/>
                                </View>
                            }
                            hasNavArrow={false}
                            itemWidth={70}
                            hasSwitch={true}
                            switchState={!!settings.confirmRepeatingTask}
                            switchOnValueChange={(value) => this.toggleSetting(value, 'ConfirmRepeatingTask')}
                            titleStyle={{color: theme.textColor, fontSize: 16}}
                            title='Confirm repeating task'
                        />
                        <SettingsList.Item
                            icon={
                                <View style={iconStyle}>
                                    <Icon color={theme.textColor} style={{alignSelf: 'center'}} name="delete"/>
                                </View>
                            }
                            hasNavArrow={false}
                            itemWidth={70}
                            hasSwitch={true}
                            switchState={!!settings.confirmDeletingTask}
                            switchOnValueChange={(value) => this.toggleSetting(value, 'ConfirmDeletingTask')}
                            titleStyle={{color: theme.textColor, fontSize: 16}}
                            title='Confirm deleting task'
                        />
                    </SettingsList>
                    <View style={styles.version}>
                        <Text style={{color: theme.textColor}}>Version: {settings.version}</Text>
                    </View>
                </React.Fragment> :
                <View style={activity}>
                    <ActivityIndicator size="large" color={theme.primaryColor} />
                </View>
                }
                <BannerAd />
            </Template>
        );
    }
}

const styles = StyleSheet.create({
    version: {
        marginTop: 20,
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
        onInitSettings: (callback) => dispatch(actions.initSettings(callback)),
        onChangeLang: (value) => dispatch(actions.changeLang(value)),
        onChangeFirstDayOfWeek: (value) => dispatch(actions.changeFirstDayOfWeek(value)),
        onChangeTimeFormat: (value) => dispatch(actions.changeTimeFormat(value)),
        onChangeConfirmRepeatingTask: (value) => dispatch(actions.changeConfirmRepeatingTask(value)),
        onChangeConfirmFinishingTask: (value) => dispatch(actions.changeConfirmFinishingTask(value)),
        onChangeConfirmDeletingTask: (value) => dispatch(actions.changeConfirmDeletingTask(value)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Themes);