import React, { Component } from "react";
import Dialog from "react-native-dialog";
import Input from '../../../components/UI/Input/Input';
import {Picker, StyleSheet, View} from "react-native";

class OtherRepeat extends Component {
    state = {
        repeat: {
            label: 'Enter repeat value'
        }
    };

    valid = (value) => {
        const repeat = this.state.repeat;
        if (+value === parseInt(value, 10) && +value > 0) delete repeat.error;
        else repeat.error = `Repeat time must be a number!`;
        this.props.onSetRepeat(value);
        this.setState({ repeat });
    };

    render() {
        const { showModal, repeat, selectedTime } = this.props;

        return (
            <Dialog.Container visible={showModal}>
                <Dialog.Title>Config repeat</Dialog.Title>
                <View>
                    <Input
                        elementConfig={this.state.repeat}
                        focus={true}
                        value={repeat}
                        changed={(value) => this.valid(value)}
                    />
                    <Picker
                        style={{ marginLeft: 10 }}
                        selectedValue={selectedTime}
                        onValueChange={value => this.props.onSelectTime(value)}>
                        <Picker.Item label="Days" value="0" />
                        <Picker.Item label="Week" value="1" />
                        <Picker.Item label="Month" value="2" />
                        <Picker.Item label="Year" value="3" />
                    </Picker>
                </View>
                <Dialog.Button
                    label="Save"
                    onPress={() => {
                        if (!this.state.error) this.props.save();
                        else return false
                    }}
                />
                <Dialog.Button
                    label="Cancel"
                    onPress={this.props.cancel}
                />
            </Dialog.Container>
        );
    }
}

const styles = StyleSheet.create({
    picker: {
        width: '100%',
        height: 50,
        borderWidth: 0
    },
});

export default OtherRepeat;