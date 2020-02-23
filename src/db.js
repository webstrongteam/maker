import * as SQLite from 'expo-sqlite';
import {NativeModules, Platform} from "react-native";

export const VERSION = '2.0.0'; // APP VERSION
const db = SQLite.openDatabase('maker.db', VERSION);

const getLocale = () => {
    const locale =
        Platform.OS === 'ios'
            ? NativeModules.SettingsManager.settings.AppleLocale
            : NativeModules.I18nManager.localeIdentifier;

    if (locale === 'en_PL') {
        return 'pl';
    } else {
        return 'en';
    }
};

export const initDatabase = (callback) => {
    db.transaction(tx => {
        // tx.executeSql(
        //     'DROP TABLE IF EXISTS tasks;'
        // );
        tx.executeSql(
            'create table if not exists categories (id integer primary key not null, name text);'
        );
        tx.executeSql(
            'create table if not exists tasks (id integer primary key not null, name text, description text, date text, category text, priority text, repeat text, event_id text default null, notification_id text default null);'
        );
        tx.executeSql(
            'create table if not exists finished (id integer primary key not null, name text, description text, date text, category text, priority text, repeat text, finish integer);'
        );
        tx.executeSql(
            'create table if not exists lists (id integer primary key not null, name text);'
        );
        tx.executeSql(
            'create table if not exists quickly_tasks (id integer primary key not null, name text, list_id integer not null, order_nr integer DEFAULT 0);'
        );
        tx.executeSql(
            'create table if not exists themes (id integer primary key not null, name text, primaryColor text, primaryBackgroundColor text, secondaryBackgroundColor text, primaryTextColor text, secondaryTextColor text, thirdTextColor text, warningColor text, doneIconColor text, undoIconColor text, lowColor text, mediumColor text, highColor text);'
        );
        tx.executeSql(
            'create table if not exists profile (id integer primary key not null, name text, avatar text, endedTask integer);'
        );
        tx.executeSql(
            'create table if not exists settings (id integer primary key not null, sorting text, sortingType text, timeFormat integer, firstDayOfWeek text, confirmFinishingTask integer, confirmRepeatingTask integer, confirmDeletingTask integer, version text, hideTabView integer DEFAULT 0, theme integer DEFAULT 0 REFERENCES themes(id) ON DELETE SET DEFAULT, lang text);'
        );
        tx.executeSql(
            "INSERT OR IGNORE INTO categories (id, name) values (0, 'Default');"
        );
        tx.executeSql(
            "INSERT OR IGNORE INTO themes (id, name, primaryColor, primaryBackgroundColor, secondaryBackgroundColor, primaryTextColor, secondaryTextColor, thirdTextColor, warningColor, doneIconColor, undoIconColor, lowColor, mediumColor, highColor) values (0, 'Default', '#f4511e', '#ffffff', '#e5e5e5', '#ffffff', '#000000', '#5e5e5e', '#d9534f', '#26b596', '#5bc0de', '#26b596', '#cec825', '#f4511e');"
        );
        tx.executeSql(
            "INSERT OR IGNORE INTO themes (id, name, primaryColor, primaryBackgroundColor, secondaryBackgroundColor, primaryTextColor, secondaryTextColor, thirdTextColor, warningColor, doneIconColor, undoIconColor, lowColor, mediumColor, highColor) values (1, 'Dark', '#bf3e17', '#1a1a1a', '#333333', '#f2f2f2', '#d9d9d9', '#d9d9d9', '#cc2e29', '#26b596', '#5bc0de', '#26b596', '#cec825', '#f4511e');"
        );
        tx.executeSql(
            "INSERT OR IGNORE INTO profile (id, name, avatar, endedTask) values (0, 'Maker user', '', 0);"
        );
        tx.executeSql(
            "INSERT OR IGNORE INTO settings (id, sorting, sortingType, timeFormat, firstDayOfWeek, confirmFinishingTask, confirmRepeatingTask, confirmDeletingTask, version, hideTabView, theme, lang) values (0, 'byAZ', 'ASC', 1, 'Sunday', 1, 1, 1, ?, 0, 0, 'en');", [VERSION + "_INIT"], () => {
                initApp(callback);
            }
        );
    }, (err) => console.log(err));
};

const initApp = (callback) => {
    db.transaction(
        tx => {
            // CHECK CORRECTION APP VERSION AND UPDATE DB
            tx.executeSql("select version from settings", [], (_, {rows}) => {
                const version = rows._array[0].version;
                if (version !== VERSION) {
                    if (version.includes('_INIT')) {
                        tx.executeSql('update settings set lang = ? where id = 0;', [getLocale()]);
                    }

                    const prepareToUpdate = (update) => {
                        if (update === '2.0.0') {
                            tx.executeSql('DROP TABLE IF EXISTS themes;', [], () => {
                                tx.executeSql('ALTER TABLE quickly_tasks ADD COLUMN order_nr integer DEFAULT 0;', [], () => {
                                    tx.executeSql('SELECT id FROM quickly_tasks;', [], (_, {rows}) => {
                                        Promise.all((resolve) => {
                                            rows._array.map((id, index) => {
                                                tx.executeSql('update quickly_tasks set order_nr = ? where id = ?;', [index, id], () => {
                                                    resolve();
                                                });
                                            })
                                        }).then(() => initDatabase(callback))
                                    });
                                });
                            });
                        } else if (update === '1.1.0') {
                            tx.executeSql('DELETE FROM themes WHERE id = 0;', [], () => {
                                tx.executeSql('DELETE FROM themes WHERE id = 1;', [], () => {
                                    tx.executeSql('ALTER TABLE tasks ADD COLUMN event_id text default null;', [], () => {
                                        tx.executeSql('ALTER TABLE tasks ADD COLUMN notification_id text default null;', [], () => {
                                            tx.executeSql('ALTER TABLE settings ADD COLUMN hideTabView integer DEFAULT 0;', [], () => {
                                                tx.executeSql('update settings set version = ? where id = 0;', [VERSION], () => {
                                                    prepareToUpdate('2.0.0');
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        }
                    };

                    // Init prepare DB for newest version
                    if (version.includes('1.1.0')) {
                        prepareToUpdate('2.0.0')
                    } else if (!version.includes('1.1.0') && !version.includes('2.0.0')) {
                        prepareToUpdate('1.1.0')
                    }
                } else callback();
            });
        }, (err) => console.log(err)
    );
};

export const initTheme = (callback) => {
    db.transaction(
        tx => {
            tx.executeSql("select theme from settings", [], (_, {rows}) => {
                tx.executeSql('select * from themes where id = ?', [rows._array[0].theme], (_, {rows}) => {
                    const theme = rows._array[0];
                    callback({
                        uiTheme: {
                            fontFamily: 'Ubuntu',
                            palette: {
                                primaryColor: theme.primaryColor,
                                accentColor: theme.warningColor,
                                primaryTextColor: theme.thirdTextColor,
                                secondaryTextColor: theme.thirdTextColor,
                                canvasColor: theme.secondaryBackgroundColor,
                                alternateTextColor: theme.primaryTextColor,
                                disabledColor: theme.primaryTextColor,
                                pickerHeaderColor: theme.primaryTextColor
                            }
                        },
                        ready: true
                    })
                });
            }, (err) => console.log(err));
        }
    );
};