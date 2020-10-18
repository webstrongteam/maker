import React from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { Toolbar } from 'react-native-material-ui'
import { connect } from 'react-redux'
import { separator } from '../../shared/styles'
import Template from '../../containers/Template/Template'
import styles from './About.styles'
import { VERSION } from '../../db'

const about = (props) => {
	const openWebBrowser = async (url) => {
		await WebBrowser.openBrowserAsync(url)
	}

	return (
		<Template>
			<Toolbar
				leftElement='arrow-back'
				onLeftElementPress={props.navigation.goBack}
				centerElement={props.translations.title}
			/>
			<ScrollView style={{ backgroundColor: props.theme.secondaryBackgroundColor, height: '100%' }}>
				<View style={styles.container}>
					<Image style={styles.logo} source={require('../../assets/icon.png')} />
					<Text style={separator} />
					<Text style={[styles.primaryText, { color: props.theme.secondaryTextColor }]}>
						{props.translations.primaryText}
					</Text>
					<Text style={[styles.secondaryText, { color: props.theme.secondaryTextColor }]}>
						{props.translations.secondaryText}
					</Text>
					<TouchableOpacity
						onPress={() => openWebBrowser('https://github.com/mateuszpijanowski/maker')}
					>
						<Image
							tintColor={props.theme.secondaryTextColor}
							style={{
								...styles.github,
								borderColor: props.theme.secondaryTextColor,
							}}
							source={require('../../assets/github.png')}
						/>
					</TouchableOpacity>

					<View style={{ opacity: 0.5 }}>
						<TouchableOpacity onPress={() => openWebBrowser('https://webstrong.pl')}>
							<Text style={[styles.copy, { color: props.theme.thirdTextColor }]}>
								&copy; by Mateusz Pijanowski https://webstrong.pl) v. {VERSION}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</Template>
	)
}

const mapStateToProps = (state) => ({
	theme: state.theme.theme,
	translations: state.settings.translations.About,
})

export default connect(mapStateToProps)(about)
