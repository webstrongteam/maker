import React from 'react';
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {separator} from '../../shared/styles';
import * as WebBrowser from 'expo-web-browser';
import Template from '../../container/Template/Template';
import {Toolbar} from 'react-native-material-ui';
import {VERSION} from '../../../db'

import {connect} from "react-redux";

const about = (props) => {
    const openWebBrowser = async () => {
        await WebBrowser.openBrowserAsync('https://github.com/mateuszpijanowski/maker');
    };

    return (
        <Template>
            <Toolbar
                leftElement="arrow-back"
                onLeftElementPress={() => {
                    props.navigation.goBack();
                }}
                centerElement='About'
            />
            <View style={styles.container}>
                <ScrollView>
                    <Image
                        style={styles.logo}
                        source={require('../../assets/icon.png')}
                    />
                    <Text style={separator}/>
                    <Text style={[styles.primaryText, {color: props.theme.textColor}]}>
                        Maker is an advanced ToDo mobile application created with React Native
                        and Expo framework. This app works with Android and iOS.
                    </Text>
                    <Text style={[styles.secondaryText, {color: props.theme.textColor}]}>
                        Maker source code is available on github:
                    </Text>
                    <TouchableOpacity onPress={openWebBrowser}>
                        <Image
                            tintColor={props.theme.textColor}
                            style={styles.github}
                            source={require('../../assets/github.png')}
                        />
                    </TouchableOpacity>
                </ScrollView>
                <View style={{opacity: 0.5}}>
                    <Text style={[styles.copy, {color: props.theme.textColor}]}>
                        &copy; by Mateusz Pijanowski (WebStrong team) v.{VERSION} (hotfix 1)
                    </Text>
                </View>
            </View>
        </Template>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingLeft: 25,
        paddingRight: 25,
        alignItems: 'center',
        justifyContent: 'center'
    },
    primaryText: {
        fontSize: 15,
        textAlign: 'center',
        paddingTop: 10,
        paddingBottom: 10
    },
    secondaryText: {
        fontSize: 13,
        textAlign: 'center',
        paddingTop: 20,
        paddingBottom: 5
    },
    copy: {
        textAlign: 'center',
        paddingTop: 10,
        paddingBottom: 10,
        opacity: 0.5,
        fontSize: 10
    },
    logo: {
        height: 150,
        width: 150,
        borderRadius: 65,
        marginTop: 10,
        marginBottom: 10,
        alignSelf: 'center'
    },
    github: {
        height: 125,
        width: 125,
        opacity: 0.5,
        borderRadius: 65,
        marginTop: 10,
        marginBottom: 10,
        alignSelf: 'center'
    }
});

const mapStateToProps = state => {
    return {theme: state.theme.theme}
};

export default connect(mapStateToProps)(about);