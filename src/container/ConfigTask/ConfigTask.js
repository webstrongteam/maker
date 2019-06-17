import React, { Component } from "react";
import {View, Picker, StyleSheet, ScrollView, ActivityIndicator} from 'react-native';
import DatePicker from 'react-native-datepicker'
import {Toolbar, Subheader, IconToggle, Button} from 'react-native-material-ui';
import Template from '../Template/Template';
import Input from '../../components/UI/Input/Input';
import ConfigCategory from '../ConfigCategory/ConfigCategory';
import Dialog from '../../components/UI/Dialog/Dialog';
import moment from 'moment';

import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

class ConfigTask extends Component {
    state = {
        controls: {
            name: {
                elementConfig: {
                    label: 'Enter task name',
                    characterRestriction: 30,
                }
            },
            description: {
                elementConfig: {
                    label: 'Enter task description',
                    multiline: true
                }
            }
        },
        repeat: {
            noRepeat: {
                name: 'No repeat',
                value: 'noRepeat'
            },
            onceDay: {
                name: 'Once a Day',
                value: 'onceDay'
            },
            onceDayMonFri: {
                name: 'Once a Week (Mon-Fri)',
                value: 'onceDayMonFri'
            },
            onceDaySatSun: {
                name: 'Once a Week (Sat-Sun)',
                value: 'onceDaySatSun'
            },
            onceWeek: {
                name: 'Once a Week',
                value: 'onceWeek'
            },
            onceMonth: {
                name: 'Once a Month',
                value: 'onceMonth'
            },
            onceYear: {
                name: 'Once a Year',
                value: 'onceYear'
            }
        },
        dialog: {
            title: '',
            description: '',
            buttons: {}
        },
        showDialog: false,
        editTask: false,
        showModal: false
    };

    componentDidMount() {
        const task = this.props.navigation.getParam('task', false);
        if (task) {
            this.props.onSetTask(task.id);
            this.setState({editTask: true});
        }
    }

    showDialog = (action) => {
        if (action === 'exit') {
            this.setState({
                showDialog: true,
                dialog: {
                    title: 'Are you sure?',
                    description: 'Quit without saving?',
                    buttons: {
                        yes: {
                            label: 'Yes',
                            onPress: () => {
                                this.setState({ showDialog: false });
                                this.props.navigation.goBack();
                                this.props.onDefaultTask();
                            }
                        },
                        save: {
                            label: 'Save',
                            onPress: () => {
                                this.setState({ showDialog: false });
                                this.props.onSaveTask(this.props.task);
                                this.props.onDefaultTask();
                                this.props.navigation.goBack();
                            }
                        },
                        cancel: {
                            label: 'Cancel',
                            onPress: () => {
                                this.setState({ showDialog: false });
                            }
                        }
                    }
                }
            });
        }
        else if (action === 'delete') {
            this.setState({
                showDialog: true,
                dialog: {
                    title: 'Are you sure?',
                    description: 'Delete this task?',
                    buttons: {
                        yes: {
                            label: 'Yes',
                            onPress: () => {
                                this.setState({ showDialog: false });
                                this.props.onRemoveTask(this.props.task);
                                this.props.onDefaultTask();
                                this.props.navigation.goBack();
                            }
                        },
                        cancel: {
                            label: 'Cancel',
                            onPress: () => {
                                this.setState({ showDialog: false });
                            }
                        }
                    }
                }
            });
        }
    };

    toggleModalHandler = () => {
        const { showModal } = this.state;
        this.setState({ showModal: !showModal });
    };

    addRef = (e, name) => {
        this[name] = e;
    };

    valid = (value = this.props.task.name) => {
        const newControls = this.state.controls;
        if (value.trim() === '') {
            newControls.name.elementConfig.error = `Task name is required!`;
        } else {
            delete newControls.name.elementConfig.error;
        }
        this.setState({ controls: newControls })
    };

