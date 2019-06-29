import React, {Component} from 'react';
import {Toolbar, Button, IconToggle} from 'react-native-material-ui';
import { fromHsv } from 'react-native-color-picker'
import ColorPicker from '../../components/UI/ColorPicker/ColorPicker';
import Template from '../Template/Template';
import SettingsList from 'react-native-settings-list';
import Input from '../../components/UI/Input/Input';
import {ActivityIndicator, StyleSheet, View} from "react-native";
import Dialog from '../../components/UI/Dialog/Dialog';

import { connect } from 'react-redux';
import * as actions from "../../store/actions";
import {generateDialogObject} from "../../shared/utility";

class Theme extends Component {
    state = {
        theme: {id: false},
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
                characterRestriction: 40
            }
        },

        showDialog: false,
        dialog: {},
        loading: true
    };

    componentDidMount() {
        const theme = this.props.navigation.getParam('theme', false);
        if (theme) this.setState({ theme, loading: false });
        else {
            const defaultTheme = this.props.theme;
            defaultTheme.id = false;
            defaultTheme.name = '';
            this.setState({ theme: defaultTheme, loading: false });
        }
    }
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
                        if (this.state.task.name.trim() !== '') {
                            this.props.onSaveTheme(this.state.theme);
                            this.props.navigation.goBack();
                        } else this.valid();
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
        const {theme} = this.state;
        if (this.props.theme.id === theme.id) {
            this.props.onSetSelectedTheme(0); // Set default theme
        }
        this.props.onDeleteTheme(theme.id);
    };

    configColorPicker = (colorPickerTitle, selectedColor) => {
        this.setState({ colorPickerTitle, selectedColor, showColorPicker: true });
    };

    changeNameHandler = (name) => {
        this.valid(name);
        const theme = this.state.theme;
        theme.name = name;
        this.setState({ theme });
    };

    onSaveColor = () => {
        const {selectedColor, actualColor} = this.state;
        const theme = this.state.theme;
        theme[selectedColor] = actualColor;

        this.setState({ theme, showColorPicker: false });
    };

    valid = (value = this.state.theme.name) => {
        const newControls = this.state.controls;
        if (value.trim() === '') {
            newControls.name.error = `Theme name is required!`;
        } else delete newControls.name.error;
        this.setState({ controls: newControls })
    };

    render() {
        const { theme, controls, showDialog, dialog, loading, names, showColorPicker, selectedColor, colorPickerTitle, actualColor } = this.state;
        const { navigation } = this.props;

        return (
            <Template bgColor="#e5e5e5">
                <Toolbar
                    leftElement="arrow-back"
                    rightElement={
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Button
                                text="Save"
                                style={{ text: { color: this.props.theme.headerTextColor } }}
                                onPress={() => {
                                    if (theme.name.trim() !== '') {
                                        this.props.onSaveTheme(theme);
                                        navigation.goBack();
                                    } else this.valid();
                                }}
                            />
                            {theme.id !== false && <IconToggle name="delete"
                                color={this.props.theme.headerTextColor}
                                onPress={() => this.showDialog('delete')} />
                            }
                        </View>
                    }
                    onLeftElementPress={() => {
                        if (theme.name.trim() !== '') {
                            this.showDialog('exit');
                        } else navigation.goBack();
                    }}
                    centerElement={ theme.id ? 'Edit theme' : 'New theme' }
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
                    defaultColor={theme[selectedColor]}
                    changeColor={(color) => this.setState({ actualColor: fromHsv(color) })}
                    save={this.onSaveColor}
                    cancel={() => this.setState({ showColorPicker: false })}
                />

                {!loading ?
                <React.Fragment>
                    <Input
                        elementConfig={controls.name}
                        value={theme.name}
                        color={this.props.theme.primaryColor}
                        changed={ value => this.changeNameHandler(value) }
                    />
                    <SettingsList borderColor='#d6d5d9' defaultItemSize={50}>
                        <SettingsList.Item
                            hasNavArrow={false}
                            title='Main'
                            titleStyle={{color: '#009688', fontWeight: '500'}}
                            itemWidth={50}
                            borderHide={'Both'}
                        />
                        {Object.keys(theme).map((key, index) => {
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
                                    titleStyle={{color: 'black', fontSize: 16}}
                                    title={names[index]}
                                    onPress={() => this.configColorPicker(
                                        names[index], key
                                    )}
                                    arrowIcon={<View style={[ styles.colorPreView, {backgroundColor: theme[key]} ]} />}
                                />
                            );

                            return themeList;
                        })}
                    </SettingsList>
                </React.Fragment> :
                <View style={[styles.container, styles.horizontal]}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
                }
            </Template>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 50
    },
    colorPreView: {
        marginTop: 10,
        marginRight: 10,
        width: 50,
        height: 50,
        borderStyle: "dashed",
        borderRadius: 30,
        borderWidth: 0.75,
        borderColor: '#5d5d5d',
    }
});

const mapStateToProps = state => {
    return {
        theme: state.theme.theme
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onSaveTheme: (theme) => dispatch(actions.saveTheme(theme)),
        onSetSelectedTheme: (id) => dispatch(actions.setSelectedTheme(id)),
        onDeleteTheme: (id) => dispatch(actions.deleteTheme(id))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Theme);