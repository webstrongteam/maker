import React from 'react';
import {
    Text,
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Template from '../../container/Template/Template';
import { Toolbar } from 'react-native-material-ui';

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
                    <Text style={ styles.separator } />
                    <Text style={styles.primaryText}>
                        Maker is a advanced ToDo mobile application created with React Native
                        and Expo framework. This app working with Android and iOS.
                    </Text>
                    <Text style={styles.secondaryText}>
                        Maker is open source app in GitHub:
                    </Text>
                    <TouchableOpacity onPress={openWebBrowser}>
                        <Image
                            style={styles.github}
                            source={require('../../assets/github.png')}
                        />
                    </TouchableOpacity>
                </ScrollView>
                <View style={{ opacity: 0.5 }}>
                    <Text style={styles.copy}>
                        &copy; by Mateusz Pijanowski (WebStrong team)
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
    },
    separator: {
        height: 1,
        marginLeft: 15,
        marginRight: 15,
        flex: 1,
        backgroundColor: '#E4E4E4'
    }
});

export default about;