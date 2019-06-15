import React, { Component } from "react";
import {View} from 'react-native';
import Dialog from "react-native-dialog";

import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

class ConfigCategory extends Component {
    state = {
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

    render() {
        const { editCategory } = this.state;
        const { category, showModal } = this.props;

        return (
            <View>
                <Dialog.Container visible={showModal}>
                    <Dialog.Title>{editCategory ? 'Edit category' : 'New category'}</Dialog.Title>
                    <Dialog.Input
                        value={category.name}
                        placeholder="Enter category name"
                        autoFocus={true}
                        onChangeText={this.props.onChangeCategoryName} />
                    <Dialog.Button
                        label="Save"
                        onPress={() => {
                            if (category.name.trim() !== '') {
                                this.props.onSaveCategory(category);
                                this.props.onChangeCategory(category.name);
                                this.props.onDefaultCategory();
                                this.props.toggleModal();
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