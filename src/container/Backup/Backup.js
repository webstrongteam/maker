import React, {PureComponent} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {IconToggle, ListItem, Snackbar, Toolbar} from 'react-native-material-ui';
import {generateDialogObject} from '../../shared/utility';
import {container, empty, fullWidth, row} from '../../shared/styles';
import Spinner from '../../components/UI/Spinner/Spinner';
import Dialog from '../../components/UI/Dialog/Dialog';
import * as FileSystem from "expo-file-system";
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import {SQLite} from 'expo-sqlite';
import Template from '../Template/Template';
import {BannerAd} from "../../../adsAPI";
import moment from 'moment';

import {connect} from 'react-redux';
import * as actions from "../../store/actions";

class TaskList extends PureComponent {
    state = {
        showSelectBackupSource: false,
        showDialog: false,
        dialog: null,
        backups: [],
        loading: true,
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
                this.props.onInitTheme();
                this.props.onInitCategories();
                this.props.onInitProfile();
                this.props.onInitToDo();
                this.props.onInitSettings(() => {
                    this.setState({loading: false});
                    this.toggleSnackbar(translations.dbReplaced);
                });
            })
            .catch(() => {
                this.toggleSnackbar(translations.dbReplacedError);
            });
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
            .then(() => {
                this.loadBackupFiles();
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
        this.setState({snackbar: {visible, message}});
    };

    showDialog = (action, name = null) => {
        const {translations} = this.props;
        let dialog;
        if (action === 'showBackupAlert') {
            dialog = generateDialogObject(
                translations.defaultTitle,
                `${translations.showBackupAlertDescription1} '${name}' backup? 

${translations.showBackupAlertDescription2}`,
                {
                    [translations.yes]: () => {
                        this.setState({showDialog: false});
                        this.useBackupDB(name);
                    },
                    [translations.cancel]: () => {
                        this.setState({showDialog: false});
                    }
                }
            );
        } else if (action === 'showSelectBackupSource') {
            dialog = generateDialogObject(
                translations.showSelectBackupSourceTitle,
                false,
                {
                    Cancel: () => {
                        this.setState({[action]: false});
                    }
                }
            );
        } else if (action === 'showConfirmDelete') {
            dialog = generateDialogObject(
                translations.defaultTitle,
                translations.showConfirmDeleteDescription,
                {
                    [translations.yes]: () => {
                        this.setState({showDialog: false});
                        this.removeBackup(`Backup/${name}`)
                    },
                    [translations.cancel]: () => {
                        this.setState({showDialog: false});
                    }
                }
            );
        }
        if (dialog.description) this.setState({showDialog: true, dialog});
        else this.setState({[action]: true, dialog});
    };

    render() {
        const {loading, showDialog, dialog, snackbar, backups, showSelectBackupSource} = this.state;
        const {navigation, theme, translations} = this.props;

        return (
            <Template>
                <Toolbar
                    leftElement="arrow-back"
                    rightElement={
                        <IconToggle
                            color={theme.headerTextColor}
                            onPress={() => this.showDialog('showSelectBackupSource')}
                            name="add"/>
                    }
                    onLeftElementPress={() => {
                        navigation.goBack();
                    }}
                    centerElement={translations.title}
                />

                <Snackbar
                    visible={snackbar.visible}
                    message={snackbar.message}
                    onRequestClose={() => this.toggleSnackbar('', false)}/>

                {showDialog &&
                <Dialog
                    showModal={showDialog}
                    title={dialog.title}
                    description={dialog.description}
                    buttons={dialog.buttons}
                />
                }

                {showSelectBackupSource &&
                <Dialog
                    showModal={showSelectBackupSource}
                    title={dialog.title}
                    buttons={dialog.buttons}>
                    <ListItem
                        divider
                        dense
                        onPress={() => {
                            this.setState({showSelectBackupSource: false});
                            this.createBackup();
                        }}
                        centerElement={{
                            primaryText: translations.yourApp,
                        }}
                    />
                    <ListItem
                        dense
                        onPress={() => {
                            this.setState({showSelectBackupSource: false});
                            this.addBackupFromStorage();
                        }}
                        centerElement={{
                            primaryText: translations.yourStorage,
                        }}
                    />
                </Dialog>
                }

                {!loading ?
                    <View style={container}>
                        <ScrollView style={[fullWidth, {backgroundColor: theme.primaryBackgroundColor}]}>
                            {backups.length ?
                                backups.map(name => (
                                    <ListItem
                                        divider
                                        dense
                                        key={name}
                                        onPress={() => this.showDialog('showBackupAlert', name)}
                                        style={{
                                            container: {height: 50}
                                        }}
                                        rightElement={
                                            <View style={row}>
                                                <IconToggle
                                                    onPress={() => this.shareBackup(name)}
                                                    name="share"/>
                                                <IconToggle
                                                    onPress={() => this.showDialog('showConfirmDelete', name)}
                                                    name="delete"/>
                                            </View>
                                        }
                                        centerElement={{
                                            primaryText: name
                                        }}
                                    />
                                )) :
                                <Text style={[empty, {color: theme.textColor}]}>
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
        onInitSettings: (callback) => dispatch(actions.initSettings(callback))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(TaskList);