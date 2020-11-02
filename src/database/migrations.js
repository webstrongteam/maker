import { AsyncStorage } from 'react-native'
import { initDatabase, VERSION } from './db'

const startMigrations = (tx, version, backup, callback) => {
	const migrations = (updateVersion) => {
		switch (updateVersion) {
			case '2.5.0':
				tx.executeSql('UPDATE settings SET version = ? WHERE id = 0;', [VERSION], () => {
					tx.executeSql(
						'ALTER TABLE settings ADD COLUMN showDeadlineTime integer DEFAULT 1;',
						[],
						() => initDatabase(callback),
					)
				})
				break
			case '2.0.0':
				tx.executeSql('DROP TABLE IF EXISTS themes;', [], () => {
					tx.executeSql(
						'ALTER TABLE quickly_tasks ADD COLUMN order_nr integer DEFAULT 0;',
						[],
						() => {
							tx.executeSql('SELECT id FROM quickly_tasks;', [], (_, { rows }) => {
								Promise.all((resolve) => {
									rows._array.forEach((id, index) => {
										tx.executeSql(
											'update quickly_tasks set order_nr = ? where id = ?;',
											[index, id],
											() => resolve(),
										)
									})
								}).then(() => {
									if (!backup) {
										AsyncStorage.setItem('updated', 'true')
									}
									migrations('2.5.0')
								})
							})
						},
					)
				})
				break
			case '1.1.0':
				tx.executeSql('DELETE FROM themes WHERE id = 0;', [], () => {
					tx.executeSql('DELETE FROM themes WHERE id = 1;', [], () => {
						tx.executeSql('ALTER TABLE tasks ADD COLUMN event_id text default null;', [], () => {
							tx.executeSql(
								'ALTER TABLE tasks ADD COLUMN notification_id text default null;',
								[],
								() => {
									tx.executeSql(
										'ALTER TABLE settings ADD COLUMN hideTabView integer DEFAULT 0;',
										[],
										() => {
											migrations('2.0.0')
										},
									)
								},
							)
						})
					})
				})
				break
			default:
				tx.executeSql('UPDATE settings SET version = ? WHERE id = 0;', [VERSION], () => {
					callback()
				})
		}
	}

	const versionID = +version.split('.').join('')
	// Select migrations for newest version
	if (versionID < 110) {
		migrations('1.1.0')
	} else if (versionID === 110) {
		migrations('2.0.0')
	} else if (versionID < 250) {
		migrations('2.5.0')
	} else {
		migrations()
	}
}

export default startMigrations
