import React, {Component} from 'react';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import axios from 'axios';
import Router from './router';
import todoReducer from './src/store/reducers/todo';
import authReducer from './src/store/reducers/auth';
import thunk from 'redux-thunk';
import { ThemeContext, getTheme } from 'react-native-material-ui';

const uiTheme = {
    palette: {
        primaryColor: '#f4511e',
        accentColor: '#f4133f',
    },
};

axios.defaults.baseURL = "https://todo-56c42.firebaseio.com/"; // Default Axios URL

const rootReducer = combineReducers({
    todo: todoReducer,
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