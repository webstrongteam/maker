import React, {Component} from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ActionButton, Toolbar } from 'react-native-material-ui';
import TaskList from '../../components/TaskList/TaskList';
import Template from '../Template/Template';

import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

class ToDo extends Component {
    state = {
        update: false
    };

    componentDidMount() {
        //if (!this.props.isAuth) this.props.navigation.navigate('Auth');
    }

    render() {
        const {tasks, navigation} = this.props;

        return (
            <Template>
                <Toolbar
                    searchable={{
                        autoFocus: true,
                        placeholder: 'Search',
                    }}
                    rightElement={{
                        menu: {
                            icon: "more-vert",
                            labels: ["item 1", "item 2"]
                        }
                    }}
                    leftElement="menu"
                    onLeftElementPress={() => navigation.navigate('Drawer')}
                    centerElement="MAKER - ToDo list"
                />
                <View style={styles.container}>
                    <ScrollView style={styles.tasks}>
                        <TaskList
                            toggleModal={(task) => navigation.navigate('ConfigTask', {task})}
                            tasks={tasks} />
                    </ScrollView>
                </View>
                <ActionButton
                    onPress={() => navigation.navigate('ConfigTask')}
                    icon="add"
                />
            </Template>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        paddingLeft: 20,
        paddingRight: 20,
        flex: 1,
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
});

const mapStateToProps = state => {
    return {
        newTask: state.todo.newTask,
        modalTask: state.todo.modalTask,
        tasks: state.todo.tasks,
        selectedTask: state.todo.selectedTask,
        isAuth: state.auth.isAuth
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onNewName: (name) => dispatch(actions.newName(name)),
        onNewDescription: (description) => dispatch(actions.newDescription(description)),
        onAddNewTask: () => dispatch(actions.addNewTask())
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(ToDo);