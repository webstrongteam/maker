import React from 'react';
import {createAppContainer, createStackNavigator} from 'react-navigation';

// Components
import ToDo from "./src/container/ToDo/ToDo";
import ConfigTask from "./src/container/Tasks/ConfigTask/ConfigTask";
import QuicklyTaskList from './src/container/QuicklyList/QuicklyTaskList';
import CategoriesList from './src/container/Categories/CategoriesList/CategoriesList';
import Drawer from './src/container/Drawer/Drawer';
import Themes from './src/container/Themes/Themes';
import Theme from './src/container/Themes/Theme';
import Profile from './src/container/Profile/Profile';
import Settings from './src/container/Settings/Settings';
import Backups from './src/container/Backup/Backup';
import About from './src/components/About/About';

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