import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, ScrollView } from 'react-native';
import TaskList from './components/TaskList/taskList';
import Modal from './components/Modal/modal';

export default class App extends React.Component {
  state = {
    newTask: {
      name: '',
      description: ''
    },
      modalTask: {
          name: '',
          description: ''
      },
        tasks: [],
        showModal: false,
  };

  toggleModalHandler = (task = this.state.newTask) => {
      this.setState(prevState => {
          return {
              showModal: !prevState.showModal,
              modalTask: task
          }
      })
  };

  newTaskNameHandler = name => {
    const {newTask} = this.state;
    this.setState({newTask: {
      name: name, description: newTask.description
    }});
  };

  newTaskDescriptionHandler = description => {
    const {newTask} = this.state;
    this.setState({newTask: {
      description: description, name: newTask.name
    }});
  };

  addNewTaskHandler = () => {
    if (this.state.newTask.name.trim() === "") {
      return false;
    }

    this.setState(prevState => {
      return {
        tasks: prevState.tasks.concat(prevState.newTask),
          newTask: {
              name: '',
              description: ''
          }
      }
    })
  };

  render() {
    const {tasks, newTask, modalTask, showModal} = this.state;

    return (
      <View style={styles.container}>
          <View style={styles.inputContainer}>
              <Modal
                  task={modalTask}
                  showModal={showModal}
                  toggleModal={this.toggleModalHandler} />

            <Text style={{fontWeight: 'bold', fontSize: 20, padding: 10}}>To Do list:</Text>

              <TextInput
                  placeholder="Tap task name"
                  style={styles.placeInputName}
                  onChangeText={this.newTaskNameHandler}
                  value={newTask.name}
              />
              <TextInput
                  multiline = {true}
                  numberOfLines = {4}
                  placeholder="Tap task description"
                  style={styles.placeInputDescription}
                  onChangeText={this.newTaskDescriptionHandler}
                  value={newTask.description}
              />

            <Button
                style={styles.placeButton}
                title="Add task"
                onPress={this.addNewTaskHandler}
            />
        </View>
        <ScrollView style={styles.tasks}>
          <TaskList toggleModal={this.toggleModalHandler} tasks={tasks} />
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
    margin: 20,
    width: "100%",
      height: "10%",
  }
});
