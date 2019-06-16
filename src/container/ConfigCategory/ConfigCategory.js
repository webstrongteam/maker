import React, { Component } from "react";
import {View} from 'react-native';
import Dialog from "react-native-dialog";
import Input from '../../components/UI/Input/Input';

import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

class ConfigCategory extends Component {
    state = {
        controls: {
            name: {
                elementConfig: {
                    label: 'Enter category name',
                    characterRestriction: 40
                }
            }
        },
        editCategory: null
    };

    componentDidMount() {
        const {editCategory} = this.props;
        if (editCategory) {
            this.props.onSetCategory(editCategory.id);
        } else {
            this.setState({editCategory: false});
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.refresh !== this.props.refresh) {
            this.setState({editCategory: true});
        }
        else if (prevProps.editCategory !== this.props.editCategory) {
            if (this.props.editCategory) {
                this.props.onSetCategory(this.props.editCategory.id);
            } else {
                this.setState({editCategory: false});
            }
        }
    }

    valid = (value = this.props.category.name) => {
        const newControls = this.state.controls;
        if (value.trim() === '') {
            newControls.name.elementConfig.error = `Category name is required!`;
        } else {
            delete newControls.name.elementConfig.error;
        }
        this.setState({ controls: newControls })
    };

    render() {
        const { editCategory, controls } = this.state;
        const { category, showModal } = this.props;

        return (
            <View>
                <Dialog.Container visible={showModal}>
                    <Dialog.Title>{editCategory ? 'Edit category' : 'New category'}</Dialog.Title>
                    <Input
                        elementConfig={controls.name.elementConfig}
                        focus={true}
                        value={category.name}
                        changed={(value) => {
                            this.valid(value);
                            this.props.onChangeCategoryName(value);
                        }}
                    />
                    <Dialog.Button
                        label="Save"
                        onPress={() => {
                            if (category.name.trim() !== '') {
                                this.props.onSaveCategory(category);
                                this.props.onChangeCategory(category.name);
                                this.props.onDefaultCategory();
                                this.props.toggleModal();
                            } else {
                                this.valid();
                            }
                        }}
                    />
                    <Dialog.Button
                        label="Cancel"
                        onPress={() => {
                            this.props.onDefaultCategory();
                            this.props.toggleModal();
                        }}
                    />
                </Dialog.Container>
            </View>
        );
    }
}

const mapStateToProps = state => {
    return {
        category: state.categories.category,
        isAuth: state.auth.isAuth
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onChangeCategory: (category) => dispatch(actions.changeCategory(category)),
        onChangeCategoryName: (name) => dispatch(actions.changeCategoryName(name)),
        onSetCategory: (id) => dispatch(actions.setCategory(id)),
        onSaveCategory: (category) => dispatch(actions.saveCategory(category)),
        onDefaultCategory: () => dispatch(actions.defaultCategory())
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(ConfigCategory);