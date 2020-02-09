import React, {Component} from 'react';
import {Text, TouchableOpacity, View, Dimensions} from 'react-native';
import {IconToggle, Icon, Toolbar} from 'react-native-material-ui';
import {container, empty, shadow} from '../../../shared/styles';
import {generateDialogObject, valid} from '../../../shared/utility';
import ConfigQuicklyTask from '../ConfigQuicklyTask/ConfigQuicklyTask';
import Spinner from '../../../components/UI/Spinner/Spinner';
import Template from '../../Template/Template';
import SortableListView from 'react-native-sortable-listview'
import {selectionAsync} from 'expo-haptics';
import styles from './QuicklyTaskList.styles';

import {connect} from 'react-redux';
import * as actions from "../../../store/actions";

const width = Dimensions.get('window').width;

class QuicklyTaskList extends Component {
    state = {
        quicklyTasks: [],
        showModal: false,
        selectedTask: false,
        list: {
            id: false,
            name: this.props.translations.listName
        },
        newListName: this.props.translations.listName,
        order: [],
        control: {
            label: this.props.translations.listName,
            required: true,
            characterRestriction: 20,
            error: true
        },
        loading: true
    };

    componentDidMount() {
        const list = this.props.navigation.getParam('list', false);
        if (list && list.id !== false) {
            this.reloadTasks(list);
        } else {
            const {list} = this.state;
            this.saveList(list);
            this.setState({loading: false});
        }
    };

    reloadTasks = (list = this.state.list) => {
        this.setState({loading: true});
        this.props.onInitList(list.id, (tasks) => {
            const order = [...tasks.map(t => t.order_nr)];
            console.log(tasks)
            this.setState({
                quicklyTasks: tasks,
                newListName: list.name,
                order, list, loading: false
            });
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
        const {newListName, control} = this.state;
        const {translations} = this.props;

        const dialog = generateDialogObject(
            translations.dialogTitle,
            {
                elementConfig: control,
                focus: true,
                value: newListName,
                onChange: (value, control) => {
                    this.setState({newListName: value, control}, this.showDialog);
                }
            },
            {
                [translations.save]: () => {
                    const {list, newListName, control} = this.state;
                    if (!control.error) {
                        this.props.onUpdateModal(false);
                        this.saveList({
                            id: list.id,
                            name: newListName
                        });
                    }
                },
                [translations.cancel]: () => {
                    const {list, control} = this.state;
                    delete control.error;
                    this.setState({newListName: list.name, control});
                    this.props.onUpdateModal(false)
                }
            }
        );

        dialog.input = true;
        this.props.onUpdateModal(true, dialog);
    };

    removeTask = (row) => {
        this.props.onRemoveQuicklyTask(row.id, () => {
            const {quicklyTasks, list} = this.state;
            Promise.all(
                quicklyTasks.map(task => {
                    return new Promise((resolve) => {
                        if (task.order_nr > row.order_nr) {
                            task.order_nr -= 1;
                            this.props.onSaveQuicklyTask(task, list.id, () => {
                                resolve();
                            });
                        } else resolve();
                    })
                })
            ).then(() => {
                this.reloadTasks()
            })
        })
    };

    updateOrder = (order) => {
        const {quicklyTasks, list} = this.state;
        order.map((o, i) => {
            quicklyTasks[i].order_nr = +o;
            this.props.onSaveQuicklyTask(quicklyTasks[i], list.id);
        });
    };

    saveList = (list) => {
        this.props.onSaveList(list, (savedList) => {
            this.setState({list: savedList});
        });
    };

    render() {
        const {showModal, selectedTask, list, quicklyTasks, order, loading} = this.state;
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
                    taskLength={quicklyTasks.length}
                    toggleModal={this.toggleModalHandler}
                />
                }

                {!loading ?
                    <View style={container}>
                        {quicklyTasks.length ?
                            <SortableListView
                                activeOpacity={0.4}
                                data={{...quicklyTasks}}
                                order={order}
                                onRowActive={selectionAsync}
                                onRowMoved={e => {
                                    order.splice(e.to, 0, order.splice(e.from, 1)[0]);
                                    this.updateOrder(order);
                                }}
                                renderRow={row => {
                                    return (
                                        <TouchableOpacity style={{
                                            ...shadow,
                                            ...styles.taskRow,
                                            width: width - 20,
                                        }} onPress={() => this.toggleModalHandler(row.id)}>
                                            <View
                                                style={styles.taskContainer}
                                            >
                                                <View style={{width: '75%', marginTop: 5, marginBottom: 5}}>
                                                    <Text numberOfLines={1} style={styles.taskName}>{row.name}</Text>
                                                </View>
                                                <View style={styles.taskIconContainer}>
                                                    <IconToggle
                                                        color={theme.doneButtonColor}
                                                        onPress={() => this.removeTask(row)}
                                                        name="done"/>
                                                    <Icon name="dehaze"/>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                }}
                            /> :
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

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        translations: {
            ...state.settings.translations.QuicklyTaskList,
            ...state.settings.translations.validation,
            ...state.settings.translations.common
        }
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onInitLists: () => dispatch(actions.initLists()),
        onInitList: (id, callback) => dispatch(actions.initList(id, callback)),
        onSaveQuicklyTask: (task, list_id, callback) => dispatch(actions.saveQuicklyTask(task, list_id, callback)),
        onSaveList: (list, callback) => dispatch(actions.saveList(list, callback)),
        onRemoveQuicklyTask: (id, callback) => dispatch(actions.removeQuicklyTask(id, callback)),
        onUpdateModal: (showModal, modal) => dispatch(actions.updateModal(showModal, modal))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(QuicklyTaskList);