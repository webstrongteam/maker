import React, {PureComponent} from 'react';
import {View, ScrollView, Text} from 'react-native';
import {Toolbar, IconToggle, ListItem, Snackbar} from 'react-native-material-ui';
import { generateDialogObject } from '../../shared/utility';
import {container, fullWidth, empty} from '../../shared/styles';
import Spinner from '../../components/UI/Spinner/Spinner';
import Dialog from '../../components/UI/Dialog/Dialog';
import * as FileSystem from "expo-file-system";
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { SQLite } from 'expo-sqlite';
import Template from '../Template/Template';
import {BannerAd} from "../../../adsAPI";
import moment from 'moment';

import { connect } from 'react-redux';
import * as actions from "../../store/actions";

class TaskList extends PureComponent {
    state = {
        showSelectBackupSource: false,
        showBackupAlert: false,
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
                this.setState({ backups, loading: false });
            })
            .catch(() => {
                this.toggleSnackbar('Loading backups error!');
                this.setState({ backups: [], loading: false });
            });
    };

    useBackupDB = (name) => {
        FileSystem.copyAsync({ from: FileSystem.documentDirectory + 'Backup/' + name, to: FileSystem.documentDirectory + 'SQLite/maker.db' })
            .then(() => {
                this.props.onInitToDo();
                this.toggleSnackbar('Database has been replace');
            })
            .catch(() => {
                this.toggleSnackbar('Replacing database error!');
            });
    };

    createBackup = (ownUri = false) => {
        let date;
        let uri = FileSystem.documentDirectory + 'SQLite/maker.db';
        if (ownUri) uri = ownUri;

        if (this.props.timeFormat) date = moment(new Date()).format("_DD_MM_YYYY_HH_mm_ss");
        else date = moment(new Date()).format("_DD_MM_YYYY_hh_mm_ss");

        FileSystem.copyAsync({
            from: uri,
            to: `${FileSystem.documentDirectory}Backup/maker${date}` })
            .then(() => {
                this.loadBackupFiles();
                this.toggleSnackbar('Backup has been created');
            })
            .catch(() => {
                this.toggleSnackbar('Creating backup error!');
            });
    };

    addBackupFromStorage = async () => {
        const backupPicker = await DocumentPicker.getDocumentAsync({type: 'application/sql', copyToCacheDirectory: false});
        if (backupPicker.type === 'success') {
            FileSystem.copyAsync({
                from: backupPicker.uri,
                to: `${FileSystem.documentDirectory}SQLite/maker_test.db` })
                .then(() => {
                    this.checkDatabase();
                })
                .catch(() => {
                    this.toggleSnackbar('Creating backup error!');
                });
        }
    };

    shareBackup = (name) => {
        Sharing.shareAsync(
            FileSystem.documentDirectory + 'Backup/' + name,
            {dialogTitle: 'Share backup', mimeType: 'application/sql', UTI: 'public.database'});
    };

    removeBackup = (path) => {
        FileSystem.deleteAsync(FileSystem.documentDirectory + path)
            .then(() => {
                this.loadBackupFiles();
                this.toggleSnackbar('Backup has been removed');
            })
            .catch(() => {
                this.toggleSnackbar('Removing backup error!');
            });
    };

    checkDatabase = () => {
        const db = SQLite.openDatabase('maker_test.db');
        db.transaction(
            tx => {
                tx.executeSql("select version from settings", [],
                    () => {
                        this.createBackup(FileSystem.documentDirectory + 'SQLite/maker_test.db');
                    },
                    () => {
                        this.toggleSnackbar('This file is incorrect!');
                    }
            )}, () => {
                this.toggleSnackbar('This file is incorrect!');
            }
        );
    };

    toggleSnackbar = (message, visible = true) => {
        this.setState({snackbar: {visible, message}});
    };

    showDialog = (action, name = null) => {
        let dialog;
        if (action === 'showBackupAlert') {
            dialog = generateDialogObject(
                'Are you sure?',
                `Replace current database by '${name}' backup? 

This will delete your current database!`,
                {
                    Yes: () => {
                        this.setState({ [action]: false });
                        this.useBackupDB(name);
                    },
                    Cancel: () => {
                        this.setState({ [action]: false });
                    }
                }
            );
        }
        else if (action === 'showSelectBackupSource') {
            dialog = generateDialogObject(
                'Add database from...',
                false,
                {
                    Cancel: () => {
                        this.setState({ [action]: false });
                    }
                }
            );
        }
        this.setState({[action]: true, dialog});
    };

    render() {
        const {loading, showBackupAlert, dialog, snackbar, backups, showSelectBackupSource} = this.state;
        const {navigation, theme} = this.props;

        return (
            <Template>
                <Toolbar
                    leftElement="arrow-back"
                    rightElement={
                        <IconToggle
                            color={theme.headerTextColor}
                            onPress={() => this.showDialog('showSelectBackupSource')}
                            name="add" />
                    }
                    onLeftElementPress={() => {
                        navigation.goBack();
                    }}
                    centerElement='Backups'
                />

                <Snackbar visible={snackbar.visible} message={snackbar.message} onRequestClose={() => this.toggleSnackbar('', false)} />

                {showBackupAlert &&
                <Dialog
                    showModal={showBackupAlert}
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
                            this.setState({ showSelectBackupSource: false });
                            this.createBackup();
                        }}
                        centerElement={{
                            primaryText: "Your app",
                        }}
                    />
                    <ListItem
                        dense
                        onPress={() => {
                            this.setState({ showSelectBackupSource: false });
                            this.addBackupFromStorage();
                        }}
                        centerElement={{
                            primaryText: "Your storage",
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
                                    <View style={{flexDirection: 'row'}}>
                                        <IconToggle
                                            onPress={() => this.shareBackup(name)}
                                            name="share" />
                                        <IconToggle
                                            onPress={() => this.removeBackup(`Backup/${name}`)}
                                            name="delete" />
                                    </View>
                                }
                                centerElement={{
                                    primaryText: name
                                }}
                            />
                        )) :
                        <Text style={[empty, {color: theme.textColor}]}>Backup list is empty!</Text>
                        }
                    </ScrollView>
                </View> : <Spinner />
                }
                <BannerAd />
            </Template>
        )
    }
}

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        timeFormat: state.settings.timeFormat
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onInitToDo: () => dispatch(actions.initToDo())
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(TaskList);