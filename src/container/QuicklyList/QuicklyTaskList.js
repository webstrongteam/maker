import React, {PureComponent} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {Icon, IconToggle, ListItem, Toolbar} from 'react-native-material-ui';
import {container, fullWidth} from '../../shared/styles';
import ConfigCategory from '../ConfigCategory/ConfigCategory';
import Template from '../Template/Template';
import {BannerAd} from '../../../adsAPI';

import {connect} from 'react-redux';
import * as actions from "../../store/actions";

class QuicklyTaskList extends PureComponent {
    state = {
        quicklyTasks: [],
        showModal: false,
        selectedTask: {id: false, name: ''},
        ready: false
    };

    componentDidMount() {
        const id = this.props.navigation.getParam('list', false);
        this.props.onInitLIst(id, (list) => {
            this.setState({
                quicklyTasks: list,
                ready: true
            })
        })
    };

    toggleModalHandler = (selected = false) => {
        const {showModal} = this.state;
        if (selected !== false) {
            this.setState({
                showModal: !showModal,
                selectedTask: selected
            });
        } else {
            this.setState({
                showModal: !showModal,
                selectedTask: false
            });
        }
    };

    render() {
        const {showModal, selectedTask, quicklyTasks, ready} = this.state;
        const {navigation, theme} = this.props;

        return (
            <Template>
                <Toolbar
                    leftElement="arrow-back"
                    rightElement={
                        <IconToggle
                            color={theme.headerTextColor}
                            onPress={() => this.toggleModalHandler()} name="add"/>
                    }
                    onLeftElementPress={() => {
                        navigation.goBack();
                    }}
                    centerElement='Quickly tasks'
                />
                {showModal &&
                <ConfigQuicklyTask
                    showModal={showModal}
                    task={selectedTask}
                    toggleModal={this.toggleModalHandler}
                />
                }
                <View style={container}>
                    {ready &&
                    <ScrollView style={[fullWidth, {backgroundColor: theme.primaryBackgroundColor}]}>
                        {quicklyTasks.map(task => (
                            <ListItem
                                divider
                                dense
                                key={task.id}
                                onPress={() => {
                                    this.toggleModalHandler(task.id);
                                }}
                                leftElement={
                                    <TouchableOpacity onPress={() => this.toggleModalHandler(task.id)}>
                                        <Icon name="edit"/>
                                    </TouchableOpacity>
                                }
                                rightElement={
                                    <IconToggle onPress={() => this.props.onRemoveQuicklyTask(task.id)}
                                                name="remove"/>
                                }
                                centerElement={{
                                    primaryText: `${task.name}`,
                                }}
                            />
                        ))}
                    </ScrollView>
                    }
                </View>
                <BannerAd/>
            </Template>
        )
    }
}

const mapStateToProps = state => {
    return {
        theme: state.theme.theme
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onRemoveQuicklyTask: (id) => dispatch(actions.removeQuicklyTask(id)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(QuicklyTaskList);