import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
// Components
import Main from './containers/Main/Main'
import ConfigTask from './containers/Tasks/ConfigTask/ConfigTask'
import QuicklyTaskList from './containers/QuicklyList/QuicklyTaskList/QuicklyTaskList'
import CategoriesList from './containers/Categories/CategoriesList'
import Drawer from './containers/Drawer/Drawer'
import Themes from './containers/Themes/Themes'
import Theme from './containers/Themes/Theme/Theme'
import Profile from './containers/Profile/Profile'
import Settings from './containers/Settings/Settings'
import Backups from './containers/Backup/Backup'
import Report from './containers/Report/Report'
import About from './containers/About/About'

const MainNavigator = createStackNavigator(
	{
		Main: { screen: Main },
		ConfigTask: { screen: ConfigTask },
		QuicklyTaskList: { screen: QuicklyTaskList },
		CategoriesList: { screen: CategoriesList },
		Profile: { screen: Profile },
		Drawer: { screen: Drawer },
		Themes: { screen: Themes },
		Theme: { screen: Theme },
		Settings: { screen: Settings },
		Backups: { screen: Backups },
		Report: { screen: Report },
		About: { screen: About },
	},
	{
		initialRouteName: 'Main',
		headerMode: 'none',
	},
)

const router = createAppContainer(MainNavigator)

export default router
