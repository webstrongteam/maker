import React from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';

import ToDo from "./src/container/ToDo/ToDo";
import ConfigTask from "./src/container/ConfigTask/ConfigTask";
import CategoriesList from './src/container/CategoriesList/CategoriesList';
import Drawer from './src/container/Drawer/Drawer';

const MainNavigator = createStackNavigator(
    {
        ToDo: {screen: ToDo},
        ConfigTask: {screen: ConfigTask},
        CategoriesList: {screen: CategoriesList},
        Drawer: {screen: Drawer}
    },
    {
        initialRouteName: 'ToDo',
        headerMode: 'none',
    },
);

const router = createAppContainer(MainNavigator);

export default router;