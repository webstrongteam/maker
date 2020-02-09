import React, {Component} from "react";
import Dialog from "../../../components/UI/Dialog/Dialog";
import {generateDialogObject, valid} from '../../../shared/utility';

import {connect} from 'react-redux';
import * as actions from '../../../store/actions';

class ConfigQuicklyTask extends Component {
    state = {
        task: {id: false, name: '', order_nr: null, list_id: false},
        control: {
            label: this.props.translations.quicklyTaskName,
            required: true,
            characterRestriction: 40,
            error: true
        },
        editTask: null,
        dialog: false
    };

    componentDidMount() {
        this.initQuicklyTask(this.props.task_id);
    };

    initQuicklyTask = (task_id) => {
        const {translations} = this.props;
        if (task_id !== false) {
            this.props.onInitQuicklyTask(task_id, (res) => {
                this.setState({task: res, editTask: true});
                this.showDialog(translations.editTask);
            })
        } else {
            this.setState({editTask: false});
            this.showDialog(translations.newTask);
        }
    };

    showDialog = (title) => {
        const {task, control} = this.state;
        const dialog = generateDialogObject(
            title,
            {
                elementConfig: control,
                focus: true,
                value: task.name,
                onChange: (value, control) => {
                    const {task} = this.state;
                    task.name = value;
                    this.setState({task, control}, () => {
                        this.showDialog(title);
                    });
                }
            },
            {
                Save: () => {
                    const {control} = this.state;
                    const {list_id, taskLength} = this.props;
                    if (!control.error) {
                        if (task.order_nr === null) {
                            task.order_nr = taskLength;
                        }
                        this.props.onSaveQuicklyTask(task, list_id, () => {
                            this.props.toggleModal(task);
                        });
                    }
                },
                Cancel: () => this.props.toggleModal()
            }
        );
        this.setState({dialog});
    };

    render() {
        const {dialog} = this.state;

        return (
            <React.Fragment>
                {dialog &&
                <Dialog
                    showModal={this.props.showModal}
                    input={true}
                    title={dialog.title}
                    body={dialog.body}
                    buttons={dialog.buttons}
                />
                }
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        translations: {
            ...state.settings.translations.ConfigQuicklyTask,
            ...state.settings.translations.validation
        }
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onInitQuicklyTask: (id, callback) => dispatch(actions.initQuicklyTask(id, callback)),
        onSaveQuicklyTask: (task, list_id, callback) => dispatch(actions.saveQuicklyTask(task, list_id, callback)),
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(ConfigQuicklyTask);