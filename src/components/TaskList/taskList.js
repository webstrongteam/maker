import React from 'react';
import {StyleSheet, Text} from 'react-native';

const taskList = (props) => {
    if (props.tasks.length) {
        return props.tasks.map((task, index) => (
            <Text
                key={index}
                onPress={() => props.toggleModal(task)}
                style={styles.taskList}>{index+1}. {task.name}
            </Text>
        ));
    } else {
        return <Text style={styles.empty}>Task list is empty</Text>;
    }
};

const styles = StyleSheet.create({
    taskList: {
        margin: 5,
        padding: 10,
        backgroundColor: "#eee",
    },
    empty: {
        width: "100%",
        textAlign: "center",
    }
});

export default taskList;