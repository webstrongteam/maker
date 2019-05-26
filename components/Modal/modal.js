import React from 'react';
import {StyleSheet, View, Text, Modal, Button} from 'react-native';

const modal = (props) => (
    <View>
        <Modal
            animationType="slide"
            transparent={false}
            onRequestClose={() => true}
            visible={props.showModal}>
            <View style={styles.modal}>
                <View>
                    <Text style={styles.name}>
                        {props.task.name}
                    </Text>
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
                                onPress={props.toggleModal}
                                title="Edit"
                            />
                        </View>
                        <View style={styles.button}>
                            <Button
                                color="red"
                                onPress={props.toggleModal}
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
        fontSize: 20,
        fontWeight: 'bold',
        paddingBottom: 5,
    },
    description: {
        marginBottom: 20,
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