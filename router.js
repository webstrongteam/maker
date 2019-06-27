import React from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';

import ToDo from "./src/container/ToDo/ToDo";
import ConfigTask from "./src/container/ConfigTask/ConfigTask";
import CategoriesList from './src/container/CategoriesList/CategoriesList';
import Drawer from './src/container/Drawer/Drawer';
import Themes from './src/container/Themes/Themes';
import Theme from './src/container/Themes/Theme';
import Settings from './src/container/Settings/Settings';

const MainNavigator = createStackNavigator(
    {
        ToDo: {screen: ToDo},
        ConfigTask: {screen: ConfigTask},
        CategoriesList: {screen: CategoriesList},
        Drawer: {screen: Drawer},
        Themes: {screen: Themes},
        Theme: {screen: Theme},
        Settings: {screen: Settings}
    },
    {
        initialRouteName: 'ToDo',
        headerMode: 'none',
    },
);

const router = createAppContainer(MainNavigator);

export default router;