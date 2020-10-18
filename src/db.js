import { openDatabase } from 'expo-sqlite'
import { AsyncStorage, NativeModules, Platform } from 'react-native'

export const VERSION = '2.5.0' // APP VERSION
const db = openDatabase('maker.db', VERSION)

const getLocale = () => {
	const locale =
		Platform.OS === 'ios'
			? NativeModules.SettingsManager.settings.AppleLocale
			: NativeModules.I18nManager.localeIdentifier
	if (locale === 'pl_PL') {
		return 'pl'
	}
	return 'en'
}

export const initDatabase = (callback) => {
	db.transaction(
		(tx) => {
			// tx.executeSql(
			//     'DROP TABLE IF EXISTS tasks;'
			// );
			tx.executeSql(
				'create table if not exists categories (id integer primary key not null, name text);',
			)
			tx.executeSql(
				'create table if not exists tasks (id integer primary key not null, name text, description text, date text, category text, priority text, repeat text, event_id text default null, notification_id text default null);',
			)
			tx.executeSql(
				'create table if not exists finished (id integer primary key not null, name text, description text, date text, category text, priority text, repeat text, finish integer);',
			)
			tx.executeSql(
				'create table if not exists lists (id integer primary key not null, name text);',
			)
			tx.executeSql(
				'create table if not exists quickly_tasks (id integer primary key not null, name text, list_id integer not null, order_nr integer DEFAULT 0);',
			)
			tx.executeSql(
				'create table if not exists themes (id integer primary key not null, name text, primaryColor text, primaryBackgroundColor text, secondaryBackgroundColor text, primaryTextColor text, secondaryTextColor text, thirdTextColor text, warningColor text, doneIconColor text, undoIconColor text, lowColor text, mediumColor text, highColor text);',
			)
			tx.executeSql(
				'create table if not exists profile (id integer primary key not null, name text, avatar text, endedTask integer);',
			)
			tx.executeSql(
				'create table if not exists settings (id integer primary key not null, sorting text, sortingType text, timeFormat integer, firstDayOfWeek text, confirmFinishingTask integer, confirmRepeatingTask integer, confirmDeletingTask integer, version text, hideTabView integer DEFAULT 0, theme integer DEFAULT 0 REFERENCES themes(id) ON DELETE SET DEFAULT, lang text);',
			)
			tx.executeSql('INSERT OR IGNORE INTO categories (id, name) values (0, ?);', [
				getLocale() === 'pl' ? 'Domyślna' : 'Default',
			])
			tx.executeSql(
				"INSERT OR IGNORE INTO themes (id, name, primaryColor, primaryBackgroundColor, secondaryBackgroundColor, primaryTextColor, secondaryTextColor, thirdTextColor, warningColor, doneIconColor, undoIconColor, lowColor, mediumColor, highColor) values (0, 'Default', '#f4511e', '#ffffff', '#e5e5e5', '#ffffff', '#000000', '#5e5e5e', '#d9534f', '#26b596', '#5bc0de', '#26b596', '#cec825', '#f4511e');",
			)
			tx.executeSql(
				"INSERT OR IGNORE INTO themes (id, name, primaryColor, primaryBackgroundColor, secondaryBackgroundColor, primaryTextColor, secondaryTextColor, thirdTextColor, warningColor, doneIconColor, undoIconColor, lowColor, mediumColor, highColor) values (1, 'Dark', '#bf3e17', '#1a1a1a', '#333333', '#f2f2f2', '#d9d9d9', '#d9d9d9', '#cc2e29', '#26b596', '#5bc0de', '#26b596', '#cec825', '#f4511e');",
			)
			tx.executeSql(
				"INSERT OR IGNORE INTO profile (id, name, avatar, endedTask) values (0, 'Maker', '', 0);",
			)
			tx.executeSql(
				"INSERT OR IGNORE INTO settings (id, sorting, sortingType, timeFormat, firstDayOfWeek, confirmFinishingTask, confirmRepeatingTask, confirmDeletingTask, version, hideTabView, theme, lang) values (0, 'byAZ', 'ASC', 1, 'Sunday', 1, 1, 1, ?, 0, 0, ?);",
				[`${VERSION}_INIT`, getLocale()],
				() => {
					initApp(callback)
				},
			)
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const initApp = (callback, backup = false) => {
	db.transaction(
		(tx) => {
			// CHECK CORRECTION APP VERSION AND UPDATE DB
			tx.executeSql(
				'select version from settings',
				[],
				(_, { rows }) => {
					const { version } = rows._array[0]
					if (version !== VERSION) {
						if (version.includes('_INIT')) {
							tx.executeSql('UPDATE settings SET lang = ?, version = ? WHERE id = 0;', [
								getLocale(),
								VERSION,
							])
						}

						const prepareToUpdate = (update) => {
							if (update === '2.0.0') {
								tx.executeSql('DROP TABLE IF EXISTS themes;', [], () => {
									tx.executeSql(
										'ALTER TABLE quickly_tasks ADD COLUMN order_nr integer DEFAULT 0;',
										[],
										() => {
											tx.executeSql(
												'UPDATE settings SET version = ? WHERE id = 0;',
												[VERSION],
												() => {
													tx.executeSql('SELECT id FROM quickly_tasks;', [], (_, { rows }) => {
														Promise.all((resolve) => {
															rows._array.forEach((id, index) => {
																tx.executeSql(
																	'update quickly_tasks set order_nr = ? where id = ?;',
																	[index, id],
																	() => {
																		resolve()
																	},
																)
															})
														}).then(() => {
															if (!backup) {
																AsyncStorage.setItem('updated', 'true')
															}
															initDatabase(callback)
														})
													})
												},
											)
										},
									)
								})
							} else if (update === '1.1.0') {
								tx.executeSql('DELETE FROM themes WHERE id = 0;', [], () => {
									tx.executeSql('DELETE FROM themes WHERE id = 1;', [], () => {
										tx.executeSql(
											'ALTER TABLE tasks ADD COLUMN event_id text default null;',
											[],
											() => {
												tx.executeSql(
													'ALTER TABLE tasks ADD COLUMN notification_id text default null;',
													[],
													() => {
														tx.executeSql(
															'ALTER TABLE settings ADD COLUMN hideTabView integer DEFAULT 0;',
															[],
															() => {
																prepareToUpdate('2.0.0')
															},
														)
													},
												)
											},
										)
									})
								})
							}
						}

						const versionID = +version.split('.').join('')
						// Init prepare DB for newest version
						if (versionID === 110) {
							prepareToUpdate('2.0.0')
						} else if (versionID < 110) {
							prepareToUpdate('1.1.0')
						} else {
							tx.executeSql('UPDATE settings SET version = ? WHERE id = 0;', [VERSION], () => {
								callback()
							})
						}
					} else callback()
				},
				() => initDatabase(callback),
			)
		},
		// eslint-disable-next-line no-console
		(err) => console.log(err),
	)
}

export const initTheme = (callback) => {
	db.transaction((tx) => {
		tx.executeSql(
			'select theme from settings',
			[],
			(_, { rows }) => {
				tx.executeSql(
					'select * from themes where id = ?',
					[rows._array[0].theme],
					(_, { rows }) => {
						const theme = rows._array[0]
						callback({
							uiTheme: {
								fontFamily: 'Ubuntu',
								palette: {
									primaryColor: theme.primaryColor,
									accentColor: theme.warningColor,
									primaryTextColor: theme.thirdTextColor,
									secondaryTextColor: theme.thirdTextColor,
									canvasColor: theme.secondaryBackgroundColor,
									alternateTextColor: theme.primaryTextColor,
									disabledColor: theme.primaryTextColor,
									pickerHeaderColor: theme.primaryTextColor,
								},
							},
							ready: true,
						})
					},
				)
			},
			// eslint-disable-next-line no-console
			(err) => console.log(err),
		)
	})
}
