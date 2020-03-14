import React, {PureComponent} from 'react';
import {Image, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import Input from '../../components/UI/Input/Input';
import Template from '../Template/Template';
import {askAsync, CAMERA_ROLL} from 'expo-permissions';
import Constants from 'expo-constants';
import {launchImageLibraryAsync, MediaTypeOptions} from 'expo-image-picker';
import {Toolbar} from 'react-native-material-ui';
import Spinner from '../../components/UI/Spinner/Spinner';
import {separator} from '../../shared/styles';
import {BannerAd} from "../../shared/bannerAd";
import styles from './Profile.styles';

import {connect} from 'react-redux';
import * as actions from "../../store/actions";

class Profile extends PureComponent {
    state = {
        name: '',
        loading: true
    };

    componentDidMount() {
        this.props.onInitSettings();
        this.props.onInitProfile(() => {
            const {profile} = this.props;
            this.setState({loading: false, name: profile.name});
        });
    }

    toggleSnackbar = (message, visible = true) => {
        this.props.onUpdateSnackbar(visible, message);
    };

    getPermissionAsync = async () => {
        const {translations} = this.props;
        if (Constants.platform.ios) {
            const {status} = await askAsync(CAMERA_ROLL);
            if (status === 'granted') {
                this.pickImage();
            } else {
                this.toggleSnackbar(translations.permission);
            }
        } else this.pickImage();
    };

    pickImage = async () => {
        let result = await launchImageLibraryAsync({
            mediaTypes: MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
        });

        if (!result.cancelled) {
            this.props.onChangeAvatar(result.uri);
        }
    };

    render() {
        const {loading, name} = this.state;
        const {navigation, theme, tasks, lists, finished, profile, categories, translations} = this.props;
        let list;
        const listData = [];
        listData.push({label: translations.allTask, data: tasks.length + finished.length});
        listData.push({label: translations.finishedTask, data: finished.length});
        listData.push({label: translations.endedTask, data: profile.endedTask});
        listData.push({label: translations.allCategories, data: categories.length});
        listData.push({label: translations.allQuicklyLists, data: lists.length});

        if (profile.id === 0) {
            list = listData.map((item, index) => (
                <View key={index}>
                    <View style={[styles.item, {backgroundColor: theme.primaryBackgroundColor}]}>
                        <Text style={{color: theme.thirdTextColor, fontSize: 16}}>
                            {item.label}
                        </Text>
                        <Text style={{fontSize: 19, color: theme.primaryColor}}>
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
                    onLeftElementPress={() => navigation.goBack()}
                    centerElement={translations.title}
                />

                {!loading ?
                    <ScrollView>
                        {profile.id === 0 &&
                        <View style={{
                            backgroundColor: theme.secondaryBackgroundColor,
                            paddingBottom: 10
                        }}>
                            <TouchableOpacity onPress={this.getPermissionAsync}>
                                <Image style={styles.image} source={
                                    profile.avatar ?
                                        {uri: profile.avatar} :
                                        require('../../assets/profile.png'
                                        )}/>
                            </TouchableOpacity>
                            <Input
                                elementConfig={{label: ''}}
                                style={styles.name}
                                value={name}
                                color={theme.primaryColor}
                                changed={value => {
                                    this.setState({name: value});
                                    this.props.onChangeName(value);
                                }}/>
                        </View>
                        }
                        <View>
                            {list}
                        </View>
                    </ScrollView> : <Spinner/>
                }
                <BannerAd/>
            </Template>
        )
    }
}

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        settings: state.settings.settings,
        tasks: state.tasks.tasks,
        finished: state.tasks.finished,
        profile: state.profile,
        categories: state.categories.categories,
        lists: state.lists.lists,
        translations: state.settings.translations.Profile
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onInitSettings: () => dispatch(actions.initSettings()),
        onInitProfile: (callback) => dispatch(actions.initProfile(callback)),
        onChangeName: (name) => dispatch(actions.changeName(name)),
        onChangeAvatar: (avatar) => dispatch(actions.changeAvatar(avatar)),
        onUpdateSnackbar: (showSnackbar, snackbarText) => dispatch(actions.updateSnackbar(showSnackbar, snackbarText))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);