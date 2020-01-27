import * as actionTypes from './actionTypes';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('maker.db');

export const onInitLists = (lists) => {
    return {
        type: actionTypes.INIT_LISTS,
        lists
    }
};

export const initLists = () => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('select * from lists', [], (_, {rows}) => {
                    dispatch(onInitLists(rows._array));
                });
            }, (err) => console.log(err)
        );
    };
};

export const initList = (id, callback = () => null) => {
    return () => {
        db.transaction(
            tx => {
                tx.executeSql('select * from quickly_tasks where list_id = ?', [id], (_, {rows}) => {
                    callback(rows._array);
                });
            }, (err) => console.log(err)
        );
    };
};

export const initQuicklyTask = (id, callback = () => null) => {
    return () => {
        db.transaction(
            tx => {
                tx.executeSql('select * from quickly_tasks where id = ?', [id], (_, {rows}) => {
                    callback(rows._array[0]);
                });
            }, (err) => console.log(err)
        );
    };
};

export const saveList = (list, callback) => {
    return dispatch => {
        if (list.id !== false) {
            db.transaction(
                tx => {
                    tx.executeSql(`update lists
                                   set name = ?
                                   where id = ?;`, [list.name, list.id], () => {
                        dispatch(initLists(), callback(list));
                    });
                }, (err) => console.log(err)
            );
        } else {
            db.transaction(
                tx => {
                    tx.executeSql('insert into lists (name) values (?)', [list.name]);
                    tx.executeSql('select * from lists ORDER BY id DESC', [], (_, {rows}) => {
                        dispatch(initLists(), callback(rows._array[0]));
                    });
                }, (err) => console.log(err)
            );
        }
    };
};

export const saveQuicklyTask = (quicklyTask, list_id, callback) => {
    return () => {
        if (quicklyTask.id !== false) {
            db.transaction(
                tx => {
                    tx.executeSql(`update quickly_tasks
                                   set name = ?
                                   where id = ?;`, [quicklyTask.name, quicklyTask.id], () => {
                        callback();
                    });
                }, (err) => console.log(err)
            );
        } else {
            db.transaction(
                tx => {
                    tx.executeSql('insert into quickly_tasks (name, list_id) values (?,?)', [quicklyTask.name, list_id], () => {
                        callback();
                    });
                }, (err) => console.log(err)
            );
        }
    };
};

export const removeList = (id) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('delete from quickly_tasks where list_id = ?', [id]);
                tx.executeSql('delete from lists where id = ?', [id], () => {
                    dispatch(initLists());
                });
            }, (err) => console.log(err)
        );
    };
};

export const removeQuicklyTask = (id, callback) => {
    return () => {
        db.transaction(
            tx => {
                tx.executeSql('delete from quickly_tasks where id = ?', [id], () => {
                    callback();
                });
            }, (err) => console.log(err)
        );
    };
};