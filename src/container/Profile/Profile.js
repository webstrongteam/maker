import React, {Component} from 'react';
import {
    Text,
    View,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView, ActivityIndicator
} from 'react-native';
import Input from '../../components/UI/Input/Input';
import Template from '../Template/Template';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { Toolbar } from 'react-native-material-ui';
import {activity, separator} from '../../shared/styles';
import {BannerAd} from "../../../adsAPI";

import { connect } from 'react-redux';
import * as actions from "../../store/actions";

class Profile extends Component {
    state = {
        loading: true
    };

    componentDidMount() {
        this.props.onInitSettings();
        this.props.onInitProfile(() => {
            this.setState({ loading: false });
        });
    }

    getPermissionAsync = async () => {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
                return false;
            } else {
                return this.pickImage();
            }
        } else {
            return this.pickImage();
        }
    };

    pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
        });

        if (!result.cancelled) {
            this.props.onChangeAvatar(result.uri);
        }
    };

    render() {
        const {loading} = this.state;
        const {navigation, theme, tasks, finished, profile, categories} = this.props;
        let list;
        const listData = [];
        listData.push({ label: 'All task', data: tasks.length+finished.length });
        listData.push({ label: 'Finished task', data: finished.length });
        listData.push({ label: 'Ended task', data: profile.endedTask });
        listData.push({ label: 'All categories', data: categories.length });

        if (profile.id === 0) {
            list = listData.map((item, index) => (
                <View key={index}>
                    <View style={[styles.item, { backgroundColor: theme.primaryBackgroundColor }]}>
                        <Text style={{ color: theme.primaryColor, fontSize: 16 }}>
                            {item.label}
                        </Text>
                        <Text style={{fontSize: 19, color: theme.textColor}}>
                            {item.data}
                        </Text>
                    </View>
                    <View style={separator}/>
                </View>
            ));
        }

        return (
            <Template>
                <Toolbar
                    leftElement="arrow-back"
                    onLeftElementPress={() => {
                        navigation.goBack();
                    }}
                    centerElement='Your profile'
                />

                {!loading ?
                <React.Fragment>
                    {profile.id === 0 &&
                    <View style={{
                        backgroundColor: theme.secondaryBackgroundColor,
                        paddingBottom: 10
                    }}>
                        <TouchableOpacity onPress={() => this.getPermissionAsync()}>
                            <Image style={styles.image} source={
                                profile.avatar ?
                                    {uri: profile.avatar} :
                                    require('../../assets/profile.png'
                                    )}/>
                        </TouchableOpacity>
                        <Input
                            elementConfig={{label: ''}}
                            style={styles.name}
                            value={profile.name}
                            color={theme.primaryColor}
                            changed={(value) => {
                                if (value.trim() !== '') {
                                    this.props.onChangeName(value);
                                } else {
                                    // this.valid(value);
                                }
                            }}/>
                    </View>
                    }
                    <ScrollView style={{ flex: 1 }}>
                        {list}
                    </ScrollView>
                </React.Fragment> :
                <View style={activity}>
                    <ActivityIndicator size="large" color={theme.primaryColor}/>
                </View>
                }
                <BannerAd />
            </Template>
        )
    }
}

const styles = StyleSheet.create({
    item: {
        paddingLeft: 15,
        paddingTop: 5,
        paddingBottom: 10
    },
    name: {
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 21
    },
    image: {
        height: 125,
        width: 125,
        borderRadius: 65,
        marginTop: 10,
        marginBottom: -20,
        alignSelf: 'center'
    }
});

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        settings: state.settings,
        tasks: state.tasks.tasks,
        finished: state.tasks.finished,
        profile: state.profile,
        categories: state.categories.categories,
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onInitSettings: () => dispatch(actions.initSettings()),
        onInitProfile: (callback) => dispatch(actions.initProfile(callback)),
        onChangeName: (name) => dispatch(actions.changeName(name)),
        onChangeAvatar: (avatar) => dispatch(actions.changeAvatar(avatar)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);