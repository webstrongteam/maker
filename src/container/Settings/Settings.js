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
        daysOfWeek: [
            {name: this.props.translations.sunday, value: 'Sunday'},
            {name: this.props.translations.monday, value: 'Monday'}
        ],
        languages: [
            {name: this.props.translations.english, short_name: 'en'},
            {name: this.props.translations.polish, short_name: 'pl'}
        ],
        snackbar: {
            visible: false,
            message: ''
        }
    };

    componentDidMount() {
        this.props.onInitSettings(() => this.setState({loading: false}));
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.settings.lang !== this.props.settings.lang) {
            const {translations} = this.props;
            const daysOfWeek = [
                {name: translations.sunday, value: 'Sunday'},
                {name: translations.monday, value: 'Monday'}
            ];
            const languages = [
                {name: translations.english, short_name: 'en'},
                {name: translations.polish, short_name: 'pl'}
            ];
            this.setState({daysOfWeek, languages});
        }
    }

    toggleSnackbar = (message, visible = true) => {
        this.setState({snackbar: {visible, message}});
    };

    toggleSetting = (value, name) => {
        if (value) value = 1;
        else value = 0;
        this.props['onChange' + name](value, name);
    };

    showDialog = (action) => {
        const {translations} = this.props;
        let dialog;
        if (action === 'showFirstDayOfWeek') {
            dialog = generateDialogObject(
                translations.showFirstDayOfWeekTitle,
                false,
                {
                    [translations.cancel]: () => {
                        this.setState({[action]: false});
                    }
                }
            );
        } else if (action === 'showLanguages') {
            dialog = generateDialogObject(
                translations.showLanguagesTitle,
                false,
                {
                    [translations.cancel]: () => {
                        this.setState({[action]: false});
                    }
                }
            );
        }
        this.setState({[action]: true, dialog});
    };

    render() {
        const {loading, snackbar, showFirstDayOfWeek, showLanguages, daysOfWeek, languages, dialog} = this.state;
        const {navigation, settings, theme, translations} = this.props;
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
                                this.props.onChangeFirstDayOfWeek(day.value);
                                this.toggleSnackbar(translations.firstDaySnackbar);
                            }}
                            style={{
                                primaryText: {
                                    color: settings.firstDayOfWeek === day.value ?
                                        theme.primaryColor : theme.textColor
                                }
                            }}
                            centerElement={{
                                primaryText: day.name,
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
                                this.toggleSnackbar(translations.langSnackbar);
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
                    centerElement={translations.settings}
                />

                {viewDialog}

                {!loading ?
                    <React.Fragment>
                        <SettingsList backgroundColor={theme.primaryBackgroundColor}
                                      borderColor='#d6d5d9' defaultItemSize={50}>
                            <SettingsList.Item
                                hasNavArrow={false}
                                title={translations.general}
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
                                title={translations.timeCycle}
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
                                titleInfo={daysOfWeek.find(d => d.value === settings.firstDayOfWeek).name}
                                onPress={() => this.showDialog('showFirstDayOfWeek')}
                                titleStyle={{color: theme.textColor, fontSize: 16}}
                                title={translations.firstDayOfWeek}
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
                                title={translations.language}
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
                                title={translations.confirmFinishing}
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
                                title={translations.confirmRepeating}
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
                                title={translations.confirmDeleting}
                            />
                            <SettingsList.Item
                                icon={
                                    <View style={iconStyle}>
                                        <Icon color={theme.textColor} style={{alignSelf: 'center'}}
                                              name="view-compact"/>
                                    </View>
                                }
                                hasNavArrow={false}
                                itemWidth={70}
                                hasSwitch={true}
                                switchState={!!settings.hideTabView}
                                switchOnValueChange={(value) => this.toggleSetting(value, 'HideTabView')}
                                titleStyle={{color: theme.textColor, fontSize: 16}}
                                title={translations.hideTabView}
                            />
                        </SettingsList>
                        <View style={styles.version}>
                            <Text style={{color: theme.textColor}}>
                                {translations.version}: {settings.version} (Hotfix 1)
                            </Text>
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
        marginTop: 10,
        marginLeft: 'auto',
        marginRight: 'auto',
        opacity: 0.35
    }
});

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        settings: state.settings.settings,
        translations: {
            ...state.settings.translations.Settings,
            ...state.settings.translations.common
        }
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
        onChangeHideTabView: (value) => dispatch(actions.changeHideTabView(value)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);