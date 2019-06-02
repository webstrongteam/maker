import React, { Component } from 'react';
import {View, StyleSheet, Platform} from 'react-native';

class Template extends Component {
    render() {
        return (
            <View style={styles.container}>
                <View style={styles.content}>
                    {this.props.children}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 25 : 0,
        backgroundColor: '#f4511e'
    },
    content: {
        flex: 1,
        backgroundColor: 'white'
    }
});

export default Template;