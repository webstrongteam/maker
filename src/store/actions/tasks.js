import * as actionTypes from './actionTypes';
import { SQLite } from 'expo';

const db = SQLite.openDatabase('maker.db');

export const onInitTasks = (tasks) => {
    return {
        type: actionTypes.INIT_TASKS,
        tasks
    }
};

export const onInitFinished = (tasks) => {
    return {
        type: actionTypes.INIT_FINISHED,
        tasks
    }
};

export const changeName = (name) => {
    return {
        type: actionTypes.CHANGE_TASK_NAME,
        name
    }
};

export const changeDescription = (description) => {
    return {
        type: actionTypes.CHANGE_TASK_DESCRIPTION,
        description
    }
};

export const changeDate = (date) => {
    return {
        type: actionTypes.CHANGE_TASK_DATE,
        date
    }
};

export const changeCategory = (category) => {
    return {
        type: actionTypes.CHANGE_TASK_CATEGORY,
        category
    }
};

export const changePriority = (priority) => {
    return {
        type: actionTypes.CHANGE_TASK_PRIORITY,
        priority
    }
};

export const onSetTask = (task) => {
    return {
        type: actionTypes.SET_TASK,
        task
    }
};

export const onSaveTask = (tasks) => {
    return {
        type: actionTypes.SAVE_TASK,
        tasks
    };
};

export const onRemoveTask = (tasks, finished) => {
    return {
        type: actionTypes.REMOVE_TASK,
        tasks,
        finished
    }
};

export const onUndoTask = (tasks, finished) => {
    return {
        type: actionTypes.UNDO_TASK,
        tasks,
        finished
    }
};

export const defaultTask = () => {
    return {
        type: actionTypes.DEFAULT_TASK
    }
};

export const initTasks = () => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('select * from tasks', [], (_, {rows}) => {
                    dispatch(onInitTasks(rows._array));
                });
            }, null, null
        );
    };
};

export const initFinished = () => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('select * from finished', [], (_, {rows}) => {
                    dispatch(onInitFinished(rows._array));
                });
            }, null, null
        );
    };
};

export const setTask = (id) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('select * from tasks where id = ?', [id], (_, {rows}) => {
                    dispatch(onSetTask(rows._array[0]));
                });
            }, null, null
        );
    };
};

export const saveTask = (task) => {
    if (task.name.trim() === "") return false;
    return dispatch => {
        if (task.id) {
            db.transaction(
                tx => {
                    tx.executeSql(`update tasks set name = ?, description = ?, date = ?, category = ?, priority = ? where id = ?;`, [task.name, task.description, task.date, task.category, task.priority, task.id]);
                    tx.executeSql('select * from tasks', [], (_, {rows}) => {
                        dispatch(onSaveTask(rows._array));
                    });
                }, null, null
            );
        } else {
            db.transaction(
                tx => {
                    tx.executeSql('insert into tasks (name, description, date, category, priority) values (?,?,?,?,?)', [task.name, task.description, task.date, task.category, task.priority]);
                    tx.executeSql('select * from tasks', [], (_, {rows}) => {
                        dispatch(onSaveTask(rows._array));
                    });
                }, null, null
            );
        }
    };
};

export const removeTask = (task) => {
    let tasks = null;
    let finished = null;
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('delete from tasks where id = ?', [task.id]);
                tx.executeSql('insert into finished (name, description, date, category, priority, finish) values (?,?,?,?,?,1)', [task.name, task.description, task.date, task.category, task.priority]);
                tx.executeSql('select * from tasks', [], (_, {rows}) => {
                    tasks = rows._array;
                });
                tx.executeSql('select * from finished', [], (_, {rows}) => {
                    finished = rows._array;
                    dispatch(onRemoveTask(tasks, finished));
                });
            }, null, null
        );
    };
};

export const undoTask = (task) => {
    let tasks = null;
    let finished = null;
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('delete from finished where id = ?', [task.id]);
                tx.executeSql('insert into tasks (name, description, date, category, priority) values (?,?,?,?,?)', [task.name, task.description, task.date, task.category, task.priority]);
                tx.executeSql('select * from tasks', [], (_, {rows}) => {
                    tasks = rows._array;
                });
                tx.executeSql('select * from finished', [], (_, {rows}) => {
                    finished = rows._array;
                    dispatch(onUndoTask(tasks, finished));
                });
            }, null, null
        );
    };
};