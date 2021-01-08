import React from 'react'
import { Text } from 'react-native'
import { empty } from '../../shared/styles'

const EmptyList = ({ color, text }) => <Text style={[empty, { color }]}>{text}</Text>

export default EmptyList
