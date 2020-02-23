import React, {Component} from "react";
import Dialog from '../../../components/UI/Dialog/Dialog';
import Input from '../../../components/UI/Input/Input';
import {generateDialogObject, valid} from '../../../shared/utility';

import {connect} from 'react-redux';
import * as actions from '../../../store/actions';

class ConfigCategory extends Component {
    state = {
        category: {id: false, name: ''},
        control: {
            label: this.props.translations.nameLabel,
            required: true,
            characterRestriction: 20,
            error: true
        },
        editCategory: null,
        dialog: false
    };

    componentDidMount() {
        this.initCategory(this.props.category);
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.category !== this.props.category) {
            this.initCategory(this.props.category);
        }
    }

    initCategory = (id) => {
        const {translations} = this.props;
        if (id !== false) {
            this.props.onInitCategory(id, (category) => {
                this.setState({category, editCategory: true});
                this.showDialog(translations.editCategory);
            })
        } else {
            this.setState({
                category: {id: false, name: ''},
                editCategory: false
            });
            this.showDialog(translations.newCategory);
        }
    };

    showDialog = (title) => {
        const {translations} = this.props;
        const dialog = generateDialogObject(
            title,
            false,
            {
                [translations.save]: () => {
                    const {category, control} = this.state;
                    if (!control.error) {
                        this.props.onSaveCategory(category, () => {
                            this.props.onInitCategories(() => {
                                this.state.editCategory && this.props.onRefreshTask();
                                this.props.toggleModal(category);
                            });
                        });
                    }
                },
                [translations.cancel]: () => this.props.toggleModal()
            }
        );
        this.setState({dialog});
    };

    render() {
        const {dialog, control, category} = this.state;
        const {showModal} = this.props;

        return (
            <React.Fragment>
                {dialog && category &&
                <Dialog
                    showModal={showModal}
                    title={dialog.title}
                    buttons={dialog.buttons}>
                    <Input
                        elementConfig={control}
                        focus={true}
                        value={category.name}
                        changed={(value, control) => {
                            const {category} = this.state;
                            category.name = value;
                            this.setState({category, control});
                        }}
                    />
                </Dialog>
                }
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        translations: {
            ...state.settings.translations.ConfigCategory,
            ...state.settings.translations.validation,
            ...state.settings.translations.common
        }
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onInitCategories: (callback) => dispatch(actions.initCategories(callback)),
        onInitCategory: (id, callback) => dispatch(actions.initCategory(id, callback)),
        onSaveCategory: (category, callback) => dispatch(actions.saveCategory(category, callback)),
        onRefreshTask: () => dispatch(actions.onRefresh())
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(ConfigCategory);