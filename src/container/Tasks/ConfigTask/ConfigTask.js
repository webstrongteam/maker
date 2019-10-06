import React, {Component} from "react";
import {Picker, ScrollView, StyleSheet, View} from 'react-native';
import DatePicker from 'react-native-datepicker';
import {Button, Checkbox, IconToggle, Subheader, Toolbar} from 'react-native-material-ui';
import Spinner from '../../../components/UI/Spinner/Spinner';
import Template from '../../Template/Template';
import Input from '../../../components/UI/Input/Input';
import ConfigCategory from '../../Categories/ConfigCategory';
import Dialog from '../../../components/UI/Dialog/Dialog';
import OtherRepeat from './OtherRepeat/OtherRepeat';
import {convertNumberToDate, generateDialogObject, valid} from '../../../shared/utility';
import {configTask} from '../../../shared/configTask';
import {fullWidth} from '../../../shared/styles';
import {BannerAd} from "../../../../adsAPI";
import moment from 'moment';

import {connect} from 'react-redux';
import * as actions from '../../../store/actions';

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
            event_id: null,
            notification_id: null
        },
        controls: {
            name: {
                label: this.props.translations.nameLabel,
                required: true,
                characterRestriction: 40,
            },
            description: {
                label: this.props.translations.descriptionLabel,
                multiline: true
            }
        },
        repeat: {
            noRepeat: {
                name: this.props.translations.noRepeat,
                value: 'noRepeat'
            },
            onceDay: {
                name: this.props.translations.onceDay,
                value: 'onceDay'
            },
            onceDayMonFri: {
                name: this.props.translations.onceWeekMonFri,
                value: 'onceDayMonFri'
            },
            onceDaySatSun: {
                name: this.props.translations.onceWeekSatSun,
                value: 'onceDaySatSun'
            },
            onceWeek: {
                name: this.props.translations.onceWeek,
                value: 'onceWeek'
            },
            onceMonth: {
                name: this.props.translations.onceMonth,
                value: 'onceMonth'
            },
            onceYear: {
                name: this.props.translations.onceYear,
                value: 'onceYear'
            }
        },
        dialog: null,
        otherOption: `${this.props.translations.other}...`,
        selectedTime: 0,
        repeatValue: '1',
        showOtherRepeat: false,
        showDialog: false,
        editTask: null,
        showConfigCategory: false,
        changedSth: false,
        setEvent: false,
        setNotification: false,
        loading: true
    };

    componentDidMount() {
        const task = this.props.navigation.getParam('task', false);
        const category = this.props.navigation.getParam('category', false);
        if (task !== false) this.initTask(task);
        else {
            if (category && category !== this.props.translations.all) {
                this.updateTask('category', category);
            }
            const checkExistCategory = this.props.categories.filter(cate => cate.name === this.state.task.category);
            if (!checkExistCategory.length) {
                this.updateTask('category', this.props.categories[0].name);
            }
            this.setState({editTask: false, loading: false});
        }
    };

    initTask = (id) => {
        const {categories, translations} = this.props;
        this.props.onInitTask(id, (task) => {
            let selectedTime = 0;
            let repeatValue = '1';
            let otherOption = `${translations.other}...`;

            if (+task.repeat === parseInt(task.repeat, 10)) {
                selectedTime = task.repeat[0];
                repeatValue = task.repeat.substring(1);
                otherOption = `${translations.other} (${+repeatValue} ${convertNumberToDate(+selectedTime)})`;
            }

            const checkExistCategory = categories.filter(cate => cate.name === task.category);
            if (!checkExistCategory.length) task.category = categories[0].name;

            this.setState({
                editTask: true, task,
                otherOption, repeatValue,
                setEvent: task.event_id !== null,
                setNotification: task.notification_id !== null,
                selectedTime, loading: false
            });
        });
    };

    updateTask = (name, value) => {
        const task = this.state.task;
        if (task[name] + '' === value + '') return null;
        task[name] = value;
        this.setState({task, changedSth: true});
    };

    showDialog = (action) => {
        const {task} = this.state;
        const {translations} = this.props;
        let dialog;
        if (action === 'exit') {
            dialog = generateDialogObject(
                translations.defaultTitle,
                translations.exitDescription,
                {
                    [translations.yes]: () => {
                        this.setState({showDialog: false});
                        this.props.navigation.goBack();
                    },
                    [translations.save]: () => {
                        this.checkValid('name', true);
                        this.setState({showDialog: false});
                    },
                    [translations.cancel]: () => {
                        this.setState({showDialog: false});
                    }
                }
            );
        } else if (action === 'delete') {
            dialog = generateDialogObject(
                translations.defaultTitle,
                translations.deleteDescription,
                {
                    [translations.save]: () => {
                        this.setState({showDialog: false});
                        this.props.onRemoveTask(task);
                        this.props.navigation.goBack();
                    },
                    [translations.cancel]: () => {
                        this.setState({showDialog: false});
                    }
                }
            );
        }
        this.setState({showDialog: true, dialog});
    };

    toggleConfigCategory = (category) => {
        const {showConfigCategory, task} = this.state;
        if (category) task.category = category.name;
        this.setState({showConfigCategory: !showConfigCategory});
    };

    updateRepeat = (repeat) => {
        if (repeat === this.state.otherOption) {
            this.setState({showOtherRepeat: true});
        } else {
            this.updateTask('repeat', repeat);
        }
    };

    saveOtherRepeat = () => {
        const {selectedTime, repeatValue} = this.state;
        const {translations} = this.props;
        const repeat = selectedTime + repeatValue;
        const otherOption = `${translations.other} (${repeatValue} ${convertNumberToDate(+selectedTime)})`;
        this.updateTask('repeat', repeat);
        this.setState({otherOption, showOtherRepeat: false});
    };

    checkValid = (name, save = false, value = this.state.task.name) => {
        const {translations} = this.props;
        const controls = this.state.controls;
        valid(controls, value, name, translations, (newControls) => {
            this.updateTask(name, value);
            if (save && !newControls[name].error) {
                this.saveTask();
            }
            this.setState({controls: newControls});
        })
    };

    convertDate = (newDate) => {
        const {date} = this.state.task;

        if (date.length > 12) {
            newDate = newDate + date.slice(10, 18);
        }

        return newDate;
    };

    saveTask = () => {
        let {task, setEvent, setNotification} = this.state;
        const {navigation, theme} = this.props;

        if (task.date.length < 13) setNotification = false;

        configTask(task, theme.primaryColor, setEvent, setNotification)
            .then((task) => {
                this.props.onSaveTask(task);
                navigation.goBack();
            })
            .catch(() => {
                this.props.onSaveTask(task);
                navigation.goBack();
            });
    };

    render() {
        const {
            task, changedSth, controls, loading, editTask,
            showConfigCategory, repeat, dialog, showDialog,
            otherOption, selectedTime, showOtherRepeat, repeatValue,
            setEvent, setNotification
        } = this.state;
        const {navigation, categories, theme, settings, translations} = this.props;
        let date;
        let now;

        if (task.date.length > 12) {
            date = moment(task.date, 'DD-MM-YYYY - HH:mm');
            now = new Date();
        } else {
            date = moment(task.date, 'DD-MM-YYYY');
            now = new Date().setHours(0, 0, 0, 0);
        }

        return (
            <Template>
                <Toolbar
                    leftElement="arrow-back"
                    rightElement={
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            <Button
                                text={translations.save}
                                style={{text: {color: theme.headerTextColor}}}
                                onPress={() => this.checkValid('name', true)}
                            />
                            {editTask && <IconToggle name="delete"
                                                     color={theme.headerTextColor}
                                                     onPress={() => this.showDialog('delete')}/>
                            }
                        </View>
                    }
                    onLeftElementPress={() => {
                        if (changedSth) this.showDialog('exit');
                        else navigation.goBack();
                    }}
                    centerElement={
                        !loading ?
                            editTask ?
                                translations.editTask :
                                translations.newTask :
                            <View style={{marginTop: 10}}>
                                <Spinner color={theme.secondaryBackgroundColor} size='small'/>
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
                {showConfigCategory &&
                <ConfigCategory
                    showModal={showConfigCategory}
                    category={false}
                    toggleModal={this.toggleConfigCategory}
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
                                style={fullWidth}
                                date={task.date.slice(0, 10)}
                                mode="date"
                                iconComponent={
                                    task.date ?
                                        <IconToggle onPress={() => this.updateTask('date', '')} name='clear'/> :
                                        <IconToggle onPress={() => this.datepickerDate.onPressDate()} name='event'/>
                                }
                                placeholder={translations.selectDueDate}
                                format="DD-MM-YYYY"
                                confirmBtnText={translations.confirm}
                                cancelBtnText={translations.cancel}
                                customStyles={{
                                    dateInput: [styles.datePicker, {borderColor: theme.primaryColor}],
                                    dateText: {
                                        color: +date < +now ? theme.overdueColor : theme.textColor
                                    }
                                }}
                                onDateChange={(date) => this.updateTask('date', this.convertDate(date))}
                            />
                            {task.date !== '' &&
                            <React.Fragment>
                                <DatePicker
                                    ref={(e) => this.datepickerTime = e}
                                    style={fullWidth}
                                    date={task.date.slice(13, 18)}
                                    is24Hour={!!settings.timeFormat}
                                    mode="time"
                                    iconComponent={
                                        task.date.slice(13, 18) ?
                                            <IconToggle onPress={() => {
                                                this.updateTask('date', task.date.slice(0, 10))
                                            }}
                                                        name='clear'/> :
                                            <IconToggle onPress={() => this.datepickerTime.onPressDate()}
                                                        name='access-time'/>
                                    }
                                    placeholder={translations.selectDueTime}
                                    format="HH:mm"
                                    confirmBtnText={translations.confirm}
                                    cancelBtnText={translations.cancel}
                                    customStyles={{
                                        dateInput: [styles.datePicker, {borderColor: theme.primaryColor}],
                                        dateText: {
                                            color: +date < +now ? theme.overdueColor : theme.textColor
                                        }
                                    }}
                                    onDateChange={(date) => {
                                        this.updateTask('date', `${task.date.slice(0, 10)} - ${date}`);
                                    }}
                                />
                                <Checkbox
                                    style={{label: {color: theme.textColor}}}
                                    label={translations.setCalendarEvent}
                                    value='set'
                                    checked={setEvent}
                                    onCheck={(value) => this.setState({setEvent: value})}
                                />
                                {task.date.length > 12 &&
                                <Checkbox
                                    style={{label: {color: theme.textColor}}}
                                    label={translations.setNotification}
                                    value='set'
                                    checked={setNotification}
                                    onCheck={(value) => this.setState({setNotification: value})}
                                />
                                }
                                <Subheader text={translations.repeat}
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
                            <Subheader text={translations.category}
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
                                <IconToggle onPress={() => this.toggleConfigCategory()} name="playlist-add"/>
                            </View>
                            <Subheader text={translations.priority}
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
                                    <Picker.Item label={translations.priorityNone} value="none"/>
                                    <Picker.Item label={translations.priorityLow} value="low"/>
                                    <Picker.Item label={translations.priorityMedium} value="medium"/>
                                    <Picker.Item label={translations.priorityHigh} value="high"/>
                                </Picker>
                            </View>
                        </View>
                    </ScrollView> : <Spinner/>
                }
                <BannerAd/>
            </Template>
        );
    }
}

const
    styles = StyleSheet.create({
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
        settings: state.settings.settings,
        translations: {
            ...state.settings.translations.ConfigTask,
            ...state.settings.translations.validation,
            ...state.settings.translations.common
        }
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onInitTask: (id, callback) => dispatch(actions.initTask(id, callback)),
        onSaveTask: (task) => dispatch(actions.saveTask(task)),
        onRemoveTask: (task) => dispatch(actions.removeTask(task, false))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigTask);