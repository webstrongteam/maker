import React, {Component} from "react";
import Dialog from '../../components/UI/Dialog/Dialog';
import Input from '../../components/UI/Input/Input';
import {generateDialogObject, valid} from '../../shared/utility';

import {connect} from 'react-redux';
import * as actions from '../../store/actions/index';

class ConfigCategory extends Component {
    state = {
        category: {
            id: false,
            name: ''
        },
        controls: {
            name: {
                label: 'Enter category name',
                required: true,
                characterRestriction: 30
            }
        },
        editCategory: null,
        dialog: false
    };

    componentDidMount() {
        this.initCategory(this.props.category);
    };

    initCategory = (id) => {
        if (id !== false) {
            this.props.onInitCategory(id, (category) => {
                this.setState({category, editCategory: true});
                this.showDialog('Edit category');
            })
        } else {
            this.setState({editCategory: false});
            this.showDialog('New category');
        }
    };

    updateCategory = (name, value) => {
        const category = this.state.category;
        category[name] = value;
        this.setState({category});
    };

    changeInputHandler = (name, save = false, value = this.state.category.name) => {
        const controls = this.state.controls;
        valid(controls, value, name, (newControls) => {
            this.updateCategory('name', value);
            if (save && !newControls[name].error) {
                const {category} = this.state;
                this.props.onSaveCategory(category, () => {
                    delete newControls[name].error;
                    this.props.toggleModal(category);
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
        const {dialog, controls, category} = this.state;
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
                        value={category.name}
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
        onInitCategory: (id, callback) => dispatch(actions.initCategory(id, callback)),
        onSaveCategory: (category, callback) => dispatch(actions.saveCategory(category, callback)),
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(ConfigCategory);