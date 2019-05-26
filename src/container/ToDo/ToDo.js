import React, {Component} from 'react';
import { StyleSheet, Text, View, TextInput, Button, ScrollView } from 'react-native';
import TaskList from '../../components/TaskList/taskList';
import Modal from '../../components/Modal/modal';

import { connect } from 'react-redux';
import * as actions from '../../store/actions/tasks';

class ToDo extends Component {
    state = {
        showModal: false,
        showEditModal: false
    };

    toggleModalHandler = (task = this.props.newTask) => {
        this.props.onUpdateModalTask(task);
        this.setState(prevState => {
            return {
                showModal: !prevState.showModal
            }
        })
    };

    toggleEditModalHandler = () => {
        this.setState(prevState => {
            return {
                showEditModal: !prevState.showEditModal
            }
        })
    };

    removeTaskHandler = (task) => {
        this.props.onRemoveTask(task);
        this.toggleModalHandler();
    };

    render() {
        const {showModal, showEditModal} = this.state;
        const {tasks, newTask, modalTask} = this.props;

        return (
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                    <Modal
                        task={modalTask}
                        showModal={showModal}
                        index={this.props.selectedTask}
                        showEditModal={showEditModal}
                        remove={this.removeTaskHandler}
                        toggleEditModal={this.toggleEditModalHandler}
                        toggleModal={this.toggleModalHandler} />

                    <Text style={styles.title}>MAKER</Text>
                    <Text style={styles.subtitle}>Best ToDo app!</Text>

                    <TextInput
                        placeholder="Tap task name"
                        style={styles.placeInputName}
                        onChangeText={this.props.onNewName}
                        value={newTask.name}
                    />
                    <TextInput
                        multiline={true}
                        numberOfLines={4}
                        placeholder="Tap task description"
                        style={styles.placeInputDescription}
                        onChangeText={this.props.onNewDescription}
                        value={newTask.description}
                    />

                    <Button
                        style={styles.placeButton}
                        title="Add task"
                        onPress={this.props.onAddNewTask}
                    />
                </View>
                <ScrollView style={styles.tasks}>
                    <TaskList
                        toggleModal={this.toggleModalHandler}
                        tasks={tasks} />
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center'
    },
    inputContainer: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center"
    },
    placeInputName: {
        width: "100%",
        margin: 10,
        padding: 10,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: '#ddd',
    },
    placeInputDescription: {
        width: "100%",
        margin: 10,
        height: 100,
        padding: 10,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: '#ddd',
    },
    placeButton: {
        width: "20%",
    },
    tasks: {
        marginTop: 40,
        width: "100%",
        height: "10%",
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        paddingTop: 15,
        letterSpacing: 1
    },
    subtitle: {
        color: '#ddd',
        fontSize: 10,
        paddingBottom: 10
    }
});

const mapStateToProps = state => {
    return {
        newTask: state.newTask,
        modalTask: state.modalTask,
        tasks: state.tasks,
        selectedTask: state.selectedTask
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onNewName: (name) => dispatch(actions.newName(name)),
        onNewDescription: (description) => dispatch(actions.newDescription(description)),
        onAddNewTask: () => dispatch(actions.addNewTask()),
        onRemoveTask: (task) => dispatch(actions.removeTask(task)),
        onUpdateModalTask: (task) => dispatch(actions.updateModalTask(task))
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(ToDo);