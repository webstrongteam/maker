import * as actionTypes from './actionTypes';
import {SQLite} from 'expo-sqlite';

const db = SQLite.openDatabase('maker.db');

export const onInitTheme = (theme) => {
    return {
        type: actionTypes.INIT_THEME,
        theme
    }
};

export const onInitThemes = (themes) => {
    return {
        type: actionTypes.INIT_THEMES,
        themes
    }
};

export const initTheme = (callback = () => null) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql("select theme from settings", [], (_, {rows}) => {
                    tx.executeSql('select * from themes where id = ?', [rows._array[0].theme], (_, {rows}) => {
                        callback(rows._array[0]);
                        dispatch(onInitTheme(rows._array[0]))
                    });
                });
            }, (err) => console.log(err)
        );
    };
};

export const initThemes = () => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql("select * from themes", [], (_, {rows}) => {
                    dispatch(onInitThemes(rows._array));
                });
            }, (err) => console.log(err)
        );
    };
};

export const initCustomTheme = (id, callback = () => null) => {
    return () => {
        db.transaction(
            tx => {
                tx.executeSql('select * from themes where id = ?', [id], (_, {rows}) => {
                    callback(rows._array[0]);
                });
            }, (err) => console.log(err)
        );
    };
};

export const setSelectedTheme = (id) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('update settings set theme = ? where id = 0;', [id], () => {
                    dispatch(initTheme());
                });
            }, (err) => console.log(err)
        );
    };
};

export const saveTheme = (theme) => {
    return dispatch => {
        if (theme.id) {
            db.transaction(
                tx => {
                    tx.executeSql("UPDATE themes SET name = ?, primaryColor = ?, primaryBackgroundColor = ?, secondaryBackgroundColor = ?, textColor = ?, headerTextColor = ?, bottomNavigationColor = ?, actionButtonColor = ?, actionButtonIconColor = ?, overdueColor = ?, doneButtonColor = ?, doneButtonTextColor = ?, undoButtonColor = ?, undoButtonTextColor = ?, noneColor = ?, noneTextColor = ?, lowColor = ?, lowTextColor = ?, mediumColor = ?, mediumTextColor = ?, highColor = ?, highTextColor = ? WHERE id = ?;",
                        [theme.name, theme.primaryColor, theme.primaryBackgroundColor, theme.secondaryBackgroundColor, theme.textColor, theme.headerTextColor, theme.bottomNavigationColor, theme.actionButtonColor, theme.actionButtonIconColor, theme.overdueColor, theme.doneButtonColor, theme.doneButtonTextColor, theme.undoButtonColor, theme.undoButtonTextColor, theme.noneColor, theme.noneTextColor, theme.lowColor, theme.lowTextColor, theme.mediumColor, theme.mediumTextColor, theme.highColor, theme.highTextColor, theme.id], () => {
                            dispatch(initTheme());
                        });
                }, (err) => console.log(err)
            );
        } else {
            db.transaction(
                tx => {
                    tx.executeSql("INSERT INTO themes (name, primaryColor, primaryBackgroundColor, secondaryBackgroundColor, textColor, headerTextColor, bottomNavigationColor, actionButtonColor, actionButtonIconColor, overdueColor, doneButtonColor, doneButtonTextColor, undoButtonColor, undoButtonTextColor, noneColor, noneTextColor, lowColor, lowTextColor, mediumColor, mediumTextColor, highColor, highTextColor) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?);",
                        [theme.name, theme.primaryColor, theme.primaryBackgroundColor, theme.secondaryBackgroundColor, theme.textColor, theme.headerTextColor, theme.bottomNavigationColor, theme.actionButtonColor, theme.actionButtonIconColor, theme.overdueColor, theme.doneButtonColor, theme.doneButtonTextColor, theme.undoButtonColor, theme.undoButtonTextColor, theme.noneColor, theme.noneTextColor, theme.lowColor, theme.lowTextColor, theme.mediumColor, theme.mediumTextColor, theme.highColor, theme.highTextColor], () => {
                            dispatch(initThemes());
                        });
                }, (err) => console.log(err)
            );
        }
    };
};

export const deleteTheme = (id) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('delete from themes where id = ?', [id], () => {
                    dispatch(initThemes());
                });
            }, (err) => console.log(err)
        );
    };
};