import React, { Component } from 'react';
import {Animated, Easing, Platform} from "react-native";

class AnimatedView extends Component {
    state = {
        fadeAnim: new Animated.Value(0),
        moveAnim: new Animated.Value(50)
    };

    componentWillMount() {
        this.fadeOpacity();
    }

    fadeOpacity = () => {
        Animated.timing(
            this.state.fadeAnim,
            {
                toValue: this.props.value,
                duration: this.props.duration,
                easing: Easing.bezier(0.0, 0.0, 0.2, 1),
                useNativeDriver: Platform.OS === 'android'
            }
        ).start();
        Animated.timing(
            this.state.moveAnim,
            {
                toValue: 0,
                duration: this.props.duration,
                easing: Easing.bezier(0.0, 0.0, 0.2, 1),
                useNativeDriver: Platform.OS === 'android'
            }
        ).start();
    };

    render() {
        return (
            <Animated.View style={{
                opacity: this.state.fadeAnim,
                transform: [{translateY: this.state.moveAnim}]
            }}>
                {this.props.children}
            </Animated.View>
        )
    }
}

export default AnimatedView;