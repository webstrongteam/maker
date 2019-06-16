import React, {Component} from 'react';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import axios from 'axios';
import Router from './router';
import tasksReducer from './src/store/reducers/tasks';
import cateReducer from './src/store/reducers/categories';
import settingsReducer from './src/store/reducers/settings';
import authReducer from './src/store/reducers/auth';
import thunk from 'redux-thunk';
import { SQLite } from 'expo';
import { ThemeContext, getTheme } from 'react-native-material-ui';

const uiTheme = {
    palette: {
        primaryColor: '#f4511e',
        accentColor: '#f4133f',
    },
};

// Init DB
const db = SQLite.openDatabase('maker.db');
db.transaction(tx => {
/*   tx.executeSql(
        'DROP TABLE IF EXISTS tasks;'
    );
    tx.executeSql(
        'DROP TABLE IF EXISTS finished;'
    );
    tx.executeSql(
        'DROP TABLE IF EXISTS categories;'
    );
    tx.executeSql(
        'DROP TABLE IF EXISTS settings;'
    );*/
    tx.executeSql(
        'create table if not exists tasks (id integer primary key not null, name text, description text, date text, category text, priority text, repeat text);'
    );
    tx.executeSql(
        'create table if not exists finished (id integer primary key not null, name text, description text, date text, category text, priority text, repeat text, finish integer);'
    );
    tx.executeSql(
        'create table if not exists categories (id integer primary key not null, name text);'
    );
    tx.executeSql(
        'create table if not exists settings (id integer primary key not null, sorting text, sortingType text);'
    );
    tx.executeSql(
        "insert into categories (id, name) values (0, 'Default');"
    );
    tx.executeSql(
        "INSERT INTO settings (id, sorting, sortingType) values (0, 'byAZ', 'ASC');"
    );
});

axios.defaults.baseURL = "https://todo-56c42.firebaseio.com/"; // Default Axios URL

const rootReducer = combineReducers({
    tasks: tasksReducer,
    categories: cateReducer,
    settings: settingsReducer,
    auth: authReducer
});

const store = createStore(rootReducer, (
    applyMiddleware(thunk)
));

export default class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <ThemeContext.Provider value={getTheme(uiTheme)}>
                    <Router />
                </ThemeContext.Provider>
            </Provider>
        );
    }
}