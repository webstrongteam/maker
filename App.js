import React, {Component} from 'react';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import {ActivityIndicator, NativeModules, View} from 'react-native';
import {getTheme, ThemeContext} from 'react-native-material-ui';
import {activity} from './src/shared/styles';
import {Provider} from 'react-redux';
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
        const {uiTheme, ready} = this.state;

        return (
            ready ?
            <Provider store={store}>
                <ThemeContext.Provider value={getTheme(uiTheme)}>
                    <Router/>
                </ThemeContext.Provider>
            </Provider> :
            <View style={activity}>
                <ActivityIndicator size="large" color="#0000ff"/>
            </View>
        );
    }
}

export default App;