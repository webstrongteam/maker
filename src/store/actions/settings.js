import * as actionTypes from './actionTypes';
import {SQLite} from "expo";

const db = SQLite.openDatabase('maker.db');

export const onUpdateSettings = (settings) => {
    return {
        type: actionTypes.UPDATE_SETTINGS,
        settings
    }
};

export const initSettings = () => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('select * from settings;', [], (_, {rows}) => {
                    dispatch(onUpdateSettings(rows._array[0]));
                });
            }, (err) => console.warn(err), null
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
            }, (err) => console.warn(err), null
        );
    };
};