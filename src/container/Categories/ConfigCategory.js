import React, {Component} from "react";
import Dialog from '../../components/UI/Dialog/Dialog';
import Input from '../../components/UI/Input/Input';
import {generateDialogObject, valid} from '../../shared/utility';

import {connect} from 'react-redux';
import * as actions from '../../store/actions';

class ConfigCategory extends Component {
    state = {
        category: {
            id: false,
            name: ''
        },
        controls: {
            name: {
                label: this.props.translations.nameLabel,
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
        const {translations} = this.props;
        if (id !== false) {
            this.props.onInitCategory(id, (category) => {
                this.setState({category, editCategory: true});
                this.showDialog(translations.editCategory);
            })
        } else {
            this.setState({editCategory: false});
            this.showDialog(translations.newCategory);
        }
    };

    updateCategory = (name, value) => {
        const category = this.state.category;
        category[name] = value;
        this.setState({category});
    };

    changeInputHandler = (name, save = false, value = this.state.category.name) => {
        const {translations} = this.props;
        const controls = this.state.controls;
        valid(controls, value, name, translations, (newControls) => {
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
        const {translations} = this.props;
        const dialog = generateDialogObject(
            title,
            false,
            {
                [translations.save]: () => this.changeInputHandler('name', true),
                [translations.cancel]: () => this.props.toggleModal()
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
    return {
        theme: state.theme.theme,
        translations: {
            ...state.settings.translations.ConfigCategory,
            ...state.settings.translations.validation,
            ...state.settings.translations.common
        }
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onInitCategory: (id, callback) => dispatch(actions.initCategory(id, callback)),
        onSaveCategory: (category, callback) => dispatch(actions.saveCategory(category, callback)),
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(ConfigCategory);