import React, {Component} from "react";
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import DatePicker from 'react-native-datepicker';
import {Checkbox, IconToggle, Toolbar} from 'react-native-material-ui';
import Subheader from '../../../components/UI/Subheader/Subheader';
import Spinner from '../../../components/UI/Spinner/Spinner';
import Template from '../../Template/Template';
import Input from '../../../components/UI/Input/Input';
import ConfigCategory from '../../Categories/ConfigCategory/ConfigCategory';
import OtherRepeat from './OtherRepeat/OtherRepeat';
import {
    convertNumberToDate,
    convertPriorityNames,
    convertRepeatNames,
    generateDialogObject,
    checkValid
} from '../../../shared/utility';
import {configTask} from '../../../shared/configTask';
import {fullWidth} from '../../../shared/styles';
import {BannerAd} from "../../../../adsAPI";
import styles from './ConfigTask.styles';
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
            category: this.props.categories[0],
            priority: 'none',
            event_id: null,
            notification_id: null
        },
        controls: {
            name: {
                label: this.props.translations.nameLabel,
                required: true,
                characterRestriction: 40
            },
            description: {
                label: this.props.translations.descriptionLabel,
                multiline: true
            }
        },
        otherOption: null,
        taskCopy: null,
        dialog: null,
        selectedTime: 0,
        showOtherRepeat: false,
        editTask: null,
        showConfigCategory: false,
        setEvent: false,
        setNotification: false,
        loading: true
    };

    componentDidMount() {
        const task = this.props.navigation.getParam('task', false);
        const category = this.props.navigation.getParam('category', false);
        if (task !== false) this.initTask(task);
        else {
            const {task} = this.state;
            if (category && category.name !== this.props.translations.all) {
                task.category = category;
            }
            this.setState({
                copyTask: JSON.parse(JSON.stringify(task)),
                editTask: false, loading: false
            });
        }
    };

    initTask = (id) => {
        const {categories, translations} = this.props;
        this.props.onInitTask(id, (task) => {
            const findCate = categories.find((c => +c.id === +task.category));
            if (findCate) {
                task.category = findCate;
            } else {
                task.category = this.props.categories[0];
            }

            let selectedTime = 0;
            let repeatValue = '1';
            let otherOption = `${translations.other}...`;

            if (+task.repeat === parseInt(task.repeat, 10)) {
                selectedTime = task.repeat[0];
                repeatValue = task.repeat.substring(1);
                otherOption = `${translations.other} (${+repeatValue} ${convertNumberToDate(+selectedTime)})`;
            }

            this.setState({
                taskCopy: JSON.parse(JSON.stringify(task)),
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
        this.setState({task}, () => {
            if (name === 'date') this.checkCorrectRepeat();
        });
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
                        this.props.onUpdateModal(false);
                        this.props.navigation.goBack();
                    },
                    [translations.save]: () => {
                        this.saveTask();
                        this.props.onUpdateModal(false);
                    },
                    [translations.cancel]: () => {
                        this.props.onUpdateModal(false);
                    }
                }
            );
        } else if (action === 'delete') {
            dialog = generateDialogObject(
                translations.defaultTitle,
                translations.deleteDescription,
                {
                    [translations.yes]: () => {
                        const {onUpdateModal, onRemoveTask, navigation} = this.props;
                        onUpdateModal(false);
                        onRemoveTask(task, () => navigation.goBack());
                    },
                    [translations.cancel]: () => {
                        this.props.onUpdateModal(false);
                    }
                }
            );
        } else if (action === 'repeat') {
            const repeats = ['noRepeat', 'onceDay', 'onceDayMonFri', 'onceDaySatSun', 'onceWeek',
                'onceMonth', 'onceYear'];
            const options = [];
            repeats.map(p => {
                options.push({
                    name: convertRepeatNames(p, translations),
                    value: p,
                    onClick: (value) => {
                        this.props.onUpdateModal(false);
                        this.updateTask('repeat', value);
                    }
                })
            });
            dialog = generateDialogObject(
                translations.repeat,
                options,
                {
                    [translations.cancel]: () => this.props.onUpdateModal(false)
                }
            );
            dialog.select = true;
            dialog.selectedValue = task.repeat;
        } else if (action === 'category') {
            const {task} = this.state;
            const {categories} = this.props;
            const options = [];
            categories.map(c => {
                options.push({
                    name: c.name,
                    value: c,
                    onClick: (value) => {
                        task.category = value;
                        this.setState({task});
                        this.props.onUpdateModal(false);
                    }
                })
            });

            dialog = generateDialogObject(
                translations.category,
                options,
                {
                    [translations.cancel]: () => {
                        this.props.onUpdateModal(false);
                    }
                }
            );
            dialog.select = true;
            dialog.selectedValue = task.category;
        } else if (action === 'priority') {
            const {task} = this.state;
            const {translations} = this.props;
            const priorities = ['none', 'low', 'medium', 'high'];
            const options = [];
            priorities.map(p => {
                options.push({
                    name: convertPriorityNames(p, translations),
                    value: p,
                    onClick: (value) => {
                        this.updateTask('priority', value);
                        this.props.onUpdateModal(false);
                    }
                })
            });

            dialog = generateDialogObject(
                translations.priority,
                options,
                {
                    [translations.cancel]: () => {
                        this.props.onUpdateModal(false);
                    }
                }
            );
            dialog.select = true;
            dialog.selectedValue = task.priority;
        }

        this.props.onUpdateModal(true, dialog);
    };


    toggleConfigCategory = (category) => {
        const {showConfigCategory, task} = this.state;
        if (category) task.category = category;
        this.setState({task, showConfigCategory: !showConfigCategory});
    };

    toggleOtherRepeat = () => {
        this.setState({showOtherRepeat: true});
    };

    saveOtherRepeat = () => {
        const {selectedTime, repeatValue} = this.state;
        const {translations} = this.props;
        const repeat = selectedTime + repeatValue;
        const otherOption = `${translations.other} (${repeatValue} ${convertNumberToDate(+selectedTime)})`;
        this.updateTask('repeat', repeat);
        this.setState({otherOption, showOtherRepeat: false});
    };

    convertDate = (newDate) => {
        const {date} = this.state.task;

        if (date.length > 12) {
            newDate = newDate + date.slice(10, 18);
        }

        return newDate;
    };

    checkChanges = () => {
        const {task, taskCopy, setEvent, setNotification, controls} = this.state;

        return checkValid(controls.name, task.name) &&
            (JSON.stringify(task) !== JSON.stringify(taskCopy) ||
                setEvent !== (task.event_id !== null) ||
                setNotification !== (task.notification_id !== null));
    };

    checkCorrectRepeat = () => {
        const {task} = this.state;
        if ((task.repeat[0] === '0' || task.repeat[0] === '1') &&
            task.date.length < 13) {
            task.repeat = 'noRepeat';
            this.setState({task})
        }
    };

    saveTask = () => {
        let {task, setEvent, setNotification} = this.state;
        const {navigation, theme} = this.props;

        if (task.date.length < 13) setNotification = false;
        configTask(task, theme.primaryColor, setEvent, setNotification)
            .then((task) => {
                this.props.onSaveTask(task, navigation.goBack);
            })
            .catch(() => {
                this.props.onSaveTask(task, navigation.goBack);
            });
    };

    render() {
        const {
            task, controls, loading, editTask, showConfigCategory,
            selectedTime, showOtherRepeat, repeatValue, otherOption,
            setEvent, setNotification
        } = this.state;
        const {navigation, theme, settings, translations} = this.props;
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
            <Template bgColor={theme.secondaryBackgroundColor}>
                <Toolbar
                    leftElement="arrow-back"
                    centerElement={
                        !loading ?
                            editTask ?
                                translations.editTask :
                                translations.newTask :
                            <View style={{marginTop: 10}}>
                                <Spinner color={theme.primaryBackgroundColor} size='small'/>
                            </View>
                    }
                    rightElement={
                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                            {this.checkChanges() &&
                            <IconToggle name="save"
                                        color={theme.primaryTextColor}
                                        onPress={this.saveTask}/>
                            }
                            {editTask && <IconToggle name="delete"
                                                     color={theme.primaryTextColor}
                                                     onPress={() => this.showDialog('delete')}/>
                            }
                        </View>
                    }
                    onLeftElementPress={() => {
                        if (this.checkChanges()) this.showDialog('exit');
                        else navigation.goBack();
                    }}
                />

                <OtherRepeat
                    showModal={showOtherRepeat}
                    repeat={repeatValue}
                    selectedTime={selectedTime}
                    usingTime={task.date.length > 13}
                    onSetRepeat={value => this.setState({repeatValue: value})}
                    onSelectTime={value => this.setState({selectedTime: value})}
                    save={this.saveOtherRepeat}
                    cancel={() => this.setState({showOtherRepeat: false})}
                />

                <ConfigCategory
                    showModal={showConfigCategory}
                    category={false}
                    toggleModal={this.toggleConfigCategory}
                />

                {!loading ?
                    <ScrollView>
                        <Input
                            elementConfig={controls.name}
                            focus={!editTask}
                            value={task.name}
                            changed={(value, control) => {
                                const {task, controls} = this.state;
                                task.name = value;
                                controls.name = control;
                                this.setState({task, controls});
                            }}/>
                        <Input
                            elementConfig={controls.description}
                            value={task.description}
                            changed={value => this.updateTask('description', value)}/>
                        <View style={styles.container}>
                            <Subheader text="Due date"/>
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
                                    datePickerCon: {backgroundColor: '#3b3b3b'},
                                    dateText: {
                                        color: +date < +now ? theme.warningColor : theme.thirdTextColor
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
                                        datePickerCon: {backgroundColor: '#3b3b3b'},
                                        dateText: {
                                            color: +date < +now ? theme.warningColor : theme.thirdTextColor
                                        }
                                    }}
                                    onDateChange={(date) => {
                                        this.updateTask('date', `${task.date.slice(0, 10)} - ${date}`);
                                    }}
                                />
                                <Checkbox
                                    style={{label: {color: theme.thirdTextColor}}}
                                    label={translations.setCalendarEvent}
                                    value='set'
                                    checked={setEvent}
                                    onCheck={(value) => this.setState({setEvent: value})}
                                />
                                {task.date.length > 12 &&
                                <Checkbox
                                    style={{label: {color: theme.thirdTextColor}}}
                                    label={translations.setNotification}
                                    value='set'
                                    checked={setNotification}
                                    onCheck={(value) => this.setState({setNotification: value})}
                                />
                                }
                                <Subheader text={translations.repeat}/>
                                <View style={styles.select}>
                                    <TouchableOpacity style={{flex: 1}} onPress={() => this.showDialog('repeat')}>
                                        <Text style={
                                            {...styles.selectedOption, color: theme.secondaryTextColor}
                                        }>
                                            {+task.repeat ?
                                                otherOption :
                                                convertRepeatNames(task.repeat, translations)
                                            }
                                        </Text>
                                    </TouchableOpacity>
                                    <IconToggle onPress={() => this.toggleOtherRepeat()} name="playlist-add"/>
                                </View>
                            </React.Fragment>
                            }
                            <Subheader text={translations.category}/>
                            <View style={styles.select}>
                                <TouchableOpacity style={{flex: 1}} onPress={() => this.showDialog('category')}>
                                    <Text style={
                                        {...styles.selectedOption, color: theme.secondaryTextColor}
                                    }>
                                        {task.category.name}
                                    </Text>
                                </TouchableOpacity>
                                <IconToggle onPress={() => this.toggleConfigCategory()} name="playlist-add"/>
                            </View>
                            <Subheader text={translations.priority}/>
                            <View style={styles.select}>
                                <TouchableOpacity style={{flex: 1}} onPress={() => this.showDialog('priority')}>
                                    <Text style={
                                        {...styles.selectedOption, color: theme.secondaryTextColor}
                                    }>
                                        {convertPriorityNames(task.priority, translations)}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView> : <Spinner/>
                }
                <BannerAd/>
            </Template>
        );
    }
}

const mapStateToProps = state => {
    return {
        categories: state.categories.categories,
        theme: state.theme.theme,
        settings: state.settings.settings,
        translations: {
            ...state.settings.translations.ConfigTask,
            ...state.settings.translations.OtherRepeat,
            ...state.settings.translations.validation,
            ...state.settings.translations.common
        }
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onInitTask: (id, callback) => dispatch(actions.initTask(id, callback)),
        onSaveTask: (task, callback) => dispatch(actions.saveTask(task, callback)),
        onRemoveTask: (task, callback) => dispatch(actions.removeTask(task, false, callback)),
        onUpdateModal: (showModal, modal) => dispatch(actions.updateModal(showModal, modal))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfigTask);