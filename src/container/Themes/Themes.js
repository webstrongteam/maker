import React, {PureComponent} from 'react';
import {Toolbar, IconToggle, Icon} from 'react-native-material-ui';
import Template from '../Template/Template';
import SettingsList from 'react-native-settings-list';
import {View} from 'react-native';
import Spinner from '../../components/UI/Spinner/Spinner';
import Dialog from "../../components/UI/Dialog/Dialog";
import {generateDialogObject} from "../../shared/utility";
import {iconStyle} from '../../shared/styles';
import {BannerAd} from "../../../adsAPI";

import { connect } from 'react-redux';
import * as actions from "../../store/actions";

class Themes extends PureComponent {
    state = {
        selectedTheme: null,
        loading: true,
        dialog: null,
        showDialog: false
    };

    componentDidMount() {
        this.props.onInitThemes();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.themes !== prevProps.themes || this.props.theme.id !== prevProps.theme.id) {
            this.initThemes();
        }
    }

    initThemes = () => {
        if (this.props.theme.id === false) this.props.onInitTheme();
        else {
            const { themes } = this.props;
            const selectedTheme = {};
            themes.map(theme => {
                selectedTheme[theme.id] = +this.props.theme.id === +theme.id;
            });
            this.setState({ selectedTheme, loading: false });
        }
    };

    showDialog = () => {
        const dialog = generateDialogObject(
            'Changing theme...',
            'Some new style may require restarting app!',
            {
                Ok: () => this.setState({ showDialog: false })
            }
        );
        this.setState({showDialog: true, dialog});
    };

    selectedThemeHandler = (value, id) => {
        if (value) {
            this.props.onSetSelectedTheme(id);
            const selectedTheme = this.state.selectedTheme;

            Object.keys(selectedTheme).map(theme => {
                selectedTheme[theme] = +theme === +id;
            });

            this.setState({ selectedTheme });
            this.props.onInitTheme();
            this.showDialog();
        }
    };

    render() {
        const { selectedTheme, loading, dialog, showDialog } = this.state;
        const {navigation, themes, theme} = this.props;

        return (
            <Template bgColor={theme.secondaryBackgroundColor}>
                <Toolbar
                    leftElement="arrow-back"
                    rightElement={
                        <IconToggle color={theme.headerTextColor} onPress={() => navigation.navigate('Theme')} name="add" />
                    }
                    onLeftElementPress={() => {
                        navigation.goBack();
                    }}
                    centerElement='Themes'
                />

                {showDialog &&
                <Dialog
                    showModal={showDialog}
                    title={dialog.title}
                    description={dialog.description}
                    buttons={dialog.buttons}
                />
                }

                {!loading ?
                    <SettingsList backgroundColor={theme.primaryBackgroundColor}
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
                                    <Icon color={theme.textColor} style={{alignSelf: 'center'}} name="home"/>
                                </View>
                            }
                            hasNavArrow={false}
                            itemWidth={70}
                            hasSwitch={true}
                            switchState={selectedTheme['0']}
                            switchOnValueChange={(value) => this.selectedThemeHandler(value, 0)}
                            titleStyle={{color: theme.textColor, fontSize: 16}}
                            title='Default theme'
                        />
                        <SettingsList.Item
                            icon={
                                <View style={iconStyle}>
                                    <Icon color={theme.textColor} style={{alignSelf: 'center'}} name="brightness-2"/>
                                </View>
                            }
                            hasNavArrow={false}
                            itemWidth={70}
                            hasSwitch={true}
                            switchState={selectedTheme['1']}
                            switchOnValueChange={(value) => this.selectedThemeHandler(value, 1)}
                            titleStyle={{color: theme.textColor, fontSize: 16}}
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
                                        onPress={() => navigation.navigate('Theme', {theme: themeEl})}
                                        itemWidth={70}
                                        hasSwitch={true}
                                        switchState={selectedTheme[themeEl.id]}
                                        switchOnValueChange={(value) => this.selectedThemeHandler(value, themeEl.id)}
                                        titleStyle={{color: theme.textColor, fontSize: 16}}
                                        title={themeEl.name}
                                    />
                                )
                            }
                        })}
                        <SettingsList.Item
                            title='Add your own theme'
                            itemWidth={70}
                            onPress={() => navigation.navigate('Theme')}
                            titleStyle={{color: theme.textColor, fontSize: 16}}
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
        theme: state.theme.theme,
        themes: state.theme.themes
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onInitTheme: () => dispatch(actions.initTheme()),
        onInitThemes: () => dispatch(actions.initThemes()),
        onSetSelectedTheme: (id) => dispatch(actions.setSelectedTheme(id))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Themes);