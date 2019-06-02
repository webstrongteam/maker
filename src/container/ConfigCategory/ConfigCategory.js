import React, { Component } from "react";
import {View, StyleSheet, Modal} from 'react-native';
import {Button, Toolbar} from "react-native-material-ui";
import Input from '../../components/UI/Input/Input';

import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

class ConfigCategory extends Component {
    state = {
        controls: {
            name: {
                elementConfig: {
                    placeholder: 'Enter category name',
                    autoFocus: true
                }
            },
        },
        editCategory: false
    };

    componentDidMount() {
        const {editCategory} = this.props;
        if (editCategory) {
            this.props.onSetCategory(editCategory);
            this.setState({editCategory: true});
        }
    }

    render() {
        const { controls, editCategory } = this.state;
        const { category, showModal } = this.props;

        return (
            <View>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={showModal}
                    onRequestClose={() => {}}>
                    <View>
                        <Toolbar
                            leftElement="arrow-back"
                            rightElement={
                                <Button
                                    text="Save"
                                    style={{ text: { color: 'white' } }}
                                    onPress={() => {
                                        this.props.onSaveCategory();
                                        this.props.onDefaultCategory();
                                        this.props.toggleModal();
                                    }}
                                />
                            }
                            onLeftElementPress={() => {
                                this.props.onDefaultCategory();
                                this.props.toggleModal();
                            }}
                            centerElement={editCategory ? 'Edit category' : 'Create category'}
                        />
                        <Input
                            elementConfig={controls.name.elementConfig}
                            value={category.name}
                            changed={this.props.onChangeCategoryName} />
                    </View>
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        paddingLeft: 20,
        paddingRight: 20,
        display: 'flex',
        alignItems: "center",
        justifyContent: "center"
    },
    datePicker: {

    },
    category: {
        width: '85%',
        height: 50,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: '#d6d7da',
    },
    selectCategory: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },
    picker: {
        width: '100%',
        height: 50,
        borderRadius: 4,
        borderWidth: 0.5,
        borderColor: '#d6d7da',
    },
    label: {
        width: '100%'
    }
});

const mapStateToProps = state => {
    return {
        category: state.todo.category,
        isAuth: state.auth.isAuth
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onChangeCategoryName: (name) => dispatch(actions.changeCategoryName(name)),
        onSetCategory: (category) => dispatch(actions.setCategory(category)),
        onSaveCategory: () => dispatch(actions.saveCategory()),
        onDefaultCategory: () => dispatch(actions.defaultCategory())
    }
};
export default connect(mapStateToProps, mapDispatchToProps)(ConfigCategory);