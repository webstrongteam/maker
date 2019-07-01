import * as actionTypes from './actionTypes';
import {SQLite} from "expo";

const db = SQLite.openDatabase('maker.db');

export const onUpdateProfile = (profile) => {
    return {
        type: actionTypes.UPDATE_PROFILE,
        profile
    }
};

export const initProfile = () => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('select * from profile;', [], (_, {rows}) => {
                    dispatch(onUpdateProfile(rows._array[0]));
                });
            }, (err) => console.warn(err), null
        );
    };
};

export const changeName = (name) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('update profile set name = ? where id = 0;', [name], () => {
                    dispatch(initProfile())
                });
            }, (err) => console.warn(err), null
        );
    };
};

export const changeAvatar = (avatar) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('update profile set avatar = ? where id = 0;', [avatar], () => {
                    dispatch(initProfile())
                });
            }, (err) => console.warn(err), null
        );
    };
};

export const addDeletedTask = (value) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('update profile set deletedTask = ? where id = 0;', [value], () => {
                    dispatch(initProfile())
                });
            }, (err) => console.warn(err), null
        );
    };
};