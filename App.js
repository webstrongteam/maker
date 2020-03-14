import React, {Component} from 'react';
import {ActivityIndicator, NativeModules, View} from 'react-native';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import {getTheme, ThemeContext} from 'react-native-material-ui';
import {activity} from './src/shared/styles';
import {initApp, initTheme} from './src/db';
import {loadAsync} from "expo-font";
import Router from './src/router';
import {Provider} from 'react-redux';
import thunk from 'redux-thunk';
import tasksReducer from './src/store/reducers/tasks';
import listsReducer from './src/store/reducers/lists';
import cateReducer from './src/store/reducers/categories';
import themeReducer from './src/store/reducers/theme';
import profileReducer from './src/store/reducers/profile';
import settingsReducer from './src/store/reducers/settings';
import configReducer from './src/store/reducers/config';
import {setCustomText} from 'react-native-global-props';

const UIManager = NativeModules.UIManager;

const rootReducer = combineReducers({
    tasks: tasksReducer,
    lists: listsReducer,
    categories: cateReducer,
    theme: themeReducer,
    profile: profileReducer,
    settings: settingsReducer,
    config: configReducer
});

export const store = createStore(rootReducer, (
    applyMiddleware(thunk)
));

class App extends Component {
    state = {
        uiTheme: false,
        ready: false
    };

    async componentDidMount() {
        await loadAsync({
            'Ubuntu': require('./src/assets/fonts/Ubuntu.ttf')
        });

        initApp(() => {
            initTheme(state => {
                this.setState(state);
            })
        })
    }

    UNSAFE_componentWillMount() {
        if (UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }

    render() {
        const {uiTheme, ready} = this.state;
        // Hide yellow boxes
        console.disableYellowBox = true;

        // Setting default styles for all Text components.
        const customTextProps = {
            style: {fontFamily: 'Ubuntu'}
        };
        setCustomText(customTextProps);

        return (
            ready ?
                <Provider store={store}>
                    <ThemeContext.Provider value={getTheme(uiTheme)}>
                        <Router/>
                    </ThemeContext.Provider>
                </Provider> :
                <View style={activity}>
                    <ActivityIndicator size="large" color="#f4511e"/>
                </View>
        );
    }
}

export default App;