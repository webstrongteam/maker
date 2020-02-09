import React, {Component} from 'react';
import {Button, IconToggle, Toolbar} from 'react-native-material-ui';
import {fromHsv} from 'react-native-color-picker'
import ColorPicker from '../../components/UI/ColorPicker/ColorPicker';
import Spinner from '../../components/UI/Spinner/Spinner';
import Template from '../Template/Template';
import SettingsList from 'react-native-settings-list';
import {Text, TouchableOpacity, View} from "react-native";
import {generateDialogObject, checkValid} from "../../shared/utility";
import {BannerAd} from "../../../adsAPI";
import styles from './Theme.styles';

import {connect} from 'react-redux';
import * as actions from "../../store/actions";

class Theme extends Component {
    state = {
        customTheme: {id: false, name: ''},
        newThemeName: '',
        defaultName: this.props.translations.defaultName,
        names: [
            'id', 'name', 'Primary color', 'Primary background color', 'Secondary background color', 'Text color', 'Header text color',
            'Bottom navigation color', 'Action button color', 'Action button icon color', 'Overdue color',
            'Done button color', 'Done text button color', 'Undo button color', 'Undo text button color',
            'None color', 'None text color', 'Low color', 'Low text color', 'Medium color', 'Medium text color', 'High color', 'High text color'
        ],

        showColorPicker: false,
        colorPickerTitle: '',
        selectedColor: '',
        actualColor: '',

        control: {
            label: this.props.translations.themeNameLabel,
            required: true,
            characterRestriction: 30,
            error: true
        },
        loading: true
    };

    componentDidMount() {
        const theme = this.props.navigation.getParam('theme', false);
        this.initTheme(theme);
    }

    initTheme = (id) => {
        if (id !== false) {
            this.props.onInitCustomTheme(id, (customTheme) => {
                this.setState({customTheme, newThemeName: customTheme.name, loading: false});
            });
        } else {
            this.props.onInitTheme(customTheme => {
                customTheme.id = false;
                customTheme.name = this.props.translations.defaultName;
                this.setState({customTheme, newThemeName: customTheme.name, loading: false});
            });
        }
    };

    showDialog = (action) => {
        const {translations} = this.props;
        let dialog;
        if (action === 'exit') {
            dialog = generateDialogObject(
                translations.defaultTitle,
                translations.exitDescription,
                {
                    [translations.yes]: () => {
                        this.props.onUpdateModal(false);
                        this.props.navigation.goBack();
                    },
                    [translations.save]: () => {
                        this.props.onUpdateModal(false);
                        this.checkValid('name', true);
                    },
                    [translations.cancel]: () => this.props.onUpdateModal(false)
                }
            );
        } else if (action === 'delete') {
            dialog = generateDialogObject(
                translations.defaultTitle,
                translations.deleteDescription,
                {
                    [translations.yes]: () => {
                        this.props.onUpdateModal(false);
                        this.deleteTheme();
                        this.props.navigation.goBack();
                    },
                    [translations.no]: () => {
                        this.props.onUpdateModal(false);
                    }
                }
            );
        } else if (action === 'changeName') {
            const {newThemeName, control} = this.state;

            dialog = generateDialogObject(
                translations.changeNameTitle,
                {
                    elementConfig: control,
                    focus: true,
                    value: newThemeName,
                    onChange: (value, control) => {
                        this.setState({newThemeName: value, control}, () => {
                            this.showDialog(action);
                        })
                    }
                },
                {
                    [translations.save]: () => {
                        if (!control.error) {
                            const {customTheme, newThemeName} = this.state;
                            customTheme.name = newThemeName;
                            this.setState({customTheme});
                            this.props.onUpdateModal(false);
                        }
                    },
                    [translations.cancel]: () => {
                        const {customTheme, control} = this.state;
                        delete control.error;
                        this.setState({newThemeName: customTheme.name, control});
                        this.props.onUpdateModal(false);
                    },
                }
            );
            dialog.input = true;
        }

        this.props.onUpdateModal(true, dialog);
    };

    deleteTheme = () => {
        const {customTheme} = this.state;
        if (this.props.theme.id === customTheme.id) {
            this.props.onSetSelectedTheme(0); // Set default theme
        }
        this.props.onDeleteTheme(customTheme.id);
    };

    configColorPicker = (colorPickerTitle, selectedColor) => {
        this.setState({colorPickerTitle, selectedColor, showColorPicker: true});
    };

    onSaveColor = () => {
        const {selectedColor, actualColor} = this.state;
        const customTheme = this.state.customTheme;
        customTheme[selectedColor] = actualColor;

        this.setState({customTheme, showColorPicker: false});
    };

    checkValid = (name = this.state.customTheme.name) => {
        const {defaultName, control} = this.state;
        return checkValid(control, name) && name !== defaultName;
    };

    saveTheme = () => {
        const {customTheme} = this.state;
        const {navigation} = this.props;
        this.props.onSaveTheme(customTheme);
        navigation.goBack();
    };

