import * as actionTypes from './actionTypes';
import {SQLite} from 'expo-sqlite';
import {initCategories} from "./categories";

const db = SQLite.openDatabase('maker.db');

export const onInitLists = (lists) => {
    return {
        type: actionTypes.INIT_LISTS,
        lists
    }
};

export const initLists = (callback = () => null) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('select * from lists', [], (_, {rows}) => {
                    callback();
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
                tx.executeSql('select * from quckly_tasks where list_id = ?', [id], (_, {rows}) => {
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
                tx.executeSql('select * from quckly_tasks where id = ?', [id], (_, {rows}) => {
                    callback(rows._array[0]);
                });
            }, (err) => console.log(err)
        );
    };
};

export const saveList = (list, quicklyTasks, callback) => {
    return dispatch => {
        if (list.id !== false) {
            db.transaction(
                tx => {
                    tx.executeSql(`update lists
                                   set name = ?
                                   where id = ?;`, [list.name, list.id], () => {
                        dispatch(saveQuicklyTasks(list.id, quicklyTasks), callback());
                    });
                }, (err) => console.log(err)
            );
        } else {
            db.transaction(
                tx => {
                    tx.executeSql('insert into lists (name) values (?)', [list.name], (_, {rows}) => {
                        dispatch(saveQuicklyTasks(rows._array[0].id), callback())
                    });
                }, (err) => console.log(err)
            );
        }
    };
};

export const saveQuicklyTasks = (list_id, quicklyTasks) => {
    return dispatch => {
        quicklyTasks.map(task => {
            db.transaction(
                tx => {
                    tx.executeSql('insert into quickly_tasks ', [task.name, list_id]);
                }, (err) => console.log(err)
            );
        })
    }
};

export const saveQuicklyTask = (quicklyTask, list_id, callback) => {
    return dispatch => {
        if (quicklyTask.id !== false) {
            db.transaction(
                tx => {
                    tx.executeSql(`update quickly_tasks
                                   set name = ?
                                   where id = ?;`, [quicklyTask.name, quicklyTask.id], () => {
                        dispatch(callback())
                    });
                }, (err) => console.log(err)
            );
        } else {
            db.transaction(
                tx => {
                    tx.executeSql('insert into quickly_tasks (name, list_id) values (?,?)', [quicklyTask.name, list_id], (_, {rows}) => {
                        dispatch(callback())
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
                tx.executeSql('delete from lists where id = ?', [id], () => {
                    dispatch(removeQuicklyTasks(id));
                });
            }, (err) => console.log(err)
        );
    };
};

export const removeQuicklyTask = (id) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('delete from quickly_tasks where id = ?', [id], () => {
                    dispatch(initLists());
                });
            }, (err) => console.log(err)
        );
    };
};

export const removeQuicklyTasks = (id) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('delete from quickly_tasks where list_id = ?', [id], () => {
                    dispatch(initLists());
                });
            }, (err) => console.log(err)
        );
    };
};