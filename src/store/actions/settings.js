import * as actionTypes from './actionTypes';
import {SQLite} from 'expo-sqlite';

const db = SQLite.openDatabase('maker.db');

export const onUpdateSettings = (settings) => {
    return {
        type: actionTypes.UPDATE_SETTINGS,
        settings
    }
};

export const onChangeLang = (lang) => {
    return {
        type: actionTypes.CHANGE_LANG,
        lang
    }
};

export const initSettings = (callback = () => null) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('select * from settings;', [], (_, {rows}) => {
                    callback();
                    dispatch(onUpdateSettings(rows._array[0]));
                });
            }, (err) => console.log(err)
        );
    };
};

export const changeSorting = (sorting, type) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('update settings set sorting = ?, sortingType = ? where id = 0;', [sorting, type], () => {
                    dispatch(initSettings())
                });
            }, (err) => console.log(err)
        );
    };
};

export const changeTimeFormat = (value) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('update settings set timeFormat = ? where id = 0;', [value], () => {
                    dispatch(initSettings())
                });
            }, (err) => console.log(err)
        );
    };
};

export const changeFirstDayOfWeek = (value) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('update settings set firstDayOfWeek = ? where id = 0;', [value], () => {
                    dispatch(initSettings())
                });
            }, (err) => console.log(err)
        );
    };
};

export const changeLang = (value) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('update settings set lang = ? where id = 0;', [value], () => {
                    initSettings()
                    console.log(value)
                    dispatch(onChangeLang(value))
                });
            }, (err) => console.log(err)
        );
    };
};

export const changeConfirmFinishingTask = (value) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('update settings set confirmFinishingTask = ? where id = 0;', [value], () => {
                    dispatch(initSettings())
                });
            }, (err) => console.log(err)
        );
    };
};

export const changeConfirmRepeatingTask = (value) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('update settings set confirmRepeatingTask = ? where id = 0;', [value], () => {
                    dispatch(initSettings())
                });
            }, (err) => console.log(err)
        );
    };
};

export const changeConfirmDeletingTask = (value) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('update settings set confirmDeletingTask = ? where id = 0;', [value], () => {
                    dispatch(initSettings())
                });
            }, (err) => console.log(err)
        );
    };
};

export const changeHideTabView = (value) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('update settings set hideTabView = ? where id = 0;', [value], () => {
                    dispatch(initSettings())
                });
            }, (err) => console.log(err)
        );
    };
};