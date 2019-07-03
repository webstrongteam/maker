import React from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';

import ToDo from "./src/container/ToDo/ToDo";
import ConfigTask from "./src/container/ConfigTask/ConfigTask";
import CategoriesList from './src/container/CategoriesList/CategoriesList';
import Drawer from './src/container/Drawer/Drawer';
import Themes from './src/container/Themes/Themes';
import Theme from './src/container/Themes/Theme';
import Profile from './src/container/Profile/Profile';
import About from './src/components/About/About';
import Settings from './src/container/Settings/Settings';

const MainNavigator = createStackNavigator(
    {
        ToDo: {screen: ToDo},
        ConfigTask: {screen: ConfigTask},
        CategoriesList: {screen: CategoriesList},
        Profile: {screen: Profile},
        Drawer: {screen: Drawer},
        Themes: {screen: Themes},
        Theme: {screen: Theme},
        About: {screen: About},
        Settings: {screen: Settings}
    },
    {
        initialRouteName: 'ToDo',
        headerMode: 'none',
    },
);

const router = createAppContainer(MainNavigator);

export default router;