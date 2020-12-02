import React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { activity } from '../../shared/styles'

import { connect } from 'react-redux'

const Spinner = ({ size = 'large', color, primaryColor = '#f4511e' }) => (
	<View style={activity}>
		<ActivityIndicator size={size} color={color ?? primaryColor} />
	</View>
)

const mapStateToProps = (state) => ({ primaryColor: state.theme.theme?.primaryColor })

export default connect(mapStateToProps)(Spinner)
