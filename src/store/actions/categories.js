import * as actionTypes from './actionTypes';
import {openDatabase} from 'expo-sqlite';

const db = openDatabase('maker.db');

export const onInitCategories = (categories) => {
    return {
        type: actionTypes.INIT_CATEGORIES,
        categories
    }
};

export const initCategories = (callback = () => null) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('select * from categories', [], (_, {rows}) => {
                    callback();
                    dispatch(onInitCategories(rows._array));
                });
            }, (err) => console.log(err)
        );
    };
};

export const initCategory = (id, callback = () => null) => {
    return () => {
        db.transaction(
            tx => {
                tx.executeSql('select * from categories where id = ?', [id], (_, {rows}) => {
                    callback(rows._array[0]);
                });
            }, (err) => console.log(err)
        );
    };
};

export const saveCategory = (category, callback) => {
    return dispatch => {
        if (category.id !== false) {
            db.transaction(
                tx => {
                    tx.executeSql(`update categories
                                   set name = ?
                                   where id = ?;`, [category.name, category.id], () => {
                        callback();
                    });
                }, (err) => console.log(err)
            );
        } else {
            db.transaction(
                tx => {
                    tx.executeSql('insert into categories (name) values (?)', [category.name], (_, {insertId}) => {
                        callback({id: insertId, name: category.name});
                    });
                }, (err) => console.log(err)
            );
        }
    };
};

export const removeCategory = (id, callback = () => null) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('delete from categories where id = ?', [id], () => {
                    callback();
                    dispatch(initCategories());
                });
            }, (err) => console.log(err)
        );
    };
};