import React, {Component} from 'react';
import {View, TextInput, Button, Modal, StyleSheet} from 'react-native';
import * as actions from "../../store/actions/tasks";
import {connect} from "react-redux";

class EditTask extends Component {
    state = {
        task: {
            name: '',
            description: ''
        }
    };

    componentDidMount() {
        const task = this.props.tasks[this.props.index];
        this.setState({task});
    }

    editNameHandler = name => {
        const {task} = this.state;
        this.setState({task: { name, description: task.description}})
    };

    editDescriptionHandler = description => {
        const {task} = this.state;
        this.setState({task: { name: task.name, description}})
    };

    updateTaskHandler = () => {
        this.props.onUpdateTask(this.state.task);
        this.props.toggleEditModal();
        this.props.toggleModal();
    };

    render() {
        const {task} = this.state;
        const {showEditModal} = this.props;

        return (
            <View>
                <Modal
                    animationType="slide"
                    transparent={false}
                    onRequestClose={() => true}
                    visible={showEditModal}>
                    <View style={styles.modal}>
                        <View>
                            <TextInput
                                placeholder="Tap task name"
                                style={styles.placeInputName}
                                onChangeText={this.editNameHandler}
                                value={task.name}
                            />
                            <TextInput
                                multiline={true}
                                numberOfLines={4}
                                placeholder="Tap task description"
                                style={styles.placeInputDescription}
                                onChangeText={this.editDescriptionHandler}
                                value={task.description}
                            />

                            <View style={styles.buttons}>
                                <View style={styles.button}>
                                    <Button
                                        color="green"
                                        onPress={this.updateTaskHandler}
                                        title="Save"
                                    />
                                </View>
                                <View style={styles.button}>
                                    <Button
                                        onPress={this.props.toggleEditModal}
                                        title="Back"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    modal: {
        marginTop: 15,
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    inputContainer: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center"
    },
    placeInputName: {
        width: 300,
        margin: 10,
        padding: 10,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: '#ddd',
    },
    placeInputDescription: {
        width: 300,
        margin: 10,
        height: 100,
        padding: 10,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: '#ddd',
    },
    buttons: {
        flexDirection: "row"
    },
    button: {
        marginLeft: 10,
        marginRight: 10,
    },
});

const mapStateToProps = state => {
    return {
        editTask: state.editTask,
        tasks: state.tasks
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onUpdateTask: (task) => dispatch(actions.updateTask(task))
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(EditTask);