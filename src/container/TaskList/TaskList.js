import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import { ListItem, Subheader, IconToggle, Button } from 'react-native-material-ui';
import {generateDialogObject, sortingByType} from '../../shared/utility';
import Dialog from '../../components/UI/Dialog/Dialog';
import AnimatedView from '../AnimatedView/AnimatedView';
import {empty} from '../../shared/styles';
import moment from 'moment';

import { connect } from 'react-redux';
import * as actions from "../../store/actions";

class TaskList extends Component {
    state = {
        priorityColors: {
            none: { bgColor: this.props.theme.noneColor, color: this.props.theme.noneTextColor },
            low: { bgColor: this.props.theme.lowColor, color: this.props.theme.lowTextColor },
            medium: { bgColor: this.props.theme.mediumColor, color: this.props.theme.mediumTextColor },
            high: { bgColor: this.props.theme.highColor, color: this.props.theme.highTextColor },
        },
        dialog: {},
        showDialog: false,
        selectedTask: false,
        initDivision: false
    };

    componentDidMount() {
        this.divisionTask();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps !== this.props || prevProps.refresh !== this.props.refresh) {
            this.divisionTask();
        }
    }

    showDialog = (action) => {
        let dialog;
        if (action === 'repeat') {
            dialog = generateDialogObject(
                'Repeat task?',
                'Do you want to repeat this task?',
                {
                    Yes: () => {
                        this.setState({showDialog: false, selectedTask: false});
                        this.checkTaskRepeatHandler(this.state.selectedTask);
                        this.props.onAddEndedTask();
                    },
                    No: () => {
                        this.setState({showDialog: false, selectedTask: false});
                        this.props.onAddEndedTask();
                        this.props.onFinishTask(this.state.selectedTask, true);
                    },
                    Cancel: () => this.setState({showDialog: false, selectedTask: false})
                }
            );
        }
        else if (action === 'finish') {
            dialog = generateDialogObject(
                'Are you sure?',
                'Finish this task?',
                {
                    Yes: () => {
                        this.setState({ showDialog: false });
                        this.props.onFinishTask(this.state.selectedTask);
                        this.props.onAddEndedTask();
                        this.props.navigation.goBack();
                    },
                    No: () => {
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
                        this.props.onRemoveTask(this.state.selectedTask);
                        this.props.navigation.goBack();
                    },
                    No: () => {
                        this.setState({ showDialog: false });
                    }
                }
            );
        }
        this.setState({showDialog: true, dialog});
    };

    divisionTask = () => {
        const {tasks, sorting, sortingType} = this.props;
        const division = {
            Overdue: [],
            Today: [],
            Tomorrow: [],
            'This week': [],
            'Next week': [],
            'This month': [],
            'Next month': [],
            Later: [],
            Other: [],
            Finished: []
        };

        tasks && tasks.map(task => {
            let div;
            if (task.finish) {
                div = "Finished";
                division[div].push(task);
            } else {
                div = this.getDateDivision(task.date);
                division[div].push(task);
            }
            sortingByType(division[div], sorting, sortingType);
        });

        this.setState({division, initDivision: true});
    };

    getDateDivision = (date) => {
        let text;
        let now;
        if (!date) {
            text = 'Other';
            return text;
        } else {
            if (date.length > 12) {
                date = moment(date, 'DD-MM-YYYY - HH:mm');
                now = new Date();
            } else {
                date = moment(date, 'DD-MM-YYYY');
                now = new Date().setHours(0,0,0,0);
            }
        }

        let week = 'week';
        if (this.props.settings.firstDayOfWeek === 'Monday') week = 'isoWeek';

        if (+date < +now) text = 'Overdue';
        else if (+date <= moment(now).endOf("day")) text = 'Today';
        else if (+date <= +moment(now).add(1, 'days').endOf("day")) text = 'Tomorrow';
        else if (date <= moment(now).endOf(week)) text = 'This week';
        else if (+date <= +moment(now).add(1, 'week').endOf(week)) text = 'Next week';
        else if (date <= moment(now).endOf("month")) text = 'This month';
        else if (date <= moment(now).add(1, 'month').endOf("month")) text = 'Next month';
        else text = 'Later';

        return text;
    };

    checkTaskRepeatHandler = (task) => {
        this.setState({ selectedTask: task });
        if (task.repeat !== 'noRepeat' &&
            !this.state.selectedTask &&
            !!this.props.settings.confirmRepeatingTask) {
            this.showDialog('repeat');
        } else {
            if (!!this.props.settings.confirmFinishingTask) {
                this.showDialog('finish');
            } else {
                this.props.onFinishTask(task);
                this.setState({ selectedTask: false });
            }
        }
    };

    checkDeleteHandler = (task) => {
        if (!!this.props.settings.confirmDeletingTask) {
            this.setState({ selectedTask: task });
            this.showDialog('delete');
        } else this.props.onRemoveTask(task);
    };

    render() {
        const {division, priorityColors, initDivision, dialog, showDialog} = this.state;
        const {tasks, theme, navigation} = this.props;

        const taskList = initDivision &&
            Object.keys(division).map(div => (
            division[div].map((task, index) => {
                // Searching system
                const searchText = this.props.searchText.toLowerCase();
                if (searchText.length > 0 && task.name.toLowerCase().indexOf(searchText) < 0) {
                    if (task.description.toLowerCase().indexOf(searchText) < 0) {
                        if (task.category.toLowerCase().indexOf(searchText) < 0) {
                            return null;
                        }
                    }
                }

                return (
                    <View key={div + index}>
                        <AnimatedView value={1} duration={500}>
                            {!index &&
                            <Subheader
                                text={div}
                                style={{
                                    text: div === 'Overdue' ? {color: theme.overdueColor} : {color: theme.textColor}
                                }}
                            />
                            }
                            <View style={{marginLeft: 10, marginRight: 10, marginBottom: 10}}>
                            <ListItem
                                divider
                                dense
                                onPress={() => task.finish ? true : navigation.navigate('ConfigTask', {task: task.id})}
                                style={{
                                    container: {
                                        shadowColor: "#000",
                                        shadowOffset: {
                                            width: 0,
                                            height: 3,
                                        },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 5,
                                        elevation: 3,
                                        backgroundColor: task.finish ? priorityColors.none.bgColor : priorityColors[task.priority].bgColor
                                    },
                                    primaryText: {fontSize: 18, color: task.finish ? theme.textColor : priorityColors[task.priority].color},
                                    secondaryText: {color: task.finished ? theme.textColor : div === 'Overdue' ? theme.overdueColor : priorityColors[task.priority].color},
                                    tertiaryText: {color: task.finish ? theme.textColor : priorityColors[task.priority].color}
                                }}
                                rightElement={
                                    <View style={styles.rightElements}>
                                        <Button
                                            raised
                                            style={{
                                                container: {
                                                    backgroundColor: task.finish ? theme.undoButtonColor : theme.doneButtonColor,
                                                    marginRight: task.finish ? 0 : 15
                                                },
                                                text: { color: task.finish ? theme.undoButtonTextColor : theme.doneButtonTextColor }
                                            }}
                                            text={task.finish ? 'Undo' : 'Done'}
                                            icon={task.finish ? 'replay' : 'done'}
                                            onPress={() => {
                                                task.finish ? this.props.onUndoTask(task) : this.checkTaskRepeatHandler(task)
                                            }}
                                        />
                                        {task.finish &&
                                        <IconToggle
                                            onPress={() => this.checkDeleteHandler(task)}
                                            name="delete"
                                            color={theme.overdueColor}
                                            size={26}
                                        />}
                                    </View>
                                }
                                centerElement = {{
                                    primaryText: task.name,
                                    secondaryText: task.date ?
                                        task.date : task.description ?
                                            task.description : ' ',
                                    tertiaryText: task.category ? task.category : ' '
                                }}
                            />
                            </View>
                        </AnimatedView>
                    </View>
                )
            })
        ));

        return (
            <View>
                {showDialog &&
                <Dialog
                    showModal={showDialog}
                    title={dialog.title}
                    description={dialog.description}
                    buttons={dialog.buttons}
                />
                }
                {tasks && tasks.length ?
                    <View style={{ paddingBottom: 20 }}>{taskList}</View>
                    : <Text style={[empty, {color: theme.textColor}]}>Task list is empty!</Text>
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    rightElements: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
});

const mapStateToProps = state => {
    return {
        finished: state.tasks.finished,
        refresh: state.tasks.refresh,
        theme: state.theme.theme,
        profile: state.profile,
        settings: state.settings
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        onFinishTask: (task, endTask = false) => dispatch(actions.finishTask(task, endTask)),
        onRemoveTask: (task) => dispatch(actions.removeTask(task)),
        onUndoTask: (task) => dispatch(actions.undoTask(task)),
        onAddEndedTask: () => dispatch(actions.addEndedTask())
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(TaskList);