import React from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import Auth from "./src/container/Auth/Auth";
import ToDo from "./src/container/ToDo/ToDo";
import Drawer from './src/container/Drawer/Drawer';

const MainNavigator = createStackNavigator(
    {
        Auth: {screen: Auth},
        ToDo: {screen: ToDo},
        Drawer: {screen: Drawer}
    },
    {
        initialRouteName: 'ToDo'
    },
);

const router = createAppContainer(MainNavigator);

export default router;