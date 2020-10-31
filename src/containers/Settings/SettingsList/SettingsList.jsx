import React from 'react'
import SettingsList from 'react-native-settings-list'
import Icon from '../../../components/Icon/Icon'
import { settingsHeading } from '../../../shared/styles'

const headingWidth = 50
const itemWidth = 70

const Settings = ({ theme, translations, settings, toggleSetting, daysOfWeek, showDialog }) => (
	<SettingsList
		backgroundColor={theme.secondaryBackgroundColor}
		borderColor={theme.secondaryBackgroundColor}
		defaultItemSize={headingWidth}
	>
		<SettingsList.Item
			hasNavArrow={false}
			title={translations.app}
			titleStyle={settingsHeading}
			itemWidth={headingWidth}
			borderHide='Both'
		/>
		<SettingsList.Item
			icon={<Icon name='alarm' color={theme.thirdTextColor} />}
			hasNavArrow={false}
			itemWidth={itemWidth}
			hasSwitch
			switchState={!!settings.timeFormat}
			switchOnValueChange={(value) => toggleSetting(value, 'TimeFormat')}
			titleStyle={{ color: theme.thirdTextColor, fontSize: 16 }}
			title={translations.timeCycle}
		/>
		<SettingsList.Item
			icon={<Icon name='event' color={theme.thirdTextColor} />}
			hasNavArrow
			itemWidth={itemWidth}
			hasSwitch={false}
			titleInfo={daysOfWeek.find((d) => d.value === settings.firstDayOfWeek).name}
			onPress={() => showDialog('showFirstDayOfWeek')}
			titleStyle={{ color: theme.thirdTextColor, fontSize: 16 }}
			title={translations.firstDayOfWeek}
		/>
		<SettingsList.Item
			icon={<Icon name='done' color={theme.thirdTextColor} />}
			hasNavArrow={false}
			itemWidth={itemWidth}
			hasSwitch
			switchState={!!settings.confirmFinishingTask}
			switchOnValueChange={(value) => toggleSetting(value, 'ConfirmFinishingTask')}
			titleStyle={{ color: theme.thirdTextColor, fontSize: 16 }}
			title={translations.confirmFinishing}
		/>
		<SettingsList.Item
			icon={<Icon name='autorenew' color={theme.thirdTextColor} />}
			hasNavArrow={false}
			itemWidth={itemWidth}
			hasSwitch
			switchState={!!settings.confirmRepeatingTask}
			switchOnValueChange={(value) => toggleSetting(value, 'ConfirmRepeatingTask')}
			titleStyle={{ color: theme.thirdTextColor, fontSize: 16 }}
			title={translations.confirmRepeating}
		/>
		<SettingsList.Item
			icon={<Icon name='delete' color={theme.thirdTextColor} />}
			hasNavArrow={false}
			itemWidth={itemWidth}
			hasSwitch
			switchState={!!settings.confirmDeletingTask}
			switchOnValueChange={(value) => toggleSetting(value, 'ConfirmDeletingTask')}
			titleStyle={{ color: theme.thirdTextColor, fontSize: 16 }}
			title={translations.confirmDeleting}
		/>
		<SettingsList.Item
			icon={<Icon name='timelapse' color={theme.thirdTextColor} />}
			hasNavArrow={false}
			itemWidth={itemWidth}
			hasSwitch
			switchState={!!settings.showDeadlineTime}
			switchOnValueChange={(value) => toggleSetting(value, 'ShowDeadlineTime')}
			titleStyle={{ color: theme.thirdTextColor, fontSize: 16 }}
			title={translations.showDeadlineTime}
		/>
		<SettingsList.Item
			hasNavArrow={false}
			title={translations.general}
			titleStyle={settingsHeading}
			itemWidth={headingWidth}
			borderHide='Both'
		/>
		<SettingsList.Item
			icon={<Icon name='g-translate' color={theme.thirdTextColor} />}
			hasNavArrow
			itemWidth={itemWidth}
			hasSwitch={false}
			titleInfo={settings.lang}
			onPress={() => showDialog('showLanguages')}
			titleStyle={{ color: theme.thirdTextColor, fontSize: 16 }}
			title={translations.language}
		/>
		<SettingsList.Item
			icon={<Icon name='view-compact' color={theme.thirdTextColor} />}
			hasNavArrow={false}
			itemWidth={itemWidth}
			hasSwitch
			switchState={!!settings.hideTabView}
			switchOnValueChange={(value) => toggleSetting(value, 'HideTabView')}
			titleStyle={{ color: theme.thirdTextColor, fontSize: 16 }}
			title={translations.hideTabView}
		/>
	</SettingsList>
)

export default Settings