    render() {
        const { controls, editTask, showModal, repeat, dialog, showDialog } = this.state;
        const { navigation, task, categories } = this.props;
        const edit = this.props.navigation.getParam('task', false);
        let loading = true;
        let date;
        let now;

        if (task.date.length > 12) {
            date = moment(task.date, 'DD-MM-YYYY - HH:mm');
            now = new Date();
        } else {
            date = moment(task.date, 'DD-MM-YYYY');
            now = new Date().setHours(0,0,0,0);
        }

        if (!edit) loading = false;
        else if (edit) {
            if (editTask) loading = false;
        }

        return (
            <Template>
                <Toolbar
                    leftElement="arrow-back"
                    rightElement={
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Button
                                text="Save"
                                style={{ text: { color: 'white' } }}
                                onPress={() => {
                                    if (task.name.trim() !== '') {
                                        this.props.onSaveTask(task);
                                        this.props.onDefaultTask();
                                        navigation.goBack();
                                    } else {
                                        this.valid();
                                    }
                                }}
                            />
                            {editTask && <IconToggle color="white" name="delete"
                                 onPress={() => {
                                    this.showDialog('delete');
                                 }}
                            />
                            }
                        </View>
                    }
                    onLeftElementPress={() => {
                        if (task.name.trim() !== '') {
                            this.showDialog('exit');
                        } else {
                            navigation.goBack();
                            this.props.onDefaultTask();
                        }
                    }}
                    centerElement={editTask ? "Edit task" : "New task"}
                />
                <Dialog
                    showModal={showDialog}
                    title={dialog.title}
                    description={dialog.description}
                    buttons={dialog.buttons}
                />
                <ConfigCategory
                    editCategory={false}
                    showModal={showModal}
                    toggleModal={this.toggleModalHandler}
                />
                {!loading ?
                    <React.Fragment>
                        <ScrollView>
                            <Input
                                elementConfig={controls.name.elementConfig}
                                focus={!editTask}
                                value={task.name}
                                changed={(value) => {
                                    if (value.length <= controls.name.elementConfig.characterRestriction) {
                                        this.valid(value);
                                        this.props.onChangeName(value);
                                    } else {
                                        this.valid(value);
                                    }
                                }}/>
                            <Input
                                elementConfig={controls.description.elementConfig}
                                value={task.description}
                                changed={this.props.onChangeDescription}/>
                            <View style={styles.container}>
                                <Subheader text="Due date"
                                    style={{
                                        container: styles.label,
                                        text: {color: '#f4511e'}
                                    }}
                                />
                                <DatePicker
                                    ref={(e) => this.addRef(e, 'datepickerDate')}
                                    style={{width: '100%'}}
                                    date={task.date.slice(0, 10)}
                                    mode="date"
                                    iconComponent={
                                        task.date ?
                                        <IconToggle onPress={() => this.props.onChangeDate('')} name='clear' /> :
                                        <IconToggle onPress={() => this.datepickerDate.onPressDate()} name='event' />
                                    }
                                    placeholder="Select due date"
                                    format="DD-MM-YYYY"
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateInput: styles.datePicker,
                                        dateText: {
                                            color: +date < +now ? '#ce3241' : '#333'
                                        }
                                    }}
                                    onDateChange={(date) => this.props.onChangeDate(date)}
                                />
                                {task.date !== '' &&
                                <React.Fragment>
                                    <DatePicker
                                        ref={(e) => this.addRef(e, 'datepickerTime')}
                                        style={{width: '100%'}}
                                        date={task.date.slice(13, 18)}
                                        mode="time"
                                        iconComponent={
                                            task.date.slice(13, 18) ?
                                                <IconToggle onPress={() => this.props.onChangeDate(task.date.slice(0, 10))} name='clear' /> :
                                                <IconToggle onPress={() => this.datepickerTime.onPressDate()} name='access-time' />
                                        }
                                        placeholder="Select due time"
                                        format="HH:mm"
                                        confirmBtnText="Confirm"
                                        cancelBtnText="Cancel"
                                        customStyles={{
                                            dateInput: styles.datePicker,
                                            dateText: {
                                                color: +date < +now ? '#ce3241' : '#333'
                                            }
                                        }}
                                        onDateChange={(date) => this.props.onChangeDate(`${task.date.slice(0, 10)} - ${date}`)}
                                    />
                                    <Subheader text="Repeat"
                                        style={{
                                            container: styles.label,
                                            text: {color: '#f4511e'}
                                        }}
                                    />
                                    <View style={styles.picker}>
                                        <Picker
                                            selectedValue={repeat[task.repeat].value}
                                            onValueChange={(itemValue, itemIndex) =>
                                            this.props.onChangeRepeat(itemValue)}>
                                            {Object.keys(repeat).map(name => (
                                                <Picker.Item key={name} label={repeat[name].name} value={repeat[name].value} />
                                            ))}
                                        </Picker>
                                    </View>
                                </React.Fragment>
                                }
                                <Subheader text="Category"
                                    style={{
                                        container: styles.label,
                                        text: {color: '#f4511e'}
                                    }}
                                />
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
                                <Subheader text="Priority"
                                    style={{
                                        container: styles.label,
                                        text: {color: '#f4511e'}
                                    }}
                                />
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
                    </React.Fragment> :
                    <View style={[styles.container, styles.horizontal]}>
                        <ActivityIndicator size="large" color="#0000ff"/>
                    </View>
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
        marginRight: 5,
        marginLeft: 5,
        borderColor: '#f4511e',
        borderBottomWidth: 0.5,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderTopWidth: 0
    },
    category: {
        width: '85%',
        height: 50,
        borderWidth: 0
    },
    selectCategory: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    picker: {
        width: '100%',
        height: 50,
        borderWidth: 0
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
        onChangeRepeat: (value) => dispatch(actions.changeRepeat(value)),
        onSetTask: (id) => dispatch(actions.setTask(id)),
        onSaveTask: (task) => dispatch(actions.saveTask(task)),
        onRemoveTask: (task) => dispatch(actions.removeTask(task, false)),
        onDefaultTask: () => dispatch(actions.defaultTask())
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigTask);