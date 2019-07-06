import * as actionTypes from './actionTypes';
import { SQLite } from 'expo-sqlite';

const db = SQLite.openDatabase('maker.db');

export const onInitCategories = (categories) => {
    return {
        type: actionTypes.INIT_CATEGORIES,
        categories
    }
};

export const initCategories = () => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('select * from categories', [], (_, {rows}) => {
                    dispatch(onInitCategories(rows._array));
                });
            }, (err) => console.warn(err), null
        );
    };
};

export const saveCategory = (category, callback) => {
    return dispatch => {
        if (category.id !== false) {
            db.transaction(
                tx => {
                    tx.executeSql(`update categories set name = ? where id = ?;`, [category.name, category.id], () => {
                        dispatch(initCategories(), callback());
                    });
                }, (err) => console.warn(err)
            );
        } else {
            db.transaction(
                tx => {
                    tx.executeSql('insert into categories (name) values (?)', [category.name], () => {
                        dispatch(initCategories(), callback());
                    });
                }, (err) => console.warn(err)
            );
        }
    };
};

export const removeCategory = (id) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('delete from categories where id = ?', [id], () => {
                    dispatch(initCategories());
                });
            }, (err) => console.warn(err), null
        );
    };
};