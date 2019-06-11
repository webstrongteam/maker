import * as actionTypes from './actionTypes';
import {SQLite} from "expo";

const db = SQLite.openDatabase('maker.db');

export const onInitCategories = (categories) => {
    return {
        type: actionTypes.INIT_CATEGORIES,
        categories
    }
};

export const changeCategoryName = (name) => {
    return {
        type: actionTypes.CHANGE_CATEGORY_NAME,
        name
    }
};

export const onSetCategory = (category) => {
    return {
        type: actionTypes.SET_CATEGORY,
        category
    }
};

export const onSaveCategory = (categories) => {
    return {
        type: actionTypes.SAVE_CATEGORY,
        categories
    }
};

export const onRemoveCategory = (categories) => {
    return {
        type: actionTypes.REMOVE_CATEGORY,
        categories
    }
};

export const defaultCategory = () => {
    return {
        type: actionTypes.DEFAULT_CATEGORY
    }
};

export const initCategories = () => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('select * from categories', [], (_, {rows}) => {
                    dispatch(onInitCategories(rows._array));
                });
            }, null, null
        );
    };
};

export const setCategory = (id) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('select * from categories where id = ?', [id], (_, {rows}) => {
                    dispatch(onSetCategory(rows._array[0]));
                });
            }, null, null
        );
    };
};

export const saveCategory = (category) => {
    if (category.name.trim() === "") return false;
    return dispatch => {
        if (category.id) {
            db.transaction(
                tx => {
                    tx.executeSql(`update categories set name = ? where id = ?;`, [category.name, category.id]);
                    tx.executeSql('select * from categories', [], (_, {rows}) => {
                        dispatch(onSaveCategory(rows._array));
                    });
                }, null, null
            );
        } else {
            db.transaction(
                tx => {
                    tx.executeSql('insert into categories (name) values (?)', [category.name]);
                    tx.executeSql('select * from categories', [], (_, {rows}) => {
                        dispatch(onSaveCategory(rows._array));
                    });
                }, null, null
            );
        }
    };
};

export const removeCategory = (id) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('delete from categories where id = ?', [id]);
                tx.executeSql('select * from categories', [], (_, {rows}) => {
                    dispatch(onRemoveCategory(rows._array));
                });
            }, null, null
        );
    };
};