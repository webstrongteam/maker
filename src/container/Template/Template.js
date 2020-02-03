import React, {Component} from 'react';
import {Platform, StatusBar, View} from 'react-native';
import {getTheme, Snackbar, ThemeContext} from 'react-native-material-ui';
import {initDatabase, initTheme} from "../../db";
import {flex} from '../../shared/styles';
import Dialog from "../../components/UI/Dialog/Dialog";

import {connect} from 'react-redux';
import * as actions from "../../store/actions";

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
        const {showModal, modal, showSnackbar, snackbarText} = this.props;

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

                    <Dialog
                        showModal={showModal}
                        input={modal.input}
                        select={modal.select}
                        selectedValue={modal.selectedValue}
                        title={modal.title}
                        body={modal.body}
                        buttons={modal.buttons}
                    />

                    <Snackbar visible={showSnackbar} message={snackbarText}
                              onPress={() => this.props.onUpdateSnackbar(false)}
                              onRequestClose={() => this.props.onUpdateSnackbar(false)}/>

                </ThemeContext.Provider>
                }
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        showModal: state.config.showModal,
        modal: state.config.modal,
        showSnackbar: state.config.showSnackbar,
        snackbarText: state.config.snackbarText
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onUpdateSnackbar: (showSnackbar, snackbarText) => dispatch(actions.updateSnackbar(showSnackbar, snackbarText))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Template);