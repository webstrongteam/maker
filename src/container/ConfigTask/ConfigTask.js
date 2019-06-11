import React, { Component } from "react";
import {View, Picker, StyleSheet, ScrollView, ActivityIndicator} from 'react-native';
import DatePicker from 'react-native-datepicker'
import {ActionButton, Toolbar, Subheader, Icon, IconToggle, Button} from 'react-native-material-ui';
import Template from '../Template/Template';
import Input from '../../components/UI/Input/Input';
import ConfigCategory from '../ConfigCategory/ConfigCategory';

import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

class ConfigTask extends Component {
    state = {
        controls: {
            name: {
                elementConfig: {
                    placeholder: 'Enter task name',
                    autoFocus: true
                }
            },
            description: {
                elementConfig: {
                    placeholder: 'Enter task description',
                    multiline: true,
                    numberOfLines: 3
                }
            }
        },
        editTask: false,
        showModal: false
    };

    componentDidMount() {
        const task = this.props.navigation.getParam('task', false);
        if (task) this.props.onSetTask(task.id);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps !== this.props) {
            this.setState({editTask: true});
        }
    }

    toggleModalHandler = () => {
        const { showModal } = this.state;
        this.setState({ showModal: !showModal });
    };

    render() {
        const { controls, editTask, showModal } = this.state;
        const { navigation, task, categories } = this.props;
        const edit = this.props.navigation.getParam('task', false);

        let loading = true;
        if (!edit) loading = false;
        else if (edit) {
            if (editTask) loading = false
        }

        return (
            <Template>
                <Toolbar
                    leftElement="arrow-back"
                    rightElement={
                        <Button
                            text="Save"
                            style={{ text: { color: 'white' } }}
                            onPress={() => {
                                this.props.onSaveTask(task);
                                this.props.onDefaultTask();
                                navigation.goBack();
                            }}
                        />
                    }
                    onLeftElementPress={() => {
                        navigation.goBack();
                        this.props.onDefaultTask();
                    }}
                    centerElement={editTask ? "Edit task" : "New task"}
                />
                {!loading ?
                    <React.Fragment>
                        <ScrollView>
                            <Input
                                elementConfig={controls.name.elementConfig}
                                value={task.name}
                                changed={this.props.onChangeName}/>
                            <Input
                                elementConfig={controls.description.elementConfig}
                                value={task.description}
                                changed={this.props.onChangeDescription}/>
                            <View style={styles.container}>
                                <Subheader
                                    style={{
                                        container: styles.label
                                    }}
                                    text="Due date"/>
                                <DatePicker
                                    style={{width: '100%'}}
                                    date={task.date}
                                    mode="date"
                                    iconComponent={<Icon name="update"/>}
                                    placeholder="Select due date"
                                    format="DD-MM-YYYY"
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateInput: {
                                            marginRight: 5
                                        }
                                    }}
                                    onDateChange={(date) => this.props.onChangeDate(date)}
                                />
                                <Subheader
                                    style={{
                                        container: styles.label
                                    }}
                                    text="Category"/>
                                <View style={styles.selectCategory}>
                                    <View style={styles.category}>
                                        <Picker
                                            selectedValue={task.category}
                                            onValueChange={(itemValue, itemIndex) =>
                                                this.props.onChangeCategory(itemValue)
                                            }>
                                            {categories.map(cate => (
                                                <Picker.Item key={cate.id} label={cate.name} value={cate.name}/>
                                            ))}
                                        </Picker>
                                    </View>
                                    <IconToggle onPress={() => this.toggleModalHandler()} name="playlist-add"/>
                                </View>
                                <Subheader
                                    style={{
                                        container: styles.label
                                    }}
                                    text="Priority"/>
                                <View style={styles.picker}>
                                    <Picker
                                        selectedValue={task.priority}
                                        onValueChange={(itemValue, itemIndex) =>
                                            this.props.onChangePriority(itemValue)
                                        }>
                                        <Picker.Item label="None" value="none"/>
                                        <Picker.Item label="Low" value="low"/>
                                        <Picker.Item label="Medium" value="medium"/>
                                        <Picker.Item label="High" value="high"/>
                                    </Picker>
                                </View>
                            </View>
                        </ScrollView>
                        {editTask ?
                            <ActionButton
                                actions={[
                                    {
                                        icon: 'check',
                                        label: 'Save'
                                    },
                                    {
                                        icon: 'delete',
                                        label: 'Delete'
                                    }
                                ]}
                                onPress={(label) => {
                                    if (label === "delete") {
                                        this.props.onRemoveTask(task);
                                        this.props.onDefaultTask();
                                        navigation.goBack();
                                    } else if (label === "check") {
                                        this.props.onSaveTask(task);
                                        this.props.onDefaultTask();
                                        navigation.goBack();
                                    }
                                }}
                                icon="menu"
                                transition="speedDial"
                            /> :
                            <ActionButton
                                onPress={() => {
                                    this.props.onSaveTask(task);
                                    this.props.onDefaultTask();
                                    navigation.goBack();
                                }}
                                icon="check"
                            />
                        }
                    </React.Fragment> :
                    <View style={[styles.container, styles.horizontal]}>
                        <ActivityIndicator size="large" color="#0000ff"/>
                    </View>
                }
                {showModal &&
                    <ConfigCategory
                        editCategory={false}
                        navigation={navigation}
                        showModal={showModal}
                        toggleModal={this.toggleModalHandler}
                    />
                }
            </Template>
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
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 50
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
        task: state.tasks.task,
        categories: state.categories.categories,
        isAuth: state.auth.isAuth
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onChangeName: (name) => dispatch(actions.changeName(name)),
        onChangeDescription: (description) => dispatch(actions.changeDescription(description)),
        onChangeDate: (date) => dispatch(actions.changeDate(date)),
        onChangeCategory: (category) => dispatch(actions.changeCategory(category)),
        onChangePriority: (priority) => dispatch(actions.changePriority(priority)),
        onSetTask: (id) => dispatch(actions.setTask(id)),
        onSaveTask: (task) => dispatch(actions.saveTask(task)),
        onRemoveTask: (task) => dispatch(actions.removeTask(task)),
        onDefaultTask: () => dispatch(actions.defaultTask())
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigTask);