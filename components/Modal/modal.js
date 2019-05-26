import React from 'react';
import {StyleSheet, View, Text, Modal, Button} from 'react-native';
import EditTask from '../../container/EditTask/EditTask';

const modal = (props) => (
    <View>
        {props.showEditModal &&
        <EditTask
            index={props.index}
            showEditModal={props.showEditModal}
            toggleModal={props.toggleModal}
            toggleEditModal={props.toggleEditModal} />
        }
        <Modal
            animationType="slide"
            transparent={false}
            onRequestClose={() => true}
            visible={props.showModal}>
            <View style={styles.modal}>
                <View>
                    <View style={{justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={styles.name}>
                            {props.task.name}
                        </Text>
                    </View>
                    <Text style={styles.description}>
                        {props.task.description}
                    </Text>

                    <View style={styles.buttons}>
                        <View style={styles.button}>
                            <Button
                                onPress={props.toggleModal}
                                title="Close"
                            />
                        </View>
                        <View style={styles.button}>
                            <Button
                                color="green"
                                onPress={() => props.toggleEditModal(props.task)}
                                title="Edit"
                            />
                        </View>
                        <View style={styles.button}>
                            <Button
                                color="red"
                                onPress={() => props.remove(props.task)}
                                title="Remove"
                            />
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    </View>
);

const styles = StyleSheet.create({
    modal: {
        marginTop: 15,
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        paddingBottom: 5,
    },
    description: {
        marginBottom: 30,
    },
    buttons: {
        flexDirection: "row"
    },
    button: {
        marginLeft: 10,
        marginRight: 10,
    }
});

export default modal;