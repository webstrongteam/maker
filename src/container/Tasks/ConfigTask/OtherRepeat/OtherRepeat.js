import React, {Component} from "react";
import {Picker} from "react-native";
import Dialog from '../../../../components/UI/Dialog/Dialog';
import Input from '../../../../components/UI/Input/Input';
import {generateDialogObject, valid} from "../../../../shared/utility";

import {connect} from "react-redux";

class OtherRepeat extends Component {
    state = {
        controls: {
            value: {
                label: 'Enter repeat value',
                number: true,
                positiveNumber: true,
                required: true,
                characterRestriction: 4,
            }
        },
        dialog: null,
        loading: true
    };

    componentDidMount() {
        this.showDialog();
    }

    checkValid = (name, save = false, value = this.props.repeat) => {
        const controls = this.state.controls;
        valid(controls, value, name, (newControls) => {
            this.props.onSetRepeat(value);
            if (save && !newControls[name].error) {
                this.props.save();
            }
            this.setState({controls: newControls});
        })
    };

    showDialog = () => {
        const dialog = generateDialogObject(
            'Config custom repeat',
            false,
            {
                Save: () => {
                    this.checkValid('value', true);
                },
                Cancel: () => this.props.cancel()
            }
        );
        this.setState({loading: false, dialog});
    };

    render() {
        const {loading, dialog, controls} = this.state;
        const {showModal, repeat, selectedTime, theme} = this.props;

        return (
            <React.Fragment>
                {!loading &&
                <Dialog
                    showModal={showModal}
                    title={dialog.title}
                    buttons={dialog.buttons}
                >
                    <Input
                        elementConfig={controls.value}
                        focus={true}
                        value={repeat}
                        changed={value => this.checkValid('value', false, value)}
                    />
                    <Picker
                        style={{marginLeft: 10, color: theme.textColor}}
                        selectedValue={selectedTime}
                        onValueChange={value => this.props.onSelectTime(value)}>
                        <Picker.Item label="Days" value="0"/>
                        <Picker.Item label="Week" value="1"/>
                        <Picker.Item label="Month" value="2"/>
                        <Picker.Item label="Year" value="3"/>
                    </Picker>
                </Dialog>
                }
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {theme: state.theme.theme}
};

export default connect(mapStateToProps)(OtherRepeat);