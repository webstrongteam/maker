import React, { Component } from "react";
import {View, Picker, StyleSheet, ScrollView, ActivityIndicator} from 'react-native';
import DatePicker from 'react-native-datepicker';
import {Toolbar, Subheader, IconToggle, Button} from 'react-native-material-ui';
import Template from '../Template/Template';
import Input from '../../components/UI/Input/Input';
import ConfigCategory from '../ConfigCategory/ConfigCategory';
import Dialog from '../../components/UI/Dialog/Dialog';
import OtherRepeat from './OtherRepeat/OtherRepeat';
import { convertNumberToDate } from '../../shared/utility';
import moment from 'moment';

import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

import { SQLite } from 'expo';
const db = SQLite.openDatabase('maker.db');

class ConfigTask extends Component {
    state = {
        task: {
            id: false,
            name: '',
            description: '',
            date: '',
            repeat: 'noRepeat',
            category: '',
            priority: 'none',
        },
        controls: {
            name: {
                elementConfig: {
                    label: 'Enter task name',
                    characterRestriction: 40,
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
        otherOption: 'Other...',
        selectedTime: 0,
        repeatValue: '1',
        showOtherRepeat: false,
        showDialog: false,
        editTask: false,
        showModal: false
    };

    componentDidMount() {
        const task = this.props.navigation.getParam('task', false);
        if (task) {
            db.transaction(
                tx => {
                    tx.executeSql('select * from tasks where id = ?', [task.id], (_, {rows}) => {
                        this.initTask(rows._array[0]);
                    });
                }, (err) => console.warn(err), null
            );
        }
        else {
            const checkExistCategory = this.props.categories.filter(cate => cate.name === this.state.task.category);
                if (!checkExistCategory.length) {
                    this.updateTask('category', this.props.categories[0].name);
            }
        }
    }

    initTask = (task) => {
        const { categories } = this.props;
        let selectedTime = 0;
        let repeatValue = '1';
        let otherOption = 'Other...';

        if (+task.repeat === parseInt(task.repeat, 10)) {
            selectedTime = task.repeat[0];
            repeatValue = task.repeat.substring(1);
            otherOption = `Other (${+repeatValue} ${convertNumberToDate(+selectedTime)})`;
        }

        const checkExistCategory = categories.filter(cate => cate.name === task.category);
        if (!checkExistCategory.length) task.category = categories[0].name;

        this.setState({editTask: true, task, otherOption, repeatValue, selectedTime});
    };

    updateTask = (name, value) => {
        const task = this.state.task;
        task[name] = value;
        this.setState({ task });
    };

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
                            }
                        },
                        save: {
                            label: 'Save',
                            onPress: () => {
                                if (this.state.task.name.trim() !== '') {
                                    this.props.onSaveTask(this.state.task);
                                    this.props.navigation.goBack();
                                } else this.valid();
                                this.setState({ showDialog: false });
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
                                this.props.onRemoveTask(this.state.task);
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

    updateRepeat = (repeat) => {
        if (repeat === this.state.otherOption) {
            this.setState({ showOtherRepeat: true });
        } else {
            this.updateTask('repeat', repeat);
        }
    };

    saveOtherRepeat = () => {
        const { selectedTime, repeatValue } = this.state;
        const repeat = selectedTime + repeatValue;
        const otherOption = `Other (${repeatValue} ${convertNumberToDate(+selectedTime)})`;
        this.updateTask('repeat', repeat);
        this.setState({ otherOption, showOtherRepeat: false });
    };

    valid = (value = this.state.task.name) => {
        const newControls = this.state.controls;
        if (value.trim() === '') {
            newControls.name.elementConfig.error = `Task name is required!`;
        } else {
            delete newControls.name.elementConfig.error;
        }
        this.setState({ controls: newControls })
    };

    render() {
        const { task, controls, editTask, showModal, repeat, dialog, showDialog, otherOption, selectedTime, showOtherRepeat, repeatValue } = this.state;
        const { navigation, categories, theme } = this.props;
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
                                style={{ text: { color: theme.headerTextColor } }}
                                onPress={() => {
                                    if (task.name.trim() !== '') {
                                        this.props.onSaveTask(task);
                                        navigation.goBack();
                                    } else this.valid();
                                }}
                            />
                            {editTask && <IconToggle color={theme.headerTextColor} name="delete"
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
                        }
                    }}
                    centerElement={!loading ?
                        editTask ?
                            "Edit task" :
                            "New task" :
                        <ActivityIndicator size="small" color="#f4a442" />
                    }
                />
                <OtherRepeat
                    showModal={showOtherRepeat}
                    repeat={repeatValue}
                    selectedTime={selectedTime}
                    onSetRepeat={value => this.setState({ repeatValue: value })}
                    onSelectTime={value => this.setState({ selectedTime: value })}
                    save={this.saveOtherRepeat}
                    cancel={() => this.setState({ showOtherRepeat: false })}
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
                                color={theme.primaryColor}
                                changed={(value) => {
                                    if (value.length <= controls.name.elementConfig.characterRestriction) {
                                        this.valid(value);
                                        this.updateTask('name', value);
                                    } else {
                                        this.valid(value);
                                    }
                                }}/>
                            <Input
                                elementConfig={controls.description.elementConfig}
                                value={task.description}
                                color={theme.primaryColor}
                                changed={value => this.updateTask('description', value)}/>
                            <View style={styles.container}>
                                <Subheader text="Due date"
                                    style={{
                                        container: styles.label,
                                        text: {color: theme.primaryColor}
                                    }}
                                />
                                <DatePicker
                                    ref={(e) => this.datepickerDate = e}
                                    style={{width: '100%'}}
                                    date={task.date.slice(0, 10)}
                                    mode="date"
                                    iconComponent={
                                        task.date ?
                                        <IconToggle onPress={() => this.updateTask('date', '')} name='clear' /> :
                                        <IconToggle onPress={() => this.datepickerDate.onPressDate()} name='event' />
                                    }
                                    placeholder="Select due date"
                                    format="DD-MM-YYYY"
                                    confirmBtnText="Confirm"
                                    cancelBtnText="Cancel"
                                    customStyles={{
                                        dateInput: styles.datePicker,
                                        dateText: {
                                            color: +date < +now ? theme.overdueColor : theme.textColor
                                        }
                                    }}
                                    onDateChange={(date) => this.updateTask('date', date)}
                                />
                                {task.date !== '' &&
                                <React.Fragment>
                                    <DatePicker
                                        ref={(e) => this.datepickerTime = e}
                                        style={{width: '100%'}}
                                        date={task.date.slice(13, 18)}
                                        mode="time"
                                        iconComponent={
                                            task.date.slice(13, 18) ?
                                                <IconToggle onPress={() => this.updateTask('date', task.date.slice(0, 10))} name='clear' /> :
                                                <IconToggle onPress={() => this.datepickerTime.onPressDate()} name='access-time' />
                                        }
                                        placeholder="Select due time"
                                        format="HH:mm"
                                        confirmBtnText="Confirm"
                                        cancelBtnText="Cancel"
                                        customStyles={{
                                            dateInput: styles.datePicker,
                                            dateText: {
                                                color: +date < +now ? theme.overdueColor : theme.textColor
                                            }
                                        }}
                                        onDateChange={(date) => this.updateTask('date', `${task.date.slice(0, 10)} - ${date}`)}
                                    />
                                    <Subheader text="Repeat"
                                        style={{
                                            container: styles.label,
                                            text: {color: '#f4511e'}
                                        }}
                                    />
                                    <View style={styles.picker}>
                                        <Picker
                                            selectedValue={
                                                repeat[task.repeat] ?
                                                    repeat[task.repeat].value :
                                                    otherOption
                                            }
                                            onValueChange={value => this.updateRepeat(value)}>
                                            {Object.keys(repeat).map(name => (
                                                <Picker.Item key={name} label={repeat[name].name} value={repeat[name].value} />
                                            ))}
                                            <Picker.Item label={otherOption} value={otherOption} />
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
                                            onValueChange={value => this.updateTask('category', value)}>
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
                                        onValueChange={value => this.updateTask('priority', value)}>
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
        categories: state.categories.categories,
        theme: state.theme.theme
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onSaveTask: (task) => dispatch(actions.saveTask(task)),
        onRemoveTask: (task) => dispatch(actions.removeTask(task, false)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigTask);
