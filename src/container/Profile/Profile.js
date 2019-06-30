import React, {Component} from 'react';
import {
    Text,
    View,
    StyleSheet,
    Image,
    ScrollView
} from 'react-native';
import Template from '../Template/Template';
import { Toolbar } from 'react-native-material-ui';

import { connect } from 'react-redux';
import * as actions from "../../store/actions";

class Profile extends Component {
    render() {
        const {navigation, theme, settings, tasks} = this.props;
        const finishedList = tasks.filter(task => task.finish);
        const listData = [];
        listData.push({ label: 'All task', data: tasks.length });
        listData.push({ label: 'Ended task', data: tasks.length });
        listData.push({ label: 'Finished task', data: finishedList.length });

        const list = listData.map((item, index) => (
            <View key={index}>
                <View style={[styles.item, { backgroundColor: theme.primaryBackgroundColor }]}>
                    <Text style={{ color: theme.primaryColor, fontSize: 16 }}> {item.label} </Text>
                    <Text style={styles.rowContent}> {item.data} </Text>
                </View>
                <View style={styles.separator}/>
            </View>
        ));
        return (
            <Template>
                <Toolbar
                    leftElement="arrow-back"
                    onLeftElementPress={() => {
                        navigation.goBack();
                    }}
                    centerElement='Profile'
                />
                <View style={{
                    backgroundColor: theme.secondaryBackgroundColor,
                    paddingBottom: 10
                }}>
                    <Image style = {styles.image} source={require('../../assets/profile.png')} />
                    <Text style = {[styles.name, {color: theme.textColor}]}> Mateusz </Text>
                </View>
                <ScrollView style={styles.list}>
                    {list}
                </ScrollView>
            </Template>
        )
    }
}

const styles = StyleSheet.create({
    list: {
        flex: 1
    },
    item: {
        paddingLeft: 10,
        paddingTop: 5,
        paddingBottom: 10
    },
    name: {
        alignSelf: 'center',
        fontSize: 21,
        marginTop: 10,
        marginBottom: 5
    },
    image: {
        height: 125,
        width: 125,
        borderRadius: 65,
        marginTop: 10,
        alignSelf: 'center'
    },
    buttonText: {
        fontSize: 18,
        color: 'white',
        alignSelf: 'center'
    },
    rowContainer: {
        padding: 10
    },
    rowContent: {
        fontSize: 19
    },
    separator: {
        height: 1,
        marginLeft: 15,
        marginRight: 15,
        flex: 1,
        backgroundColor: '#E4E4E4'
    }
});

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        settings: state.settings,
        tasks: state.tasks.tasks
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onInitSettings: () => dispatch(actions.initSettings()),
        onChangeFirstDayOfWeek: (value) => dispatch(actions.changeFirstDayOfWeek(value)),
        onChangeTimeFormat: (value) => dispatch(actions.changeTimeFormat(value)),
        onChangeConfirmRepeatingTask: (value) => dispatch(actions.changeConfirmRepeatingTask(value)),
        onChangeConfirmFinishingTask: (value) => dispatch(actions.changeConfirmFinishingTask(value)),
        onChangeConfirmDeletingTask: (value) => dispatch(actions.changeConfirmDeletingTask(value)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Profile);