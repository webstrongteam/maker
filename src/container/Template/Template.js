import React, { Component } from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import { connect } from 'react-redux';

class Template extends Component {
    render() {
        return (
            <View style={[styles.container, {backgroundColor: this.props.theme.primaryColor}]}>
                <View style={[styles.content, { backgroundColor: this.props.bgColor ? this.props.bgColor : this.props.theme.primaryBackgroundColor }]}>
                    {this.props.children}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 25 : 0
    },
    content: {
        flex: 1
    }
});

const mapStateToProps = state => {
    return {theme: state.theme.theme}
};

export default connect(mapStateToProps)(Template);