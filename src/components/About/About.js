import React from 'react';
import {Image, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {separator} from '../../shared/styles';
import * as WebBrowser from 'expo-web-browser';
import Template from '../../containers/Template/Template';
import {Toolbar} from 'react-native-material-ui';
import {VERSION} from '../../db'
import styles from './About.styles';

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
                centerElement={props.translations.title}
            />
            <ScrollView style={{backgroundColor: props.theme.secondaryBackgroundColor, height: '100%'}}>
                <View style={styles.container}>
                    <Image
                        style={styles.logo}
                        source={require('../../assets/icon.png')}
                    />
                    <Text style={separator}/>
                    <Text style={[styles.primaryText, {color: props.theme.secondaryTextColor}]}>
                        {props.translations.primaryText}
                    </Text>
                    <Text style={[styles.secondaryText, {color: props.theme.secondaryTextColor}]}>
                        {props.translations.secondaryText}
                    </Text>
                    <TouchableOpacity onPress={openWebBrowser}>
                        <Image
                            tintColor={props.theme.secondaryTextColor}
                            style={{...styles.github, borderColor: props.theme.secondaryTextColor}}
                            source={require('../../assets/github.png')}
                        />
                    </TouchableOpacity>

                    <View style={{opacity: 0.5}}>
                        <Text style={[styles.copy, {color: props.theme.thirdTextColor}]}>
                            &copy; by Mateusz Pijanowski (WebStrong team) v.{VERSION} (test build v1)
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </Template>
    )
};

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        translations: state.settings.translations.About
    }
};

export default connect(mapStateToProps)(about);