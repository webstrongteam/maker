import React, {Component} from "react";
import InputDialog from "../../components/UI/Dialog/InputDialog";
import {generateInputDialogObject, valid} from '../../shared/utility';

import {connect} from 'react-redux';
import * as actions from '../../store/actions/index';

class ConfigCategory extends Component {
    state = {
        task: {id: false, name: '', list_id: false},
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
        this.initQuicklyTask(this.props.task_id);
    };

    initQuicklyTask = (task_id) => {
        if (task_id !== false) {
            this.props.onInitQuicklyTask(task_id, (res) => {
                this.setState({task: res, editTask: true});
                this.showDialog('Edit task');
            })
        } else {
            this.setState({editTask: false});
            this.showDialog('New task');
        }
    };

    updateTask = (name, value) => {
        const {task} = this.state;
        task[name] = value;
        this.setState({task});
    };

    changeInputHandler = (name, save = false, value = this.state.task.name) => {
        const {task, controls} = this.state;
        const {list_id, toggleModal} = this.props;
        valid(controls, value, name, (newControls) => {
            this.updateTask(name, value);
            if (save && !newControls[name].error) {
                if (list_id !== false) {
                    this.props.onSaveQuicklyTask(task, list_id, () => {
                        delete newControls[name].error;
                        toggleModal(task);
                    });
                }
            }
            this.setState({controls: newControls});
        })
    };

    showDialog = (title) => {
        const {task} = this.state;
        const dialog = generateInputDialogObject(
            title,
            true,
            task.name,
            (value) => this.changeInputHandler('name', false, value),
            {
                Save: () => this.changeInputHandler('name', true),
                Cancel: () => this.props.toggleModal()
            }
        );
        this.setState({dialog});
    };

    render() {
        const {dialog, controls} = this.state;

        return (
            <React.Fragment>
                {dialog &&
                <InputDialog
                    showModal={this.props.showModal}
                    elementConfig={controls.name}
                    title={dialog.title}
                    focus={dialog.focus}
                    value={dialog.value}
                    onChange={dialog.onChange}
                    buttons={dialog.buttons}
                />
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
        onInitQuicklyTask: (id, callback) => dispatch(actions.initQuicklyTask(id, callback)),
        onSaveQuicklyTask: (task, list_id, callback) => dispatch(actions.saveQuicklyTask(task, list_id, callback)),
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(ConfigCategory);