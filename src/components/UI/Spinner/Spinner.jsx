import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { connect } from 'react-redux'
import { activity } from '../../../shared/styles'

const spinner = (props) => (
	<View style={activity}>
		<ActivityIndicator
			size={props.size ? props.size : 'large'}
			color={props.color ? props.color : props.theme.primaryColor}
		/>
	</View>
)

const mapStateToProps = (state) => ({ theme: state.theme.theme })

export default connect(mapStateToProps)(spinner)
