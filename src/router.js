import React from 'react';
import {createAppContainer, createStackNavigator} from 'react-navigation';
// Components
import ToDo from "./container/ToDo/ToDo";
import ConfigTask from "./container/Tasks/ConfigTask/ConfigTask";
import QuicklyTaskList from './container/QuicklyList/QuicklyTaskList';
import CategoriesList from './container/Categories/CategoriesList';
import Drawer from './container/Drawer/Drawer';
import Themes from './container/Themes/Themes';
import Theme from './container/Themes/Theme';
import Profile from './container/Profile/Profile';
import Settings from './container/Settings/Settings';
import Backups from './container/Backup/Backup';
import About from './components/About/About';

const MainNavigator = createStackNavigator(
    {
        ToDo: {screen: ToDo},
        ConfigTask: {screen: ConfigTask},
        QuicklyTaskList: {screen: QuicklyTaskList},
        CategoriesList: {screen: CategoriesList},
        Profile: {screen: Profile},
        Drawer: {screen: Drawer},
        Themes: {screen: Themes},
        Theme: {screen: Theme},
        Settings: {screen: Settings},
        Backups: {screen: Backups},
        About: {screen: About}
    },
    {
        initialRouteName: 'ToDo',
        headerMode: 'none',
    },
);

const router = createAppContainer(MainNavigator);

export default router;