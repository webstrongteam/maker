import React from 'react';
import {ActivityIndicator, View} from "react-native";
import {activity} from "../../../shared/styles";

import {connect} from "react-redux";

const spinner = (props) => (
    <View style={activity}>
        <ActivityIndicator
            size={props.size ? props.size : 'large'}
            color={props.color ? props.color : props.theme.primaryColor}
        />
    </View>
);

const mapStateToProps = state => {
    return {theme: state.theme.theme}
};

export default connect(mapStateToProps)(spinner);