import React, {PureComponent} from 'react';
import {Toolbar, IconToggle, Icon, Snackbar, withTheme} from 'react-native-material-ui';
import Template from '../Template/Template';
import SettingsList from 'react-native-settings-list';
import {View} from 'react-native';
import Spinner from '../../components/UI/Spinner/Spinner';
import Dialog from "../../components/UI/Dialog/Dialog";
import {iconStyle} from '../../shared/styles';
import {BannerAd} from "../../../adsAPI";

import { connect } from 'react-redux';
import * as actions from "../../store/actions";

class Themes extends PureComponent {
    state = {
        selectedTheme: null,
        loading: true,
        dialog: null,
        snackbar: {
            visible: false,
            message: ''
        }
    };

    componentDidMount() {
        this.props.onInitThemes();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.themes !== prevProps.themes || this.props.actualTheme.id !== prevProps.actualTheme.id) {
            this.initThemes();
        }
    }

    toggleSnackbar = (message, visible = true) => {
        this.setState({snackbar: {visible, message}});
    };

    initThemes = () => {
        if (this.props.actualTheme.id === false) this.props.onInitTheme();
        else {
            const { themes } = this.props;
            const selectedTheme = {};
            themes.map(theme => {
                selectedTheme[theme.id] = +this.props.actualTheme.id === +theme.id;
            });
            this.setState({ selectedTheme, loading: false });
        }
    };

    selectedThemeHandler = (value, id) => {
        if (value) {
            this.props.onSetSelectedTheme(id);
            const selectedTheme = this.state.selectedTheme;

            Object.keys(selectedTheme).map(theme => {
                selectedTheme[theme] = +theme === +id;
            });

            this.setState({selectedTheme});
            this.toggleSnackbar('Theme has been updated');
        }
    };

    render() {
        const {selectedTheme, loading, dialog, showDialog, snackbar} = this.state;
        const {navigation, themes, actualTheme} = this.props;

        return (
            <Template bgColor={actualTheme.secondaryBackgroundColor}>
                <Toolbar
                    leftElement="arrow-back"
                    rightElement={
                        <IconToggle name="add"
                            color={actualTheme.headerTextColor}
                            onPress={() => navigation.navigate('Theme')} />
                    }
                    onLeftElementPress={() => navigation.goBack()}
                    centerElement='Themes'
                />

                <Snackbar
                    visible={snackbar.visible}
                    message={snackbar.message}
                    onRequestClose={() => this.toggleSnackbar('', false)} />

                {showDialog &&
                <Dialog
                    showModal={showDialog}
                    title={dialog.title}
                    description={dialog.description}
                    buttons={dialog.buttons}
                />
                }

                {!loading ?
                    <SettingsList backgroundColor={actualTheme.primaryBackgroundColor}
                                  borderColor='#d6d5d9' defaultItemSize={50}>
                        <SettingsList.Item
                            hasNavArrow={false}
                            title='Themes list'
                            titleStyle={{color: '#009688', fontWeight: '500'}}
                            itemWidth={50}
                            borderHide={'Both'}
                        />
                        <SettingsList.Item
                            icon={
                                <View style={iconStyle}>
                                    <Icon color={actualTheme.textColor} style={{alignSelf: 'center'}} name="home"/>
                                </View>
                            }
                            hasNavArrow={false}
                            itemWidth={70}
                            hasSwitch={true}
                            switchState={selectedTheme['0']}
                            switchOnValueChange={(value) => this.selectedThemeHandler(value, 0)}
                            titleStyle={{color: actualTheme.textColor, fontSize: 16}}
                            title='Default theme'
                        />
                        <SettingsList.Item
                            icon={
                                <View style={iconStyle}>
                                    <Icon color={actualTheme.textColor} style={{alignSelf: 'center'}} name="brightness-2"/>
                                </View>
                            }
                            hasNavArrow={false}
                            itemWidth={70}
                            hasSwitch={true}
                            switchState={selectedTheme['1']}
                            switchOnValueChange={(value) => this.selectedThemeHandler(value, 1)}
                            titleStyle={{color: actualTheme.textColor, fontSize: 16}}
                            title='Dark theme'
                        />
                        <SettingsList.Header headerStyle={{marginTop: -5}}/>
                        <SettingsList.Item
                            hasNavArrow={false}
                            title='Your themes'
                            titleStyle={{color: '#009688', fontWeight: 'bold'}}
                            itemWidth={70}
                            borderHide={'Both'}
                        />
                        {themes.map((themeEl, index) => {
                            if (index > 1) {
                                return (
                                    <SettingsList.Item
                                        key={index}
                                        hasNavArrow={true}
                                        onPress={() => navigation.navigate('Theme', {theme: themeEl.id})}
                                        itemWidth={70}
                                        hasSwitch={true}
                                        switchState={selectedTheme[themeEl.id]}
                                        switchOnValueChange={(value) => this.selectedThemeHandler(value, themeEl.id)}
                                        titleStyle={{color: actualTheme.textColor, fontSize: 16}}
                                        title={themeEl.name}
                                    />
                                )
                            }
                        })}
                        <SettingsList.Item
                            title='Add your own theme'
                            itemWidth={70}
                            onPress={() => navigation.navigate('Theme')}
                            titleStyle={{color: actualTheme.textColor, fontSize: 16}}
                        />
                    </SettingsList> : <Spinner />
                }
                <BannerAd />
            </Template>
        );
    }
}

const mapStateToProps = state => {
    return {
        actualTheme: state.theme.theme,
        themes: state.theme.themes
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onInitTheme: (callback) => dispatch(actions.initTheme(callback)),
        onInitThemes: () => dispatch(actions.initThemes()),
        onSetSelectedTheme: (id) => dispatch(actions.setSelectedTheme(id))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(withTheme(Themes));
