import { SQLite } from 'expo-sqlite';

const VERSION = '0.9.5';
const db = SQLite.openDatabase('maker.db', VERSION);

export const initDatabase = (callback) => {
    db.transaction(tx => {
/*      tx.executeSql(
            'DROP TABLE IF EXISTS tasks;'
        );
        tx.executeSql(
            'DROP TABLE IF EXISTS finished;'
        );
        tx.executeSql(
            'DROP TABLE IF EXISTS categories;'
        );
        tx.executeSql(
            'DROP TABLE IF EXISTS themes;'
        );
        tx.executeSql(
            'DROP TABLE IF EXISTS profile;'
        );
        tx.executeSql(
            'DROP TABLE IF EXISTS settings;'
        );*/
        tx.executeSql(
            'create table if not exists categories (id integer primary key not null, name text);'
        );
        tx.executeSql(
            'create table if not exists tasks (id integer primary key not null, name text, description text, date text, category text, priority text, repeat text);'
        );
        tx.executeSql(
            'create table if not exists finished (id integer primary key not null, name text, description text, date text, category text, priority text, repeat text, finish integer);'
        );
        tx.executeSql(
            'create table if not exists themes (id integer primary key not null, name text, primaryColor text, primaryBackgroundColor text, secondaryBackgroundColor text, textColor text, headerTextColor text, bottomNavigationColor text, actionButtonColor text, actionButtonIconColor text, overdueColor text, doneButtonColor text, doneButtonTextColor text, undoButtonColor text, undoButtonTextColor text, noneColor text, noneTextColor text, lowColor text, lowTextColor text, mediumColor text, mediumTextColor text, highColor text, highTextColor text);'
        );
        tx.executeSql(
            'create table if not exists profile (id integer primary key not null, name text, avatar text, endedTask integer);'
        );
        tx.executeSql(
            'create table if not exists settings (id integer primary key not null, sorting text, sortingType text, timeFormat integer, firstDayOfWeek text, confirmFinishingTask integer, confirmRepeatingTask integer, confirmDeletingTask integer, version text, theme integer DEFAULT 0 REFERENCES themes(id) ON DELETE SET DEFAULT, lang text);'
        );
        tx.executeSql(
            "INSERT OR IGNORE INTO categories (id, name) values (0, 'Default');"
        );
        tx.executeSql(
            "INSERT OR IGNORE INTO themes (id, name, primaryColor, primaryBackgroundColor, secondaryBackgroundColor, textColor, headerTextColor, bottomNavigationColor, actionButtonColor, actionButtonIconColor, overdueColor, doneButtonColor, doneButtonTextColor, undoButtonColor, undoButtonTextColor, noneColor, noneTextColor, lowColor, lowTextColor, mediumColor, mediumTextColor, highColor, highTextColor) values (0, 'Default', '#f4511e', '#ffffff', '#e5e5e5', '#666', '#ffffff', '#ffffff', '#f4133f', '#ffffff', '#ce3241', '#26b596', '#ffffff', '#5bc0de', '#ffffff', '#ffffff', '#000000', '#26b596', '#ffffff', '#cec825', '#ffffff', '#ce3241', '#ffffff');"
        );
        tx.executeSql(
            "INSERT OR IGNORE INTO themes (id, name, primaryColor, primaryBackgroundColor, secondaryBackgroundColor, textColor, headerTextColor, bottomNavigationColor, actionButtonColor, actionButtonIconColor, overdueColor, doneButtonColor, doneButtonTextColor, undoButtonColor, undoButtonTextColor, noneColor, noneTextColor, lowColor, lowTextColor, mediumColor, mediumTextColor, highColor, highTextColor) values (1, 'Dark', '#a33f3f', '#845252', '#707070', '#ffffff', '#ffffff', '#282828', '#a33f3f', '#ffffff', '#ce3241', '#26b596', '#ffffff', '#5bc0de', '#ffffff', '#ffffff', '#000000', '#26b596', '#ffffff', '#cec825', '#ffffff', '#ce3241', '#ffffff');"
        );
        tx.executeSql(
            "INSERT OR IGNORE INTO profile (id, name, avatar, endedTask) values (0, 'Maker user', '', 0);"
        );
        tx.executeSql(
            "INSERT OR IGNORE INTO settings (id, sorting, sortingType, timeFormat, firstDayOfWeek, confirmFinishingTask, confirmRepeatingTask, confirmDeletingTask, version, theme, lang) values (0, 'byAZ', 'ASC', 1, 'Sunday', 1, 1, 1, ?, 0, 'en');", [VERSION]
        );
    }, (err) => console.warn(err), initApp(callback));
};

const initApp = (callback) => {
    db.transaction(
        tx => {
            // CHECK CORRECTION APP VERSION
            tx.executeSql("select version from settings", [], (_, {rows}) => {
                const version = rows._array[0].version;
                if (version !== VERSION) {
                    tx.executeSql('update settings set version = ? where id = 0;', [VERSION])
                }
            });
        }, (err) => console.warn(err), callback()
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
                            palette: {
                                primaryColor: theme.primaryColor,
                                accentColor: theme.actionButtonColor,
                                primaryTextColor: theme.textColor,
                                secondaryTextColor: theme.textColor,
                                canvasColor: theme.primaryBackgroundColor,
                                alternateTextColor: theme.headerTextColor,
                                disabledColor: theme.textColor,
                                pickerHeaderColor: theme.textColor
                            },
                        },
                        ready: true
                    })
                });
            }, (err) => console.warn(err));
        }
    );
};