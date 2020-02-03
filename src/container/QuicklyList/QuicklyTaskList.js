import React, {Component} from 'react';
import {Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {IconToggle, ListItem, Toolbar} from 'react-native-material-ui';
import {container, empty, fullWidth} from '../../shared/styles';
import {generateDialogObject} from '../../shared/utility';
import ConfigQuicklyTask from './ConfigQuicklyTask/ConfigQuicklyTask';
import Spinner from '../../components/UI/Spinner/Spinner';
import Template from '../Template/Template';

import {connect} from 'react-redux';
import * as actions from "../../store/actions";

class QuicklyTaskList extends Component {
    state = {
        quicklyTasks: [],
        showModal: false,
        selectedTask: false,
        list: {
            id: false,
            name: this.props.translations.listName
        },
        loading: true,
        control: {label: this.props.translations.listName}
    };

    componentDidMount() {
        const list = this.props.navigation.getParam('list', false);
        if (list && list.id !== false) {
            this.reloadTasks(list);
        } else {
            const {list} = this.state;
            this.saveList(list, false);
            this.setState({loading: false});
        }
    };

    reloadTasks = (list = this.state.list) => {
        this.props.onInitList(list.id, (tasks) => {
            this.setState({
                quicklyTasks: tasks,
                loading: false, list
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
        const {list, control} = this.state;
        const {translations} = this.props;
        let copyName = list.name;
        const dialog = generateDialogObject(
            translations.dialogTitle,
            {
                elementConfig: control,
                focus: true,
                value: copyName,
                onChange: (value) => copyName = value
            },
            {
                [translations.save]: () => {
                    list.name = copyName;
                    this.props.onUpdateModal(false);
                    this.saveList(list, false);
                },
                [translations.cancel]: () => {
                    this.props.onUpdateModal(false);
                },
            }
        );

        dialog.input = true;
        this.props.onUpdateModal(true, dialog);
    };

    render() {
        const {showModal, selectedTask, list, quicklyTasks, loading} = this.state;
        const {navigation, theme, translations} = this.props;

        return (
            <Template bgColor={theme.secondaryBackgroundColor}>
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
                    onLeftElementPress={() => {
                        this.props.onInitLists();
                        navigation.goBack()
                    }}
                    centerElement={
                        !loading ?
                            <TouchableOpacity onPress={() => this.showDialog()}>
                                <Text style={{
                                    color: theme.headerTextColor,
                                    fontWeight: 'bold',
                                    fontSize: 20
                                }}>
                                    {list.name}
                                </Text>
                            </TouchableOpacity> :
                            <View style={{marginTop: 10}}>
                                <Spinner color={theme.secondaryBackgroundColor} size='small'/>
                            </View>
                    }
                />

                {showModal &&
                <ConfigQuicklyTask
                    showModal={showModal}
                    task_id={selectedTask}
                    list_id={list.id}
                    toggleModal={this.toggleModalHandler}
                />
                }

                {!loading ?
                    <View style={container}>
                        {quicklyTasks.length ?
                            <ScrollView style={fullWidth}>
                                {quicklyTasks.map(task => (
                                    <ListItem
                                        dense
                                        key={task.id}
                                        style={{
                                            container: [
                                                styles.shadow,
                                                {
                                                    backgroundColor: "#fff",
                                                    marginTop: 10,
                                                    marginLeft: 10,
                                                    marginRight: 10,
                                                    height: 50
                                                }
                                            ],
                                            primaryText: {
                                                fontSize: 18,
                                                color: "#000"
                                            }
                                        }}
                                        onPress={() => this.toggleModalHandler(task.id)}
                                        rightElement={
                                            <IconToggle
                                                color={theme.doneButtonColor}
                                                onPress={() => {
                                                    this.props.onRemoveQuicklyTask(task.id, () => {
                                                        this.reloadTasks();
                                                    })
                                                }}
                                                name="done"/>
                                        }
                                        centerElement={{
                                            primaryText: `${task.name}`,
                                        }}
                                    />
                                ))}
                            </ScrollView> :
                            <Text style={[empty, {color: theme.textColor}]}>
                                {translations.emptyList}
                            </Text>
                        }
                    </View> : <Spinner/>
                }
            </Template>
        )
    }
}

const styles = StyleSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3
    }
});

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        translations: {
            ...state.settings.translations.QuicklyTaskList,
            ...state.settings.translations.common
        }
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onInitLists: () => dispatch(actions.initLists()),
        onInitList: (id, callback) => dispatch(actions.initList(id, callback)),
        onSaveList: (list, callback) => dispatch(actions.saveList(list, callback)),
        onRemoveQuicklyTask: (id, callback) => dispatch(actions.removeQuicklyTask(id, callback)),
        onUpdateModal: (showModal, modal) => dispatch(actions.updateModal(showModal, modal))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(QuicklyTaskList);