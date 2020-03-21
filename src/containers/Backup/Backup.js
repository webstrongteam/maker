import React, {PureComponent} from 'react';
import {Platform, ScrollView, Text, View} from 'react-native';
import {IconToggle, ListItem, Toolbar} from 'react-native-material-ui';
import {generateDialogObject} from '../../shared/utility';
import Dialog from "../../components/UI/Dialog/Dialog";
import {empty, listRow, row, shadow} from '../../shared/styles';
import Spinner from '../../components/UI/Spinner/Spinner';
import * as FileSystem from "expo-file-system";
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as SQLite from 'expo-sqlite';
import Template from '../Template/Template';
import {BannerAd} from "../../shared/bannerAd";
import {initApp} from '../../db';
import moment from 'moment';

import {connect} from 'react-redux';
import * as actions from "../../store/actions";

class Backup extends PureComponent {
    state = {
        showDialog: false,
        dialog: null,
        backups: [],
        loading: true,
        selectedBackup: {},
        control: {
            label: this.props.translations.newName,
            required: true,
            characterRestriction: 40
        },
        snackbar: {
            visible: false,
            message: ''
        }
    };

    componentDidMount() {
        this.loadBackupFiles();
    }

    loadBackupFiles = async () => {
        await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'Backup', {intermediates: true});
        await FileSystem.readDirectoryAsync(FileSystem.documentDirectory + 'Backup')
            .then((backups) => {
                this.setState({backups, loading: false});
            })
            .catch(() => {
                this.toggleSnackbar(this.props.translations.loadingError);
                this.setState({backups: [], loading: false});
            });
    };

    useBackupDB = (name) => {
        const {translations} = this.props;
        FileSystem.copyAsync({
            from: FileSystem.documentDirectory + 'Backup/' + name,
            to: FileSystem.documentDirectory + 'SQLite/maker.db'
        })
            .then(() => {
                this.setState({loading: true});
                initApp(() => {
                    this.props.onInitTheme();
                    this.props.onInitCategories();
                    this.props.onInitProfile();
                    this.props.onInitToDo();
                    this.props.onInitSettings(() => {
                        this.setState({loading: false});
                        this.toggleSnackbar(translations.dbReplaced);
                    });
                }, true)
            })
            .catch(() => {
                this.toggleSnackbar(translations.dbReplacedError);
            });

        if (Platform.OS === 'ios') {
            setTimeout(() => {
                this.showDialog('restart');
            }, 1000)
        }
    };

    createBackup = (ownUri = false) => {
        const {translations} = this.props;

        let date;
        let uri = FileSystem.documentDirectory + 'SQLite/maker.db';
        if (ownUri) uri = ownUri;

        if (this.props.timeFormat) date = moment(new Date()).format("_DD_MM_YYYY_HH_mm_ss");
        else date = moment(new Date()).format("_DD_MM_YYYY_hh_mm_ss");

        FileSystem.copyAsync({
            from: uri,
            to: `${FileSystem.documentDirectory}Backup/maker${date}`
        })
            .then(() => {
                this.loadBackupFiles();
                this.toggleSnackbar(translations.backupCreated);
            })
            .catch(() => {
                this.toggleSnackbar(translations.backupCreatedError);
            });
    };

    addBackupFromStorage = async () => {
        const backupPicker = await DocumentPicker.getDocumentAsync({
            type: 'application/sql',
            copyToCacheDirectory: false
        });
        if (backupPicker.type === 'success') {
            FileSystem.copyAsync({
                from: backupPicker.uri,
                to: `${FileSystem.documentDirectory}SQLite/maker_test.db`
            })
                .then(() => {
                    this.checkDatabase();
                })
                .catch(() => {
                    this.toggleSnackbar(this.props.translations.backupCreatedError);
                });
        }
    };

    shareBackup = (name) => {
        Sharing.shareAsync(
            FileSystem.documentDirectory + 'Backup/' + name,
            {dialogTitle: 'Share backup', mimeType: 'application/sql', UTI: 'public.database'});
    };

    removeBackup = (path) => {
        const {translations} = this.props;
        FileSystem.deleteAsync(FileSystem.documentDirectory + path)
            .then(async () => {
                await this.loadBackupFiles();
                this.toggleSnackbar(translations.backupRemoved);
            })
            .catch(() => {
                this.toggleSnackbar(translations.backupRemovedError);
            });
    };

    checkDatabase = () => {
        const {translations} = this.props;
        const db = SQLite.openDatabase('maker_test.db');
        db.transaction(
            tx => {
                tx.executeSql("select version from settings", [],
                    () => {
                        this.createBackup(FileSystem.documentDirectory + 'SQLite/maker_test.db');
                    },
                    () => {
                        this.toggleSnackbar(translations.incorrectFile);
                    }
                )
            }, () => {
                this.toggleSnackbar(translations.incorrectFile);
            }
        );
    };

    toggleSnackbar = (message, visible = true) => {
        this.props.onUpdateSnackbar(visible, message);
    };

    showDialog = (action, name = null) => {
        const {translations} = this.props;
        let dialog;
        if (action === 'showBackupAlert') {
            dialog = generateDialogObject(
                translations.defaultTitle,
                `${translations.showBackupAlertDescription1} "${name}"?\n\n${translations.showBackupAlertDescription2}`,
                {
                    [translations.yes]: () => {
                        this.props.onUpdateModal(false);
                        this.useBackupDB(name);
                    },
                    [translations.cancel]: () => {
                        this.props.onUpdateModal(false);
                    }
                }
            );
        } else if (action === 'showConfirmDelete') {
            dialog = generateDialogObject(
                translations.defaultTitle,
                translations.showConfirmDeleteDescription,
                {
                    [translations.yes]: () => {
                        this.props.onUpdateModal(false);
                        this.removeBackup(`Backup/${name}`)
                    },
                    [translations.cancel]: () => {
                        this.props.onUpdateModal(false);
                    }
                }
            );
        } else if (action === 'showSelectBackupSource') {
            dialog = generateDialogObject(
                translations.showSelectBackupSourceTitle,
                [
                    {
                        name: translations.yourApp,
                        value: translations.yourApp,
                        onClick: () => {
                            this.props.onUpdateModal(false);
                            this.createBackup();
                        }
                    },
                    {
                        name: translations.yourStorage,
                        value: translations.yourStorage,
                        onClick: () => {
                            this.props.onUpdateModal(false);
                            this.addBackupFromStorage();
                        }
                    }
                ],
                {
                    Cancel: () => {
                        this.props.onUpdateModal(false);
                    }
                }
            );
            dialog.select = true;
        } else if (action === 'rename') {
            dialog = generateDialogObject(
                translations.newName,
                {
                    elementConfig: this.state.control,
                    focus: true,
                    value: this.state.selectedBackup.name,
                    onChange: (value, control) => {
                        const {selectedBackup} = this.state;
                        selectedBackup.name = value;
                        this.setState({selectedBackup, control}, () => this.showDialog(action));
                    }
                },
                {
                    Save: () => {
                        const {selectedBackup, control} = this.state;
                        if (!control.error) {
                            FileSystem.moveAsync({
                                from: selectedBackup.uri,
                                to: `${FileSystem.documentDirectory}Backup/${selectedBackup.name}`
                            })
                                .then(() => this.loadBackupFiles())
                                .catch(() => this.toggleSnackbar(translations.backupRenameError));
                        }
                        this.setState({showModal: false});
                    },
                    Cancel: () => this.setState({showModal: false})
                }
            );
            return this.setState({dialog, showModal: true});
        } else if (action === 'restart') {
            dialog = generateDialogObject(
                translations.restartTitle,
                translations.restartDescription
            );
        }

        this.props.onUpdateModal(true, dialog);
    };

    render() {
        const {loading, dialog, showModal, backups} = this.state;
        const {navigation, theme, translations} = this.props;

        return (
            <Template bgColor={theme.secondaryBackgroundColor}>
                <Toolbar
                    leftElement="arrow-back"
                    rightElement={
                        <IconToggle
                            color={theme.primaryTextColor}
                            onPress={() => this.showDialog('showSelectBackupSource')}
                            name="add"/>
                    }
                    onLeftElementPress={() => {
                        navigation.goBack();
                    }}
                    centerElement={translations.title}
                />

                {dialog &&
                <Dialog
                    showModal={showModal}
                    input={true}
                    title={dialog.title}
                    body={dialog.body}
                    buttons={dialog.buttons}
                />
                }

                {!loading ?
                    <View style={{flex: 1}}>
                        <ScrollView style={{paddingTop: 5}}>
                            {backups.length ?
                                backups.map(name => (
                                    <ListItem
                                        divider
                                        dense
                                        key={name}
                                        onPress={() => this.showDialog('showBackupAlert', name)}
                                        style={{
                                            container: {
                                                ...shadow, ...listRow,
                                                backgroundColor: theme.primaryBackgroundColor
                                            }
                                        }}
                                        rightElement={
                                            <View style={row}>
                                                <IconToggle
                                                    style={{container: {marginRight: -10}}}
                                                    onPress={() => this.setState({
                                                        selectedBackup: {
                                                            name, uri: FileSystem.documentDirectory + 'Backup/' + name,
                                                        }
                                                    }, () => this.showDialog('rename'))}
                                                    color={theme.undoIconColor}
                                                    name="edit"/>
                                                <IconToggle
                                                    style={{container: {marginRight: -7}}}
                                                    onPress={() => this.shareBackup(name)}
                                                    color={theme.undoIconColor}
                                                    name="share"/>
                                                <IconToggle
                                                    onPress={() => this.showDialog('showConfirmDelete', name)}
                                                    color={theme.warningColor}
                                                    name="delete"/>
                                            </View>
                                        }
                                        centerElement={{
                                            primaryText: name
                                        }}
                                    />
                                )) :
                                <Text style={[empty, {color: theme.thirdTextColor}]}>
                                    {translations.emptyList}
                                </Text>
                            }
                        </ScrollView>
                    </View> : <Spinner/>
                }
                <BannerAd/>
            </Template>
        )
    }
}

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        timeFormat: state.settings.settings.timeFormat,
        translations: {
            ...state.settings.translations.Backup,
            ...state.settings.translations.common
        }
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onInitToDo: () => dispatch(actions.initToDo()),
        onInitCategories: () => dispatch(actions.initCategories()),
        onInitTheme: () => dispatch(actions.initTheme()),
        onInitProfile: () => dispatch(actions.initProfile()),
        onInitSettings: (callback) => dispatch(actions.initSettings(callback)),
        onUpdateSnackbar: (showSnackbar, snackbarText) => dispatch(actions.updateSnackbar(showSnackbar, snackbarText)),
        onUpdateModal: (showModal, modal) => dispatch(actions.updateModal(showModal, modal))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Backup);