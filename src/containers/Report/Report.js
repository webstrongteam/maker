import React, {Component} from 'react';
import {Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableWithoutFeedback, View} from 'react-native';
import {sendReportAPI} from '../../API/reportAPI';
import {Button, Toolbar} from "react-native-material-ui";
import Input from '../../components/UI/Input/Input';
import Template from "../Template/Template";
import styles from './Report.styles';
import axios from 'axios';

import * as actions from "../../store/actions";
import {connect} from "react-redux";
import Spinner from "../../components/UI/Spinner/Spinner";

class Report extends Component {
    state = {
        title: '',
        description: '',
        loadingButton: false,
        sending: false,
        controls: {
            title: {
                label: this.props.translations.titleLabel,
                required: true,
                characterRestriction: 50,
                error: true
            },
            description: {
                label: this.props.translations.descriptionLabel,
                required: true,
                multiline: true,
                error: true
            }
        },
    };

    changeTitle = (text, control) => {
        const {controls} = this.state;
        controls.title = control;
        this.setState({title: text, controls});
    };

    changeDescription = (text, control) => {
        const {controls} = this.state;
        controls.description = control;
        this.setState({description: text, controls});
    };

    toggleSnackbar = (message, visible = true) => {
        this.props.onUpdateSnackbar(visible, message);
    };

    sendReport = () => {
        const {title, description, controls} = this.state;
        const {translations} = this.props;
        if (!controls.title.error && !controls.description.error) {
            this.setState({sending: true}, () => {
                axios.post(sendReportAPI, {
                    title, description,
                    system: Platform.OS,
                    version: this.props.settings.version
                })
                    .then(() => {
                        this.toggleSnackbar(translations.correctSend, true);
                        const {controls} = this.state;
                        controls.title.error = true;
                        controls.description.error = true;
                        this.setState({
                            title: '',
                            description: '',
                            sending: false,
                            controls
                        });
                    })
                    .catch(() => {
                        this.toggleSnackbar(translations.errorSend, true);
                        this.setState({sending: false});
                    })
            })
        }
    };

    render() {
        const {title, description, sending, controls} = this.state;
        const {navigation, theme, translations} = this.props;

        return (
            <Template bgColor={theme.secondaryBackgroundColor}>
                <Toolbar
                    leftElement="arrow-back"
                    onLeftElementPress={() => navigation.goBack()}
                    centerElement={translations.title}
                />
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <View style={styles.form}>
                        <KeyboardAvoidingView behavior={'padding'} style={{flex: 1}}>
                            <View style={styles.headerContainer}>
                                <Text style={{...styles.headerText, color: theme.thirdTextColor}}>
                                    {translations.headerText}
                                </Text>
                            </View>
                            <View style={styles.inputsContainer}>
                                <ScrollView>
                                    <Input
                                        elementConfig={controls.title}
                                        focus={false}
                                        value={title}
                                        changed={(value, control) => {
                                            this.changeTitle(value, control)
                                        }}
                                    />
                                    <Input
                                        elementConfig={controls.description}
                                        focus={false}
                                        value={description}
                                        changed={(value, control) => {
                                            this.changeDescription(value, control)
                                        }}
                                    />
                                </ScrollView>
                            </View>
                            {sending ? <Spinner/> :
                                <Button raised icon="send" text={translations.sendButton}
                                        onPress={this.sendReport}
                                        style={{
                                            container: {flex: 1, backgroundColor: theme.doneIconColor},
                                            text: {color: theme.primaryTextColor}
                                        }}
                                />
                            }
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            </Template>
        )
    }
}

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        settings: state.settings.settings,
        translations: state.settings.translations.Report
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onUpdateSnackbar: (showSnackbar, snackbarText) => dispatch(actions.updateSnackbar(showSnackbar, snackbarText)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Report);