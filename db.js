import {SQLite} from 'expo-sqlite';

export const VERSION = '1.0.3'; // APP VERSION
const db = SQLite.openDatabase('maker.db', VERSION);

export const initDatabase = (callback) => {
    db.transaction(tx => {
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
            "INSERT OR IGNORE INTO themes (id, name, primaryColor, primaryBackgroundColor, secondaryBackgroundColor, textColor, headerTextColor, bottomNavigationColor, actionButtonColor, actionButtonIconColor, overdueColor, doneButtonColor, doneButtonTextColor, undoButtonColor, undoButtonTextColor, noneColor, noneTextColor, lowColor, lowTextColor, mediumColor, mediumTextColor, highColor, highTextColor) values (1, 'Dark', '#d6471a', '#3b3b3b', '#262626', '#d9d9d9', '#d9d9d9', '#262626', '#a60d2b', '#d9d9d9', '#fc5363', '#197863', '#d9d9d9', '#d6471a', '#d9d9d9', '#3b3b3b', '#d9d9d9', '#146151', '#d9d9d9', '#916826', '#d9d9d9', '#871f29', '#d9d9d9');"
        );
        tx.executeSql(
            "INSERT OR IGNORE INTO profile (id, name, avatar, endedTask) values (0, 'Maker user', '', 0);"
        );
        tx.executeSql(
            "INSERT OR IGNORE INTO settings (id, sorting, sortingType, timeFormat, firstDayOfWeek, confirmFinishingTask, confirmRepeatingTask, confirmDeletingTask, version, theme, lang) values (0, 'byAZ', 'ASC', 1, 'Sunday', 1, 1, 1, ?, 0, 'en');", [VERSION], () => {
                initApp(callback);
            }
        );
    }, (err) => console.log(err));
};

const initApp = (callback) => {
    db.transaction(
        tx => {
            // CHECK CORRECTION APP VERSION
            tx.executeSql("select version from settings", [], (_, {rows}) => {
                const version = rows._array[0].version;
                if (version !== VERSION) {
                    tx.executeSql('DELETE FROM themes WHERE id = 0;', [], () => {
                        tx.executeSql('DELETE FROM themes WHERE id = 1;', [], () => {
                            tx.executeSql('update settings set version = ? where id = 0;', [VERSION], () => {
                                initDatabase(callback);
                            });
                        });
                    });
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
                            palette: {
                                primaryColor: theme.primaryColor,
                                accentColor: theme.actionButtonColor,
                                primaryTextColor: theme.textColor,
                                secondaryTextColor: theme.textColor,
                                canvasColor: theme.secondaryBackgroundColor,
                                alternateTextColor: theme.headerTextColor,
                                disabledColor: theme.textColor,
                                pickerHeaderColor: theme.textColor
                            },
                        },
                        ready: true
                    })
                });
            }, (err) => console.log(err));
        }
    );
};