    render() {
        const {
            customTheme, loading, names, showColorPicker, selectedColor,
            colorPickerTitle, actualColor
        } = this.state;
        const {navigation, theme, translations} = this.props;

        return (
            <Template bgColor={theme.secondaryBackgroundColor}>
                <Toolbar
                    leftElement="arrow-back"
                    rightElement={
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            {this.checkValid() &&
                            <IconToggle name="save"
                                        color={theme.headerTextColor}
                                        onPress={this.saveTheme}/>
                            }
                            {customTheme.id !== false &&
                            <IconToggle name="delete"
                                        color={theme.headerTextColor}
                                        onPress={() => this.showDialog('delete')}/>
                            }
                        </View>
                    }
                    onLeftElementPress={() => {
                        if (this.checkValid()) {
                            this.showDialog('exit');
                        } else navigation.goBack();
                    }}
                    centerElement={
                        !loading ?
                            <TouchableOpacity onPress={() => this.showDialog('changeName')}>
                                <Text style={{
                                    color: theme.headerTextColor,
                                    fontWeight: 'bold',
                                    fontSize: 18
                                }}>
                                    {customTheme.name}
                                </Text>
                            </TouchableOpacity> :
                            <View style={{marginTop: 10, marginRight: 40}}>
                                <Spinner color={theme.secondaryBackgroundColor} size='small'/>
                            </View>
                    }
                />

                <ColorPicker
                    show={showColorPicker}
                    title={colorPickerTitle}
                    color={actualColor}
                    defaultColor={customTheme[selectedColor]}
                    changeColor={(color) => this.setState({actualColor: fromHsv(color)})}
                    save={this.onSaveColor}
                    cancel={() => this.setState({showColorPicker: false})}
                />

                {!loading ?
                    <React.Fragment>
                        <SettingsList backgroundColor={theme.primaryBackgroundColor}
                                      borderColor={theme.secondaryBackgroundColor}
                                      defaultItemSize={50}>
                            <SettingsList.Item
                                hasNavArrow={false}
                                title={translations.main}
                                titleStyle={{color: '#009688', fontWeight: '500'}}
                                itemWidth={50}
                                borderHide={'Both'}
                            />
                            {Object.keys(customTheme).map((key, index) => {
                                if (key === 'id' || key === 'name') return null;
                                const themeList = [];
                                if (key === 'bottomNavigationColor') {
                                    themeList.push(<SettingsList.Header headerStyle={{marginTop: -5}}/>);
                                    themeList.push(
                                        <SettingsList.Item
                                            hasNavArrow={false}
                                            title={translations.elements}
                                            titleStyle={styles.titleStyle}
                                            itemWidth={70}
                                            borderHide={'Both'}
                                        />
                                    );
                                } else if (key === 'doneButtonColor') {
                                    themeList.push(<SettingsList.Header headerStyle={{marginTop: -5}}/>);
                                    themeList.push(
                                        <SettingsList.Item
                                            hasNavArrow={false}
                                            title={translations.buttons}
                                            titleStyle={styles.titleStyle}
                                            itemWidth={70}
                                            borderHide={'Both'}
                                        />
                                    );
                                } else if (key === 'noneColor') {
                                    themeList.push(<SettingsList.Header headerStyle={{marginTop: -5}}/>);
                                    themeList.push(
                                        <SettingsList.Item
                                            hasNavArrow={false}
                                            title={translations.priorities}
                                            titleStyle={styles.titleStyle}
                                            itemWidth={70}
                                            borderHide={'Both'}
                                        />
                                    );
                                }
                                themeList.push(
                                    <SettingsList.Item
                                        itemWidth={70}
                                        titleStyle={{color: theme.textColor, fontSize: 16}}
                                        title={names[index]}
                                        onPress={() => this.configColorPicker(
                                            names[index], key
                                        )}
                                        arrowIcon={<View
                                            style={[
                                                styles.colorPreview,
                                                {
                                                    borderColor: theme.textColor,
                                                    backgroundColor: customTheme[key]
                                                }]
                                            }
                                        />}
                                    />
                                );
                                return themeList;
                            })}
                        </SettingsList>
                    </React.Fragment> : <Spinner/>
                }
                <BannerAd/>
            </Template>
        );
    }
}

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        translations: {
            ...state.settings.translations.Theme,
            ...state.settings.translations.validation,
            ...state.settings.translations.common
        }
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onInitTheme: (callback) => dispatch(actions.initTheme(callback)),
        onInitCustomTheme: (id, callback) => dispatch(actions.initCustomTheme(id, callback)),
        onSaveTheme: (theme) => dispatch(actions.saveTheme(theme)),
        onSetSelectedTheme: (id) => dispatch(actions.setSelectedTheme(id)),
        onDeleteTheme: (id) => dispatch(actions.deleteTheme(id)),
        onUpdateModal: (showModal, modal) => dispatch(actions.updateModal(showModal, modal))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Theme);