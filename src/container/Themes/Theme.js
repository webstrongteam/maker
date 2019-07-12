import React, {Component} from 'react';
import {Toolbar, Button, IconToggle} from 'react-native-material-ui';
import { fromHsv } from 'react-native-color-picker'
import ColorPicker from '../../components/UI/ColorPicker/ColorPicker';
import Spinner from '../../components/UI/Spinner/Spinner';
import Template from '../Template/Template';
import SettingsList from 'react-native-settings-list';
import Input from '../../components/UI/Input/Input';
import {StyleSheet, View} from "react-native";
import {generateDialogObject, valid} from "../../shared/utility";
import Dialog from '../../components/UI/Dialog/Dialog';
import {BannerAd} from "../../../adsAPI";

import { connect } from 'react-redux';
import * as actions from "../../store/actions";

class Theme extends Component {
    state = {
        customTheme: {id: false},
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

        controls: {
            name: {
                label: 'Enter theme name',
                focus: true,
                required: true,
                characterRestriction: 30
            }
        },

        showDialog: false,
        dialog: {},
        loading: true
    };

    componentDidMount() {
        const theme = this.props.navigation.getParam('theme', false);
        this.initTheme(theme);
    }

    initTheme = (id) => {
        if (id !== false) {
            this.props.onInitCustomTheme(id, (customTheme) => {
                this.setState({ customTheme, loading: false });
            });
        }
        else {
            this.props.onInitTheme(customTheme => {
                customTheme.id = false;
                customTheme.name = '';
                this.setState({ customTheme, loading: false });
            });
        }
    };

    showDialog = (action) => {
        let dialog;
        if (action === 'exit') {
            dialog = generateDialogObject(
                'Are you sure?',
                'Quit without saving?',
                {
                    Yes: () => {
                        this.setState({ showDialog: false });
                        this.props.navigation.goBack();
                    },
                    Save: () => {
                        this.checkValid('name', true);
                        this.setState({ showDialog: false });
                    },
                    Cancel: () => this.setState({ showDialog: false })
                }
            );
        }
        else if (action === 'delete') {
            dialog = generateDialogObject(
                'Are you sure?',
                'Delete this theme?',
                {
                    Yes: () => {
                        this.setState({ showDialog: false });
                        this.deleteTheme();
                        this.props.navigation.goBack();
                    },
                    No: () => {
                        this.setState({ showDialog: false });
                    }
                }
            );
        }
        this.setState({showDialog: true, dialog});
    };

    deleteTheme = () => {
        const {customTheme} = this.state;
        if (this.props.theme.id === customTheme.id) {
            this.props.onSetSelectedTheme(0); // Set default theme
        }
        this.props.onDeleteTheme(customTheme.id);
    };

    configColorPicker = (colorPickerTitle, selectedColor) => {
        this.setState({ colorPickerTitle, selectedColor, showColorPicker: true });
    };

    changeNameHandler = (name) => {
        const customTheme = this.state.customTheme;
        customTheme.name = name;
        this.setState({ customTheme });
    };

    onSaveColor = () => {
        const {selectedColor, actualColor} = this.state;
        const customTheme = this.state.customTheme;
        customTheme[selectedColor] = actualColor;

        this.setState({ customTheme, showColorPicker: false });
    };

    checkValid = (name, save = false, value = this.state.customTheme.name) => {
        const controls = this.state.controls;
        valid(controls, value, name, (newControls) => {
            this.changeNameHandler(value);
            if (save && !newControls[name].error) {
                const {customTheme} = this.state;
                const {navigation} = this.props;
                this.props.onSaveTheme(customTheme);
                navigation.goBack();
            } this.setState({ controls: newControls });
        })
    };

    render() {
        const { customTheme, controls, showDialog, dialog, loading, names, showColorPicker, selectedColor, colorPickerTitle, actualColor } = this.state;
        const { navigation, theme } = this.props;

        return (
            <Template bgColor={theme.secondaryBackgroundColor}>
                <Toolbar
                    leftElement="arrow-back"
                    rightElement={
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Button
                                text="Save"
                                style={{ text: { color: theme.headerTextColor } }}
                                onPress={() => this.checkValid('name', true)}
                            />
                            {customTheme.id !== false && <IconToggle name="delete"
                                color={theme.headerTextColor}
                                onPress={() => this.showDialog('delete')} />
                            }
                        </View>
                    }
                    onLeftElementPress={() => {
                        if (customTheme.name.trim() !== '') {
                            this.showDialog('exit');
                        } else navigation.goBack();
                    }}
                    centerElement={
                        !loading ?
                        customTheme.id ?
                            "Edit theme" :
                            "New theme" :
                        <View style={{marginTop: 10}}>
                            <Spinner color={theme.secondaryBackgroundColor} size='small' />
                        </View>
                    }
                />

                {showDialog &&
                <Dialog
                    showModal={showDialog}
                    title={dialog.title}
                    description={dialog.description}
                    buttons={dialog.buttons}
                />
                }

                <ColorPicker
                    show={showColorPicker}
                    title={colorPickerTitle}
                    color={actualColor}
                    defaultColor={customTheme[selectedColor]}
                    changeColor={(color) => this.setState({ actualColor: fromHsv(color) })}
                    save={this.onSaveColor}
                    cancel={() => this.setState({ showColorPicker: false })}
                />

                {!loading ?
                <React.Fragment>
                    <Input
                        elementConfig={controls.name}
                        value={customTheme.name}
                        changed={value => this.checkValid('name', false, value)}
                    />
                    <SettingsList backgroundColor={theme.primaryBackgroundColor}
                                  borderColor={theme.secondaryBackgroundColor}
                                  defaultItemSize={50}>
                        <SettingsList.Item
                            hasNavArrow={false}
                            title='Main'
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
                                        title='Elements'
                                        titleStyle={{color: '#009688', fontWeight: 'bold'}}
                                        itemWidth={70}
                                        borderHide={'Both'}
                                    />
                                );
                            } else if (key === 'doneButtonColor') {
                                themeList.push(<SettingsList.Header headerStyle={{marginTop: -5}}/>);
                                themeList.push(
                                    <SettingsList.Item
                                        hasNavArrow={false}
                                        title='Buttons'
                                        titleStyle={{color: '#009688', fontWeight: 'bold'}}
                                        itemWidth={70}
                                        borderHide={'Both'}
                                    />
                                );
                            } else if (key === 'noneColor') {
                                themeList.push(<SettingsList.Header headerStyle={{marginTop: -5}}/>);
                                themeList.push(
                                    <SettingsList.Item
                                        hasNavArrow={false}
                                        title='Priorities'
                                        titleStyle={{color: '#009688', fontWeight: 'bold'}}
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
                </React.Fragment> : <Spinner />
                }
                <BannerAd />
            </Template>
        );
    }
}

const styles = StyleSheet.create({
    colorPreview: {
        marginTop: 10,
        marginRight: 10,
        width: 50,
        height: 50,
        borderStyle: "dashed",
        borderRadius: 30,
        borderWidth: 0.75
    }
});

const mapStateToProps = state => {
    return {theme: state.theme.theme}
};
const mapDispatchToProps = dispatch => {
    return {
        onInitTheme: (callback) => dispatch(actions.initTheme(callback)),
        onInitCustomTheme: (id, callback) => dispatch(actions.initCustomTheme(id, callback)),
        onSaveTheme: (theme) => dispatch(actions.saveTheme(theme)),
        onSetSelectedTheme: (id) => dispatch(actions.setSelectedTheme(id)),
        onDeleteTheme: (id) => dispatch(actions.deleteTheme(id))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Theme);