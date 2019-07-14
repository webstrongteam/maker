import React, { Component } from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import {ThemeContext, getTheme} from 'react-native-material-ui';
import {initDatabase, initTheme} from "../../../db";

import { connect } from 'react-redux';

class Template extends Component {
    state = {
        uiTheme: false,
        ready: false
    };

    componentDidMount() {
        const {theme} = this.props;
        this.setState({
            uiTheme: {
                primaryColor: theme.primaryColor,
                accentColor: theme.actionButtonColor,
                primaryTextColor: theme.textColor,
                secondaryTextColor: theme.textColor,
                canvasColor: theme.secondaryBackgroundColor,
                alternateTextColor: theme.headerTextColor,
                disabledColor: theme.textColor,
                pickerHeaderColor: theme.textColor
            },
            ready: true
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.theme !== this.props.theme) {
            initDatabase(() => {
                initTheme(state => {
                    this.setState(state);
                })
            })
        }
    }

    render() {
        const {uiTheme, ready} = this.state;

        return (
            <React.Fragment>
                {ready &&
                <ThemeContext.Provider value={getTheme(uiTheme)}>
                    <View style={[styles.container, {backgroundColor: this.props.theme.primaryColor}]}>
                        <View
                            style={[styles.content, {backgroundColor: this.props.bgColor ? this.props.bgColor : this.props.theme.primaryBackgroundColor}]}>
                            {this.props.children}
                        </View>
                    </View>
                </ThemeContext.Provider>
                }
            </React.Fragment>
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