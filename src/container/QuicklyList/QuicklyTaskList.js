import React, {PureComponent} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {Icon, IconToggle, ListItem, Toolbar} from 'react-native-material-ui';
import {container, fullWidth} from '../../shared/styles';
import InputDialog from '../../components/UI/Dialog/InputDialog';
import ConfigQuicklyTask from './ConfigQuicklyTask';
import Template from '../Template/Template';
import {BannerAd} from '../../../adsAPI';

import {connect} from 'react-redux';
import * as actions from "../../store/actions";
import {generateInputDialogObject} from "../../shared/utility";

class QuicklyTaskList extends PureComponent {
    state = {
        quicklyTasks: [],
        showModal: false,
        selectedTask: {id: false, name: ''},
        list: {id: false, name: 'List name'},
        showDialog: false,
        dialog: {},
        ready: false
    };

    componentDidMount() {
        const list = this.props.navigation.getParam('list', false);
        if (list && list.id !== false) {
            this.props.onInitList(list.id, (tasks) => {
                console.warn(list);
                this.setState({
                    quicklyTasks: tasks,
                    ready: true, list
                })
            })
        } else {
            this.setState({ready: true})
        }
    };

    saveList = (list, quicklyTasks) => {
        this.props.onSaveList(list, quicklyTasks, () => {
            this.props.navigation.goBack();
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
                },
                Cancel: () => {
                    this.setState({showDialog: false});
                },
            }
        );
        this.setState({showDialog: true, dialog});
    };

    render() {
        const {showDialog, showModal, dialog, selectedTask, list, quicklyTasks, ready} = this.state;
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
                                onPress={() => this.saveList()} name="add"/>
                        </React.Fragment>
                    }
                    onLeftElementPress={() => {
                        navigation.goBack();
                    }}
                    centerElement={list.name}
                />
                {showModal &&
                <ConfigQuicklyTask
                    showModal={showModal}
                    task={selectedTask}
                    list_id={list.id}
                    toggleModal={this.toggleModalHandler}
                />
                }
                {showDialog &&
                <InputDialog
                    showModal={showDialog}
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

const styles = StyleSheet.create({
    name: {
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 21
    }
});

const mapStateToProps = state => {
    return {
        theme: state.theme.theme
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onInitList: (id, callback) => dispatch(actions.initList(id, callback)),
        onSaveList: (list, quicklyTasks, callback) => dispatch(actions.saveList(list, quicklyTasks, callback)),
        onRemoveQuicklyTask: (id) => dispatch(actions.removeQuicklyTasks(id))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(QuicklyTaskList);