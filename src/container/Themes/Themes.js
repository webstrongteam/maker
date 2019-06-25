import React, {Component} from 'react';
import {Toolbar, IconToggle, Icon} from 'react-native-material-ui';
import Template from '../Template/Template';
import SettingsList from 'react-native-settings-list';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import Dialog from "../../components/UI/Dialog/Dialog";

import { connect } from 'react-redux';
import * as actions from "../../store/actions";

class Themes extends Component {
    state = {
        selectedTheme: null,
        loading: true,

        dialog: {
            title: 'Changing theme',
            description: 'Some new style may require restarting app.',
            buttons: {
                ok: {
                    label: 'Ok',
                    onPress: () => {
                        this.setState({ showDialog: false });
                    }
                },
            }
        },
        showDialog: false
    };

    componentDidMount() {
        this.props.onInitThemes();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.themes !== prevProps.themes && this.props.theme.id !== false) {
            const { themes } = this.props;
            const selectedTheme = {};
            themes.map(theme => {
                selectedTheme[theme.name] = this.props.theme.name === theme.name;
            });
            this.setState({ selectedTheme, loading: false });
        }
    }

    selectedThemeHandler = (value, id, name) => {
        if (value) {
            this.props.onSetSelectedTheme(id);
            const selectedTheme = this.state.selectedTheme;

            Object.keys(selectedTheme).map(theme => {
                selectedTheme[theme] = theme === name;
            });

            this.setState({ selectedTheme, showDialog: true });
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

                <Dialog
                    showModal={showDialog}
                    title={dialog.title}
                    description={dialog.description}
                    buttons={dialog.buttons}
                />

                {!loading ?
                    <SettingsList borderColor='#d6d5d9' defaultItemSize={50}>
                        <SettingsList.Item
                            hasNavArrow={false}
                            title='Themes list'
                            titleStyle={{color: '#009688', fontWeight: '500'}}
                            itemWidth={50}
                            borderHide={'Both'}
                        />
                        <SettingsList.Item
                            icon={
                                <View style={styles.iconStyle}>
                                    <Icon style={{alignSelf: 'center'}} name="home"/>
                                </View>
                            }
                            hasNavArrow={false}
                            itemWidth={70}
                            hasSwitch={true}
                            switchState={selectedTheme.Default}
                            switchOnValueChange={(value) => this.selectedThemeHandler(value, 0, 'Default')}
                            titleStyle={{color: theme.textColor, fontSize: 16}}
                            title='Default theme'
                        />
                        <SettingsList.Item
                            icon={
                                <View style={styles.iconStyle}>
                                    <Icon style={{alignSelf: 'center'}} name="brightness-2"/>
                                </View>
                            }
                            hasNavArrow={false}
                            itemWidth={70}
                            hasSwitch={true}
                            switchState={selectedTheme.Dark}
                            switchOnValueChange={(value) => this.selectedThemeHandler(value, 1, 'Dark')}
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
                        {themes.map((theme, index) => {
                            if (index > 1) {
                                return (
                                    <SettingsList.Item
                                        key={index}
                                        hasNavArrow={true}
                                        onPress={() => navigation.navigate('Theme', {theme})}
                                        itemWidth={70}
                                        hasSwitch={true}
                                        switchState={selectedTheme[theme.name]}
                                        switchOnValueChange={(value) => this.selectedThemeHandler(value, theme.id, theme.name)}
                                        titleStyle={{color: theme.textColor, fontSize: 16}}
                                        title={theme.name}
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
                    </SettingsList> :
                    <View style={[styles.container, styles.horizontal]}>
                        <ActivityIndicator size="large" color="#0000ff" />
                    </View>
                }
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
});

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        themes: state.theme.themes
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onInitThemes: () => dispatch(actions.initThemes()),
        onSetSelectedTheme: (id) => dispatch(actions.setSelectedTheme(id)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Themes);