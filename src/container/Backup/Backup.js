import React, {Component} from 'react';
import {StyleSheet, View, ScrollView, ActivityIndicator, Text} from 'react-native';
import {Toolbar, IconToggle, ListItem, Snackbar} from 'react-native-material-ui';
import { generateDialogObject } from '../../shared/utility';
import DialogModal from '../../components/UI/Dialog/Dialog';
import Dialog from "react-native-dialog";
import * as FileSystem from "expo-file-system";
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { SQLite } from 'expo-sqlite';
import Template from '../Template/Template';
import moment from 'moment';

import { connect } from 'react-redux';
import * as actions from "../../store/actions";

class TaskList extends Component {
    state = {
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

    showDialog = (name) => {
        const dialog = generateDialogObject(
            'Are you sure?',
            `Replace current database by '${name}' backup? 

This will delete your current database!`,
            {
                Yes: () => {
                    this.setState({ showDialog: false });
                    this.useBackupDB(name);
                },
                Cancel: () => {
                    this.setState({ showDialog: false });
                }
            }
        );
        this.setState({showDialog: true, dialog});
    };

    render() {
        const {loading, showDialog, dialog, snackbar, backups, showAddBackupDialog} = this.state;
        const {navigation, theme} = this.props;

        return (
            <Template>
                <Toolbar
                    leftElement="arrow-back"
                    rightElement={
                        <IconToggle
                            color={theme.headerTextColor}
                            onPress={() => this.setState({showAddBackupDialog: true})}
                            name="add" />
                    }
                    onLeftElementPress={() => {
                        navigation.goBack();
                    }}
                    centerElement='Backups'
                />

                <Snackbar visible={snackbar.visible} message={snackbar.message} onRequestClose={() => this.toggleSnackbar('', false)} />

                {showDialog &&
                <DialogModal
                    showModal={showDialog}
                    title={dialog.title}
                    description={dialog.description}
                    buttons={dialog.buttons}
                />
                }

                <Dialog.Container visible={showAddBackupDialog}>
                    <Dialog.Title>Add database from...</Dialog.Title>
                    <ListItem
                        divider
                        dense
                        onPress={() => {
                            this.setState({ showAddBackupDialog: false });
                            this.createBackup();
                        }}
                        centerElement={{
                            primaryText: "Your app",
                        }}
                    />
                    <ListItem
                        dense
                        onPress={() => {
                            this.setState({ showAddBackupDialog: false });
                            this.addBackupFromStorage();
                        }}
                        centerElement={{
                            primaryText: "Your storage",
                        }}
                    />
                    <Dialog.Button
                        label="Cancel"
                        onPress={() => this.setState({ showAddBackupDialog: false })}
                    />
                </Dialog.Container>

                {!loading ?
                <View style={styles.container}>
                    <ScrollView style={[styles.backups, {backgroundColor: theme.primaryBackgroundColor}]}>
                        {backups.length ?
                        backups.map(name => (
                            <ListItem
                                divider
                                dense
                                key={name}
                                onPress={() => this.showDialog(name)}
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
                        <Text style={[styles.empty, {color: theme.textColor}]}>Backup list is empty!</Text>
                        }
                    </ScrollView>
                </View> :
                <View style={[styles.container, styles.horizontal]}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
                }
            </Template>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    backups: {
        width: '100%'
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 50
    },
    empty: {
        marginTop: 30,
        width: "100%",
        textAlign: "center"
    }
});

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