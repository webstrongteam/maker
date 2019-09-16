import React, {PureComponent} from 'react';
import {Icon, ListItem, Snackbar, Toolbar} from 'react-native-material-ui';
import Template from '../Template/Template';
import SettingsList from 'react-native-settings-list';
import Spinner from '../../components/UI/Spinner/Spinner';
import {StyleSheet, Text, View} from 'react-native';
import {iconStyle} from '../../shared/styles';
import {generateDialogObject} from "../../shared/utility";
import Dialog from '../../components/UI/Dialog/Dialog';
import {BannerAd} from "../../../adsAPI";

import {connect} from 'react-redux';
import * as actions from "../../store/actions";

class Settings extends PureComponent {
    state = {
        loading: true,
        showWeekDialog: false,
        showLangDialog: false,
        dialog: null,
        showFirstDayOfWeek: false,
        showLanguages: false,
        daysOfWeek: ['Sunday', 'Monday'],
        languages: [{name: 'English', short_name: 'en'}],
        snackbar: {
            visible: false,
            message: ''
        }
    };

    componentDidMount() {
        this.props.onInitSettings(() => this.setState({loading: false}));
    };

    toggleSnackbar = (message, visible = true) => {
        this.setState({snackbar: {visible, message}});
    };

    toggleSetting = (value, name) => {
        if (value) value = 1;
        else value = 0;
        this.props['onChange' + name](value, name);
    };

    showDialog = (action) => {
        let dialog;
        if (action === 'showFirstDayOfWeek') {
            dialog = generateDialogObject(
                'Select first day of week',
                false,
                {
                    Cancel: () => {
                        this.setState({[action]: false});
                    }
                }
            );
        } else if (action === 'showLanguages') {
            dialog = generateDialogObject(
                'Select language',
                false,
                {
                    Cancel: () => {
                        this.setState({[action]: false});
                    }
                }
            );
        }
        this.setState({[action]: true, dialog});
    };

    render() {
        const {loading, snackbar, showFirstDayOfWeek, showLanguages, daysOfWeek, languages, dialog} = this.state;
        const {navigation, settings, theme} = this.props;
        let viewDialog = null;

        if (showFirstDayOfWeek) {
            viewDialog = (
                <Dialog
                    showModal={showFirstDayOfWeek}
                    title={dialog.title}
                    buttons={dialog.buttons}
                >
                    {daysOfWeek.map((day, index) => (
                        <ListItem
                            divider
                            dense
                            key={index}
                            onPress={() => {
                                this.setState({showFirstDayOfWeek: false});
                                this.props.onChangeFirstDayOfWeek(day);
                                this.toggleSnackbar('First day of week has been changed');
                            }}
                            style={{
                                primaryText: {
                                    color: settings.firstDayOfWeek === day ?
                                        theme.primaryColor : theme.textColor
                                }
                            }}
                            centerElement={{
                                primaryText: day,
                            }}
                        />
                    ))
                    }
                </Dialog>
            )
        } else if (showLanguages) {
            viewDialog = (
                <Dialog
                    showModal={showLanguages}
                    title={dialog.title}
                    buttons={dialog.buttons}
                >
                    {languages.map((lang, index) => (
                        <ListItem
                            divider
                            dense
                            key={index}
                            onPress={() => {
                                this.setState({showLanguages: false});
                                this.props.onChangeLang(lang.short_name);
                            }}
                            style={{
                                primaryText: {
                                    color: settings.lang === lang.short_name ?
                                        theme.primaryColor : theme.textColor
                                }
                            }}
                            centerElement={{
                                primaryText: lang.name,
                            }}
                        />
                    ))
                    }
                </Dialog>
            )
        }

        return (
            <Template bgColor={theme.secondaryBackgroundColor}>
                <Toolbar
                    leftElement="arrow-back"
                    onLeftElementPress={() => {
                        navigation.goBack();
                    }}
                    centerElement='Settings'
                />

                <Snackbar visible={snackbar.visible} message={snackbar.message}
                          onRequestClose={() => this.toggleSnackbar('', false)}/>
                {viewDialog}

                {!loading ?
                    <React.Fragment>
                        <SettingsList backgroundColor={theme.primaryBackgroundColor}
                                      borderColor='#d6d5d9' defaultItemSize={50}>
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
                                onPress={() => this.showDialog('showFirstDayOfWeek')}
                                titleStyle={{color: theme.textColor, fontSize: 16}}
                                title='First day of week'
                            />
                            <SettingsList.Item
                                icon={
                                    <View style={iconStyle}>
                                        <Icon color={theme.textColor} style={{alignSelf: 'center'}} name="g-translate"/>
                                    </View>
                                }
                                hasNavArrow={true}
                                itemWidth={70}
                                hasSwitch={false}
                                titleInfo={settings.lang}
                                onPress={() => this.showDialog('showLanguages')}
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
                            <Text style={{color: theme.textColor}}>Version: {settings.version} (hotfix 1)</Text>
                        </View>
                    </React.Fragment> : <Spinner/>
                }
                <BannerAd/>
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

export default connect(mapStateToProps, mapDispatchToProps)(Settings);