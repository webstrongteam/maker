import React from 'react'
import { View } from 'react-native'
import { Icon } from 'react-native-material-ui'
import styles from './Icon.styles'

const getIcon = ({ name, color }) => (
	<View style={styles.iconWrapper}>
		<Icon color={color} style={styles.icon} name={name} />
	</View>
)

export default getIcon
