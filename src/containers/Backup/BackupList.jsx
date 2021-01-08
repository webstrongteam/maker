import React from 'react'
import { ScrollView, View } from 'react-native'
import { IconToggle, ListItem } from 'react-native-material-ui'
import { listRow, shadow, flex } from '../../shared/styles'
import EmptyList from '../../components/EmptyList/EmptyList'

const BackupList = ({ backups, theme, showDialog, renameBackup, shareBackup, translations }) => (
	<View style={flex}>
		<ScrollView style={{ paddingTop: 5 }}>
			{backups.length ? (
				backups.map((name, index) => (
					<ListItem
						dense
						key={index}
						onPress={() => showDialog('showBackupAlert', name)}
						style={{
							container: {
								...shadow,
								...listRow,
								backgroundColor: theme.primaryBackgroundColor,
							},
						}}
						rightElement={
							<View style={{ flexDirection: 'row' }}>
								<IconToggle
									style={{ container: { marginRight: -10 } }}
									onPress={() => renameBackup(name)}
									color={theme.undoIconColor}
									name='edit'
								/>
								<IconToggle
									style={{ container: { marginRight: -7 } }}
									onPress={() => shareBackup(name)}
									color={theme.undoIconColor}
									name='share'
								/>
								<IconToggle
									onPress={() => showDialog('showConfirmDelete', name)}
									color={theme.warningColor}
									name='delete'
								/>
							</View>
						}
						centerElement={{
							primaryText: name,
						}}
					/>
				))
			) : (
				<EmptyList color={theme.thirdTextColor} text={translations.emptyList} />
			)}
		</ScrollView>
	</View>
)

export default BackupList
