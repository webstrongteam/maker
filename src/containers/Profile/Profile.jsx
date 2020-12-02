import React, { PureComponent } from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { askAsync, CAMERA_ROLL } from 'expo-permissions'
import Constants from 'expo-constants'
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker'
import { Toolbar } from 'react-native-material-ui'
import Input from '../../components/Input/Input'
import Template from '../Template/Template'
import Spinner from '../../components/Spinner/Spinner'
import { separator } from '../../shared/styles'
import styles from './Profile.styles'

import * as actions from '../../store/actions'
import { connect } from 'react-redux'

const defaultAvatar = require('../../assets/profile.png')

class Profile extends PureComponent {
	state = {
		name: '',
		showDefaultAvatar: false,
		loading: true,
	}

	componentDidMount() {
		const { onInitSettings, onInitProfile } = this.props

		onInitSettings()
		onInitProfile(() => {
			const { profile } = this.props
			this.setState({ loading: false, name: profile.name })
		})
	}

	toggleSnackbar = (message, visible = true) => {
		const { onUpdateSnackbar } = this.props

		onUpdateSnackbar(visible, message)
	}

	getPermissionAsync = async () => {
		const { translations } = this.props
		if (Constants.platform.ios) {
			const { status } = await askAsync(CAMERA_ROLL)
			if (status === 'granted') {
				await this.pickImage()
			} else {
				this.toggleSnackbar(translations.permission)
			}
		} else {
			await this.pickImage()
		}
	}

	pickImage = async () => {
		const result = await launchImageLibraryAsync({
			mediaTypes: MediaTypeOptions.All,
			allowsEditing: true,
			aspect: [4, 3],
		})

		if (!result.cancelled) {
			const { onChangeAvatar } = this.props

			onChangeAvatar(result.uri, () => {
				this.setState({ showDefaultAvatar: false })
			})
		}
	}

	render() {
		const { loading, showDefaultAvatar, name } = this.state
		const {
			navigation,
			theme,
			tasks,
			lists,
			finished,
			profile,
			categories,
			onChangeName,
			translations,
		} = this.props

		let list
		const listData = []
		listData.push({ label: translations.allTask, data: tasks.length + finished.length })
		listData.push({ label: translations.finishedTask, data: finished.length })
		listData.push({ label: translations.endedTask, data: profile.endedTask })
		listData.push({ label: translations.allCategories, data: categories.length })
		listData.push({ label: translations.allQuicklyLists, data: lists.length })

		if (profile.id === 0) {
			list = listData.map((item, index) => (
				<View key={index}>
					<View style={[styles.item, { backgroundColor: theme.primaryBackgroundColor }]}>
						<Text style={{ color: theme.thirdTextColor, fontSize: 16 }}>{item.label}</Text>
						<Text style={{ color: theme.primaryColor, fontSize: 18 }}>{item.data}</Text>
					</View>
					<View style={separator} />
				</View>
			))
		}

		return (
			<Template>
				<Toolbar
					leftElement='arrow-back'
					onLeftElementPress={navigation.goBack}
					centerElement={translations.title}
				/>

				{!loading ? (
					<ScrollView>
						{profile.id === 0 && (
							<View
								style={{
									backgroundColor: theme.secondaryBackgroundColor,
									paddingBottom: 10,
								}}
							>
								<TouchableOpacity onPress={this.getPermissionAsync}>
									<Image
										style={styles.image}
										source={
											profile.avatar && !showDefaultAvatar ? { uri: profile.avatar } : defaultAvatar
										}
										onError={() => {
											this.setState({ showDefaultAvatar: true })
										}}
									/>
								</TouchableOpacity>
								<Input
									hideClearIcon
									elementConfig={{ label: '' }}
									style={styles.name}
									value={name}
									color={theme.primaryColor}
									changed={(value) => {
										this.setState({ name: value })
										onChangeName(value)
									}}
								/>
							</View>
						)}
						<View>{list}</View>
					</ScrollView>
				) : (
					<Spinner />
				)}
			</Template>
		)
	}
}

const mapStateToProps = (state) => ({
	theme: state.theme.theme,
	settings: state.settings.settings,
	tasks: state.tasks.tasks,
	finished: state.tasks.finished,
	profile: state.profile,
	categories: state.categories.categories,
	lists: state.lists.lists,
	translations: state.settings.translations.Profile,
})

const mapDispatchToProps = (dispatch) => ({
	onInitSettings: () => dispatch(actions.initSettings()),
	onInitProfile: (callback) => dispatch(actions.initProfile(callback)),
	onChangeName: (name) => dispatch(actions.changeName(name)),
	onChangeAvatar: (avatar, callback) => dispatch(actions.changeAvatar(avatar, callback)),
	onUpdateSnackbar: (showSnackbar, snackbarText) =>
		dispatch(actions.updateSnackbar(showSnackbar, snackbarText)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Profile)
