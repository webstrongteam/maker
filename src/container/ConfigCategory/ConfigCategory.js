import React, { PureComponent } from "react";
import Dialog from "react-native-dialog";
import Input from '../../components/UI/Input/Input';

import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

class ConfigCategory extends PureComponent {
    state = {
        category: {
            id: false,
            name: ''
        },
        controls: {
            name: {
                elementConfig: {
                    label: 'Enter category name',
                    characterRestriction: 30
                }
            }
        },
        editCategory: null
    };

    componentDidMount() {
        const {editCategory} = this.props;
        this.initCategory(editCategory);
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.editCategory !== this.props.editCategory) {
            this.initCategory(this.props.editCategory);
        }
    }

    initCategory = (category) => {
        if (category) this.setState({category, editCategory: true});
        else this.setState({
            category: {id: false, name: ''},
            editCategory: false
        });
    };

    updateCategory = (name, value) => {
        const category = this.state.category;
        category[name] = value;
        this.setState({ category });
    };

    valid = (value = this.state.category.name) => {
        const newControls = this.state.controls;
        if (value.trim() === '') {
            newControls.name.elementConfig.error = `Category name is required!`;
        } else {
            delete newControls.name.elementConfig.error;
        }
        this.setState({ controls: newControls })
    };

    render() {
        const { editCategory, controls, category } = this.state;
        const { showModal, theme } = this.props;

        return (
            <Dialog.Container visible={showModal}>
                <Dialog.Title>{editCategory ? 'Edit category' : 'New category'}</Dialog.Title>
                <Input
                    elementConfig={controls.name.elementConfig}
                    focus={true}
                    color={theme.primaryColor}
                    value={category.name}
                    changed={(value) => {
                        if (value.length <= controls.name.elementConfig.characterRestriction) {
                            this.valid(value);
                            this.updateCategory('name', value);
                        } else {
                            this.valid(value);
                        }
                    }}
                />
                <Dialog.Button
                    label="Save"
                    onPress={() => {
                        if (category.name.trim() !== '') {
                            this.props.toggleModal(category);
                            this.props.onSaveCategory(category, () => {
                                this.updateCategory('name', '');
                            });
                        } else this.valid();
                    }}
                />
                <Dialog.Button
                    label="Cancel"
                    onPress={() => {
                        this.props.toggleModal();
                    }}
                />
            </Dialog.Container>
        );
    }
}

const mapStateToProps = state => {
    return {
        category: state.categories.category,
        theme: state.theme.theme
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onSaveCategory: (category, callback) => dispatch(actions.saveCategory(category, callback)),
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(ConfigCategory);