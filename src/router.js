import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
// Components
import ToDo from './containers/ToDo/ToDo'
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
import About from './components/About/About'

const MainNavigator = createStackNavigator(
	{
		ToDo: { screen: ToDo },
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
		initialRouteName: 'ToDo',
		headerMode: 'none',
	},
)

const router = createAppContainer(MainNavigator)

export default router
