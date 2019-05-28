import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import { ListItem, Subheader } from 'react-native-material-ui';

const taskList = (props) => {
    if (props.tasks.length) {
        return props.tasks.map((task, index) => (
            <View style={styles.taskList}>
                <Subheader text="Today" />
                <ListItem
                    divider
                    dense
                    key={index}
                    onPress={() => props.toggleModal(task)}
                    style={{
                        container: {backgroundColor: 'red'}
                    }}
                    centerElement={{
                        primaryText: `${index+1}. ${task.name}`,
                        secondaryText: task.description ? task.description : null
                    }}
                />
            </View>
        ));
    } else {
        return <Text style={styles.empty}>Task list is empty</Text>;
    }
};

const styles = StyleSheet.create({
    taskList: {
        backgroundColor: "#eee",
    },
    empty: {
        width: "100%",
        textAlign: "center",
    }
});

export default taskList;