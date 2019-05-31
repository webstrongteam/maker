import React, {Component} from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { ActionButton, Toolbar, BottomNavigation } from 'react-native-material-ui';
import TaskList from '../TaskList/TaskList';
import Template from '../Template/Template';

import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

class ToDo extends Component {
    state = {
        active: 'byAZ'
    };

    componentDidMount() {
        //if (!this.props.isAuth) this.props.navigation.navigate('Auth');
    }

    render() {
        const {navigation} = this.props;

        return (
            <Template>
                <Toolbar
                    searchable={{
                        autoFocus: true,
                        placeholder: 'Search task',
                    }}
                    leftElement="menu"
                    onLeftElementPress={() => navigation.navigate('Drawer')}
                    centerElement="MAKER - ToDo list"
                />
                <View style={styles.container}>
                    <ScrollView style={styles.tasks}>
                        <TaskList navigation={navigation} />
                    </ScrollView>
                </View>
                <ActionButton
                    style={{
                        container: { marginBottom: 50 }
                    }}
                    onPress={() => navigation.navigate('ConfigTask')}
                    icon="add"
                />
                <BottomNavigation active={this.state.active} >
                    <BottomNavigation.Action
                        key="byAZ"
                        icon="format-line-spacing"
                        label="A-Z"
                        onPress={() => this.setState({ active: 'byAZ' })}
                    />
                    <BottomNavigation.Action
                        key="byDate"
                        icon="insert-invitation"
                        label="Date"
                        onPress={() => this.setState({ active: 'byDate' })}
                    />
                    <BottomNavigation.Action
                        key="byCategory"
                        icon="bookmark-border"
                        label="Category"
                        onPress={() => this.setState({ active: 'byCategory' })}
                    />
                    <BottomNavigation.Action
                        key="byPriority"
                        icon="priority-high"
                        label="Priority"
                        onPress={() => this.setState({ active: 'byPriority' })}
                    />

                </BottomNavigation>
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
    tasks: {
        marginTop: 20,
        width: "100%",
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