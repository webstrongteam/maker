import * as actionTypes from './actionTypes';
import { SQLite } from 'expo-sqlite';
import { convertNumberToDate } from '../../shared/utility';
import moment from 'moment';

const db = SQLite.openDatabase('maker.db');

export const onInitToDo = (tasks, finished) => {
    return {
        type: actionTypes.INIT_TODO,
        tasks,
        finished
    }
};

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

export const initToDo = () => {
    let tasks;
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('select * from tasks', [], (_, {rows}) => {
                    tasks = rows._array;
                });
                tx.executeSql('select * from finished', [], (_, {rows}) => {
                    dispatch(onInitToDo(tasks, rows._array));
                });
            }, (err) => console.log(err)
        );
    };
};

export const initTasks = () => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('select * from tasks', [], (_, {rows}) => {
                    dispatch(onInitTasks(rows._array));
                });
            }, (err) => console.log(err)
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
            }, (err) => console.log(err)
        );
    };
};

export const saveTask = (task) => {
    return dispatch => {
        if (task.id) {
            db.transaction(
                tx => {
                    tx.executeSql(`update tasks set name = ?, description = ?, date = ?, category = ?, priority = ?, repeat = ? where id = ?;`, [task.name, task.description, task.date, task.category, task.priority, task.repeat, task.id], () => {
                        dispatch(initTasks());
                    });
                }, (err) => console.log(err)
            );
        } else {
            db.transaction(
                tx => {
                    tx.executeSql('insert into tasks (name, description, date, category, priority, repeat) values (?,?,?,?,?,?)', [task.name, task.description, task.date, task.category, task.priority, task.repeat], () => {
                        dispatch(initTasks());
                    });
                }, (err) => console.log(err)
            );
        }
    };
};

export const finishTask = (task, endTask) => {
    let nextDate = task.date;
    const dateFormat = task.date.length > 12 ? 'DD-MM-YYYY - HH:mm' : 'DD-MM-YYYY';

    if (+task.repeat === parseInt(task.repeat, 10)) { // Other repeat
        nextDate = moment(nextDate, dateFormat).add(+task.repeat.substring(1), convertNumberToDate(+task.repeat[0]));
    }
    else if (task.repeat === 'onceDay') nextDate = moment(nextDate, dateFormat).add(1, 'days');
    else if (task.repeat === 'onceDayMonFri') {
        if (moment(task.date, dateFormat).day() === 5) { // Friday
            nextDate = moment(nextDate, dateFormat).add(3, 'days');
        }
        else if (moment(task.date, dateFormat).day() === 6) { // Saturday
            nextDate = moment(nextDate, dateFormat).add(2, 'days');
        } else {
            nextDate = moment(nextDate, dateFormat).add(1, 'days');
        }
    }
    else if (task.repeat === 'onceDaySatSun') {
        if (moment(task.date, dateFormat).day() === 6) { // Saturday
            nextDate = moment(nextDate, dateFormat).add(1, 'days');
        }
        else if (moment(task.date, dateFormat).day() === 0) { // Sunday
            nextDate = moment(nextDate, dateFormat).add(6, 'days');
        }
        else { // Other day
            nextDate = moment(nextDate, dateFormat).day(6);
        }
    }
    else if (task.repeat === 'onceWeek') nextDate = moment(nextDate, dateFormat).add(1, 'week');
    else if (task.repeat === 'onceMonth') nextDate = moment(nextDate, dateFormat).add(1, 'month');
    else if (task.repeat === 'onceYear') nextDate = moment(nextDate, dateFormat).add(1, 'year');

    nextDate = moment(nextDate, dateFormat).format(dateFormat);

    return dispatch => {
        if (task.repeat === 'noRepeat' || endTask) {
            db.transaction(
                tx => {
                    tx.executeSql('delete from tasks where id = ?', [task.id]);
                    tx.executeSql('insert into finished (name, description, date, category, priority, repeat, finish) values (?,?,?,?,?,?,1)', [task.name, task.description, task.date, task.category, task.priority, task.repeat], () => {
                        dispatch(initToDo());
                    });
                }, (err) => console.log(err)
            );
        } else {
            db.transaction(
                tx => {
                    tx.executeSql(`update tasks set date = ? where id = ?;`, [nextDate, task.id], () => {
                        dispatch(initTasks());
                    });
                }, (err) => console.log(err)
            );
        }
    };
};

export const undoTask = (task) => {
    return dispatch => {
        db.transaction(
            tx => {
                tx.executeSql('delete from finished where id = ?', [task.id]);
                tx.executeSql('insert into tasks (name, description, date, category, priority, repeat) values (?,?,?,?,?,?)', [task.name, task.description, task.date, task.category, task.priority, task.repeat], () => {
                    dispatch(initToDo());
                });
            }, (err) => console.log(err)
        );
    };
};

export const removeTask = (task, finished = true) => {
    return dispatch => {
        if (finished) {
            db.transaction(
                tx => {
                    tx.executeSql('delete from finished where id = ?', [task.id], () => {
                        dispatch(initFinished());
                    });
                }, (err) => console.log(err)
            );
        } else {
            db.transaction(
                tx => {
                    tx.executeSql('delete from tasks where id = ?', [task.id], () => {
                        dispatch(initTasks());
                    });
                }, (err) => console.log(err)
            );
        }
    };
};