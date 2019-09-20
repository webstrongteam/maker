import React, {Component} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {Icon, IconToggle, ListItem, Toolbar} from 'react-native-material-ui';
import {container, fullWidth} from '../../shared/styles';
import InputDialog from '../../components/UI/Dialog/InputDialog';
import ConfigQuicklyTask from './ConfigQuicklyTask';
import Template from '../Template/Template';

import {connect} from 'react-redux';
import * as actions from "../../store/actions";
import {generateInputDialogObject} from "../../shared/utility";

class QuicklyTaskList extends Component {
    state = {
        quicklyTasks: [],
        showModal: false,
        selectedTask: false,
        list: {id: false, name: 'List name'},
        showDialog: false,
        dialog: {},
        ready: false,
        control: {label: 'List name'}
    };

    componentDidMount() {
        const list = this.props.navigation.getParam('list', false);
        if (list && list.id !== false) {
            this.reloadTasks(list);
        } else {
            const {list} = this.state;
            this.saveList(list, false);
            this.setState({ready: true});
        }
    };

    reloadTasks = (list = this.state.list) => {
        this.props.onInitList(list.id, (tasks) => {
            console.log(tasks);
            this.setState({
                quicklyTasks: tasks,
                ready: true, list
            });
        });
    };

    saveList = (list, goBack = true) => {
        this.props.onSaveList(list, (savedList) => {
            this.setState({list: savedList});
            if (goBack) this.props.navigation.goBack();
        });
    };

    toggleModalHandler = (selected = false) => {
        const {showModal} = this.state;
        if (selected !== false) {
            this.reloadTasks();
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

    showDialog = () => {
        const {list} = this.state;
        let copyName = list.name;
        let dialog = generateInputDialogObject(
            'Edit list name',
            true,
            copyName,
            (value) => copyName = value,
            {
                Save: () => {
                    list.name = copyName;
                    this.setState({list, showDialog: false});
                    this.saveList(list, false);
                },
                Cancel: () => {
                    this.setState({showDialog: false});
                },
            }
        );
        this.setState({showDialog: true, dialog});
    };

    render() {
        const {showDialog, control, showModal, dialog, selectedTask, list, quicklyTasks, ready} = this.state;
        const {navigation, theme} = this.props;

        return (
            <Template>
                <Toolbar
                    leftElement="arrow-back"
                    rightElement={
                        <React.Fragment>
                            <IconToggle
                                color={theme.headerTextColor}
                                onPress={() => this.showDialog()} name="edit"/>
                            <IconToggle
                                color={theme.headerTextColor}
                                name="add"
                                onPress={() => this.toggleModalHandler()}/>
                        </React.Fragment>
                    }
                    onLeftElementPress={() => navigation.goBack()}
                    centerElement={list.name}
                />
                {showModal &&
                <ConfigQuicklyTask
                    showModal={showModal}
                    task_id={selectedTask}
                    list_id={list.id}
                    toggleModal={this.toggleModalHandler}
                />
                }
                {showDialog &&
                <InputDialog
                    showModal={showDialog}
                    elementConfig={control}
                    title={dialog.title}
                    focus={dialog.focus}
                    value={dialog.value}
                    onChange={dialog.onChange}
                    buttons={dialog.buttons}
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
                                style={{
                                    container: {marginTop: 5}
                                }}
                                onPress={() => this.toggleModalHandler(task.id)}
                                rightElement={
                                    <IconToggle onPress={() => {
                                        this.props.onRemoveQuicklyTask(task.id, () => {
                                            this.reloadTasks();
                                        })
                                    }} name="done"/>
                                }
                                centerElement={{
                                    primaryText: `${task.name}`,
                                }}
                            />
                        ))}
                    </ScrollView>
                    }
                </View>
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
        onInitList: (id, callback) => dispatch(actions.initList(id, callback)),
        onSaveList: (list, callback) => dispatch(actions.saveList(list, callback)),
        onRemoveQuicklyTask: (id, callback) => dispatch(actions.removeQuicklyTask(id, callback))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(QuicklyTaskList);