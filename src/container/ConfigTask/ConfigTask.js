import React, { Component } from "react";
import {View, Picker, StyleSheet, ScrollView} from 'react-native';
import DatePicker from 'react-native-datepicker';
import {Toolbar, Subheader, IconToggle, Button} from 'react-native-material-ui';
import Spinner from '../../components/UI/Spinner/Spinner';
import Template from '../Template/Template';
import Input from '../../components/UI/Input/Input';
import ConfigCategory from '../ConfigCategory/ConfigCategory';
import Dialog from '../../components/UI/Dialog/Dialog';
import OtherRepeat from './OtherRepeat/OtherRepeat';
import {convertNumberToDate, generateDialogObject, valid} from '../../shared/utility';
import {fullWidth} from '../../shared/styles';
import {BannerAd} from "../../../adsAPI";
import moment from 'moment';

import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

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
                label: 'Enter task name',
                required: true,
                characterRestriction: 40,
            },
            description: {
                label: 'Enter task description',
                multiline: true
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
        dialog: null,
        otherOption: 'Other...',
        selectedTime: 0,
        repeatValue: '1',
        showOtherRepeat: false,
        showDialog: false,
        editTask: null,
        showCategory: false,
        loading: true
    };

    componentDidMount() {
        const task = this.props.navigation.getParam('task', false);
        if (task !== false) this.initTask(task);
        else {
            const checkExistCategory = this.props.categories.filter(cate => cate.name === this.state.task.category);
            if (!checkExistCategory.length) {
                this.updateTask('category', this.props.categories[0].name);
            }
            this.setState({ editTask: false, loading: false });
        }
    };

    initTask = (id) => {
        const { categories } = this.props;
        this.props.onInitTask(id, (task) => {
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

            this.setState({
                editTask: true, task,
                otherOption, repeatValue,
                selectedTime, loading: false
            });
        });
    };

    updateTask = (name, value) => {
        const task = this.state.task;
        task[name] = value;
        this.setState({ task });
    };

    showDialog = (action) => {
        const {task} = this.state;
        let dialog;
        if (action === 'exit') {
            dialog = generateDialogObject(
                'Are you sure?',
                'Quit without saving?',
                {
                    Yes: () => {
                        this.setState({ showDialog: false });
                        this.props.navigation.goBack();
                    },
                    Save: () => {
                        this.checkValid('name', true);
                        this.setState({ showDialog: false });
                    },
                    Cancel: () => {
                        this.setState({ showDialog: false });
                    }
                }
            );
        }
        else if (action === 'delete') {
            dialog = generateDialogObject(
                'Are you sure?',
                'Delete this task?',
                {
                    Yes: () => {
                        this.setState({ showDialog: false });
                        this.props.onRemoveTask(task);
                        this.props.navigation.goBack();
                    },
                    Cancel: () => {
                        this.setState({ showDialog: false });
                    }
                }
            );
        }
        this.setState({showDialog: true, dialog});
    };

    toggleModalHandler = (category = false) => {
        const { showCategory, task } = this.state;
        if (category) {
            task.category = category.name;
            this.setState({ task, showCategory: !showCategory });
        } else {
            this.setState({ showCategory: !showCategory });
        }
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

    checkValid = (name, save = false, value = this.state.task.name) => {
        const controls = this.state.controls;
        valid(controls, value, name, (newControls) => {
            this.updateTask(name, value);
            if (save && !newControls[name].error) {
                const {task} = this.state;
                const {navigation} = this.props;
                this.props.onSaveTask(task);
                navigation.goBack();
            } this.setState({ controls: newControls });
        })
    };

    render() {
        const { task, controls, loading, editTask, showCategory, repeat, dialog, showDialog, otherOption, selectedTime, showOtherRepeat, repeatValue } = this.state;
        const { navigation, categories, theme, settings } = this.props;
        let date;
        let now;

        if (task.date.length > 12) {
            date = moment(task.date, 'DD-MM-YYYY - HH:mm');
            now = new Date();
        } else {
            date = moment(task.date, 'DD-MM-YYYY');
            now = new Date().setHours(0,0,0,0);
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
                                onPress={() => this.checkValid('name', true)}
                            />
                            {editTask && <IconToggle name="delete"
                                color={theme.headerTextColor}
                                onPress={() => this.showDialog('delete')} />
                            }
                        </View>
                    }
                    onLeftElementPress={() => {
                        if (task.name.trim() !== '') {
                            this.showDialog('exit');
                        } else navigation.goBack();
                    }}
                    centerElement={
                        !loading ?
                        editTask ?
                            "Edit task" :
                            "New task" :
                        <View style={{marginTop: 10}}>
                            <Spinner color={theme.secondaryBackgroundColor} size='small' />
                        </View>
                    }
                />

                {showOtherRepeat &&
                <OtherRepeat
                    showModal={showOtherRepeat}
                    repeat={repeatValue}
                    selectedTime={selectedTime}
                    onSetRepeat={value => this.setState({repeatValue: value})}
                    onSelectTime={value => this.setState({selectedTime: value})}
                    save={this.saveOtherRepeat}
                    cancel={() => this.setState({showOtherRepeat: false})}
                />
                }
                {showCategory &&
                <ConfigCategory
                    showModal={showCategory}
                    category={{id: false, name: ''}}
                    toggleModal={this.toggleModalHandler}
                />
                }
                {showDialog &&
                <Dialog
                    showModal={showDialog}
                    title={dialog.title}
                    description={dialog.description}
                    buttons={dialog.buttons}
                />
                }

                {!loading ?
                <ScrollView>
                    <Input
                        elementConfig={controls.name}
                        focus={!editTask}
                        value={task.name}
                        changed={(value) => {
                            this.checkValid('name', false, value)
                        }}/>
                    <Input
                        elementConfig={controls.description}
                        value={task.description}
                        changed={value => this.updateTask('description', value)}/>
                    <View style={styles.container}>
                        <Subheader text="Due date"
                                   style={{
                                       container: fullWidth,
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
                                    <IconToggle onPress={() => this.updateTask('date', '')} name='clear'/> :
                                    <IconToggle onPress={() => this.datepickerDate.onPressDate()} name='event'/>
                            }
                            placeholder="Select due date"
                            format="DD-MM-YYYY"
                            confirmBtnText="Confirm"
                            cancelBtnText="Cancel"
                            customStyles={{
                                dateInput: [styles.datePicker, {borderColor: theme.primaryColor}],
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
                                is24Hour={!!settings.timeFormat}
                                mode="time"
                                iconComponent={
                                    task.date.slice(13, 18) ?
                                        <IconToggle onPress={() => this.updateTask('date', task.date.slice(0, 10))}
                                                    name='clear'/> :
                                        <IconToggle onPress={() => this.datepickerTime.onPressDate()}
                                                    name='access-time'/>
                                }
                                placeholder="Select due time"
                                format="HH:mm"
                                confirmBtnText="Confirm"
                                cancelBtnText="Cancel"
                                customStyles={{
                                    dateInput: [styles.datePicker, {borderColor: theme.primaryColor}],
                                    dateText: {
                                        color: +date < +now ? theme.overdueColor : theme.textColor
                                    }
                                }}
                                onDateChange={(date) => this.updateTask('date', `${task.date.slice(0, 10)} - ${date}`)}
                            />
                            <Subheader text="Repeat"
                                       style={{
                                           container: fullWidth,
                                           text: {color: theme.primaryColor}
                                       }}
                            />
                            <View style={styles.picker}>
                                <Picker
                                    style={{color: theme.textColor}}
                                    selectedValue={
                                        repeat[task.repeat] ?
                                            repeat[task.repeat].value :
                                            otherOption
                                    }
                                    onValueChange={value => this.updateRepeat(value)}>
                                    {Object.keys(repeat).map(name => (
                                        <Picker.Item key={name}
                                                     label={repeat[name].name}
                                                     value={repeat[name].value}/>
                                    ))}
                                    <Picker.Item label={otherOption}
                                                 value={otherOption}/>
                                </Picker>
                            </View>
                        </React.Fragment>
                        }
                        <Subheader text="Category"
                                   style={{
                                       container: fullWidth,
                                       text: {color: theme.primaryColor}
                                   }}
                        />
                        <View style={styles.selectCategory}>
                            <View style={styles.category}>
                                <Picker
                                    style={{color: theme.textColor}}
                                    selectedValue={task.category}
                                    onValueChange={value => this.updateTask('category', value)}>
                                    {categories.map(cate => (
                                        <Picker.Item key={cate.id}
                                                     label={cate.name}
                                                     value={cate.name}/>
                                    ))}
                                </Picker>
                            </View>
                            <IconToggle onPress={() => this.toggleModalHandler()} name="playlist-add"/>
                        </View>
                        <Subheader text="Priority"
                                   style={{
                                       container: fullWidth,
                                       text: {color: theme.primaryColor}
                                   }}
                        />
                        <View style={styles.picker}>
                            <Picker
                                style={{color: theme.textColor}}
                                selectedValue={task.priority}
                                onValueChange={value => this.updateTask('priority', value)}>
                                <Picker.Item label="None" value="none"/>
                                <Picker.Item label="Low" value="low"/>
                                <Picker.Item label="Medium" value="medium"/>
                                <Picker.Item label="High" value="high"/>
                            </Picker>
                        </View>
                    </View>
                </ScrollView> : <Spinner/>
                }
                <BannerAd />
            </Template>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 20,
        display: 'flex',
        alignItems: "center",
        justifyContent: "center"
    },
    datePicker: {
        marginRight: 5,
        marginLeft: 5,
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
    }
});

const mapStateToProps = state => {
    return {
        categories: state.categories.categories,
        theme: state.theme.theme,
        settings: state.settings
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onInitTask: (id, callback) => dispatch(actions.initTask(id, callback)),
        onSaveTask: (task) => dispatch(actions.saveTask(task)),
        onRemoveTask: (task) => dispatch(actions.removeTask(task, false)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigTask);