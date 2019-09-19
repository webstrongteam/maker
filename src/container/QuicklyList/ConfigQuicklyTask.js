import React, {Component} from "react";
import Dialog from '../../components/UI/Dialog/Dialog';
import Input from '../../components/UI/Input/Input';
import {generateDialogObject, valid} from '../../shared/utility';

import {connect} from 'react-redux';
import * as actions from '../../store/actions/index';

class ConfigCategory extends Component {
    state = {
        task: {
            id: false,
            name: ''
        },
        controls: {
            name: {
                label: 'Enter quickly task name',
                required: true,
                characterRestriction: 40
            }
        },
        editTask: null,
        dialog: false
    };

    componentDidMount() {
        this.initQuicklyTask(this.props.task);
    };

    initQuicklyTask = (task) => {
        if (task !== false) {
            this.setState({task, editTask: true});
            this.showDialog('Edit task');
        } else {
            this.setState({editTask: false});
            this.showDialog('New task');
        }
    };

    updateTask = (name, value) => {
        const task = this.state.task;
        task[name] = value;
        this.setState({task});
    };

    changeInputHandler = (name, save = false, value = this.state.task.name) => {
        const controls = this.state.controls;
        valid(controls, value, name, (newControls) => {
            this.updateTask('name', value);
            if (save && !newControls[name].error) {
                const {task} = this.state;
                this.props.onSaveQuicklyTask(task, this.props.list_id, () => {
                    delete newControls[name].error;
                    this.props.toggleModal(task);
                });
            }
            this.setState({controls: newControls});
        })
    };

    showDialog = (title) => {
        const dialog = generateDialogObject(
            title,
            false,
            {
                Save: () => this.changeInputHandler('name', true),
                Cancel: () => this.props.toggleModal()
            }
        );
        this.setState({dialog});
    };

    render() {
        const {dialog, controls, task} = this.state;
        const {showModal} = this.props;

        return (
            <React.Fragment>
                {dialog &&
                <Dialog
                    showModal={showModal}
                    title={dialog.title}
                    buttons={dialog.buttons}>
                    <Input
                        elementConfig={controls.name}
                        focus={true}
                        value={task.name}
                        changed={(value) => this.changeInputHandler('name', false, value)}
                    />
                </Dialog>
                }
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {theme: state.theme.theme}
};
const mapDispatchToProps = dispatch => {
    return {
        onSaveQuicklyTask: (task, list_id, callback) => dispatch(actions.saveCategory(task, list_id, callback)),
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(ConfigCategory);