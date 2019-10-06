import React, {Component} from 'react';
import {Platform, StatusBar, View} from 'react-native';
import {getTheme, ThemeContext} from 'react-native-material-ui';
import {initDatabase, initTheme} from "../../../db";
import {flex} from '../../shared/styles';

import {connect} from 'react-redux';

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
                    <View style={{
                        height: Platform.OS === 'ios' ?
                            20 : StatusBar.currentHeight,
                        backgroundColor: "#af3f1f"
                    }}>
                        <StatusBar backgroundColor="rgba(0, 0, 0, 0.2)" translucent/>
                    </View>
                    <View
                        style={[flex, {
                            backgroundColor: this.props.bgColor ?
                                this.props.bgColor :
                                this.props.theme.primaryBackgroundColor
                        }]}>
                        {this.props.children}
                    </View>
                </ThemeContext.Provider>
                }
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {theme: state.theme.theme}
};

export default connect(mapStateToProps)(Template);