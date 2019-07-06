import React, {Component} from 'react';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import {ActivityIndicator, NativeModules, StyleSheet, View} from 'react-native';
import { ThemeContext, getTheme } from 'react-native-material-ui';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import Router from './router';
import tasksReducer from './src/store/reducers/tasks';
import cateReducer from './src/store/reducers/categories';
import themeReducer from './src/store/reducers/theme';
import profileReducer from './src/store/reducers/profile';
import settingsReducer from './src/store/reducers/settings';
import {initDatabase, initTheme} from './db';

const UIManager = NativeModules.UIManager;

const rootReducer = combineReducers({
    tasks: tasksReducer,
    categories: cateReducer,
    theme: themeReducer,
    profile: profileReducer,
    settings: settingsReducer
});

const store = createStore(rootReducer, (
    applyMiddleware(thunk)
));

class App extends Component {
    state = {
        uiTheme: false,
        ready: false
    };

    componentDidMount() {
        initDatabase(() => {
            initTheme(state => {
                this.setState(state);
            })
        })
    }

    componentWillMount() {
        if (UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }

    render() {
        const { uiTheme, ready } = this.state;

        return (
            ready ?
            <Provider store={store}>
                <ThemeContext.Provider value={getTheme(uiTheme)}>
                    <Router />
                </ThemeContext.Provider>
            </Provider> :
            <View style={[styles.container, styles.horizontal]}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 50
    }
});

export default App;