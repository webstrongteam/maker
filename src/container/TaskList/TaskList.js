import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import { ListItem, Subheader, IconToggle } from 'react-native-material-ui';
import {sortingByDiv, sortingByType} from '../../shared/utility';
import Dialog from '../../components/UI/Dialog/Dialog';
import moment from 'moment';

import { connect } from 'react-redux';
import * as actions from "../../store/actions";
import Button from "react-native-material-ui/src/Button";

class TaskList extends Component {
    state = {
        priorityColors: {
            none: 'white',
            low: '#26b596',
            medium: '#cec825',
            high: '#ce3241'
        },
        dialog: {
            title: 'Repeat task?',
            description: 'Do you want to repeat this task?',
            buttons: {
                yes: {
                    label: 'Yes',
                    onPress: () => this.checkTaskRepeatHandler(this.state.selectedTask)
                },
                no: {
                    label: 'No',
                    onPress: () => this.props.onFinishTask(this.state.selectedTask, true)
                },
                cancel: {
                    label: 'Cancel',
                    onPress: () => this.setState({showDialog: false})
                }
            }
        },
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

    divisionTask = () => {
        let division = {};
        const {tasks, sorting, sortingType} = this.props;

        tasks && tasks.map(task => {
            let div;
            if (task.finish) {
                div = "Finished";
                if (!division[div]) division[div] = [];
                division[div].push(task);
            } else {
                div = this.dateDivision(task.date);
                if (!division[div]) division[div] = [];
                division[div].push(task);
            }
            sortingByType(division[div], sorting, sortingType);
        });

        this.setState({division, initDivision: true});
    };

    dateDivision = (date) => {
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

        if (+date < +now) text = 'Overdue';
        else if (+date <= moment(now).endOf("day")) text = 'Today';
        else if (+date <= +moment(now).add(1, 'days').endOf("day")) text = 'Tomorrow';
        else if (date <= moment(now).endOf("week")) text = 'This week';
        else if (+date <= +moment(now).add(1, 'week')) text = 'Next week';
        else if (date <= moment(now).endOf("month")) text = 'This month';
        else text = 'Later';

        return text;
    };

    checkTaskRepeatHandler = (task) => {
        if (task.repeat !== 'noRepeat' && !this.state.selectedTask) {
            this.setState({ showDialog: true, selectedTask: task });
        } else {
            this.props.onFinishTask(task);
            this.setState({ showDialog: false, selectedTask: false });
        }
    };

    render() {
        const {division, priorityColors, initDivision, dialog, showDialog} = this.state;
        const {tasks, navigation} = this.props;

        const taskList = initDivision &&
            Object.keys(division).sort((a, b) => (
                '' + sortingByDiv(a)).localeCompare(sortingByDiv(b))
            ).map(div => (
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

                return <View key={div + index}>
                    {!index &&
                    <Subheader
                        text={div}
                        style={{
                            container: {backgroundColor: '#d8ddd8'},
                            text: div === 'Overdue' ? {color: '#ce3241'} : {color: 'black'}
                        }}
                    />
                    }
                    <ListItem
                        divider
                        dense
                        onPress={() => task.finish ? true : navigation.navigate('ConfigTask', {task})}
                        style={{
                            container: {backgroundColor: !task.finish ? priorityColors[task.priority] : 'white'},
                            secondaryText: div === 'Overdue' ? {color: !task.finish ? '#ce3241' : 'black'} : {color: 'black'}
                        }}
                        rightElement={
                            <View style={styles.rightElements}>
                                <Button
                                    raised primary
                                    style={{
                                        container: {
                                            backgroundColor: task.finish ? '#5bc0de' : '#26b596',
                                            marginRight: task.finish ? 0 : 15
                                        }
                                    }}
                                    text={task.finish ? 'Undo' : 'Done'}
                                    icon={task.finish ? 'replay' : 'done'}
                                    onPress={() => {
                                        task.finish ? this.props.onUndoTask(task) : this.checkTaskRepeatHandler(task)
                                    }}
                                />
                                {task.finish &&
                                <IconToggle
                                    onPress={() => this.props.onRemoveTask(task)}
                                    name="delete"
                                    color="#ce3241"
                                    size={26}
                                />}
                            </View>
                        }
                        centerElement = {{
                            primaryText: task.name,
                            secondaryText: task.date ?
                                task.date : task.description ?
                                    task.description : ' ',
                            tertiaryText: task.category
                        }}
                    />
                    <Dialog
                        showModal={showDialog}
                        title={dialog.title}
                        description={dialog.description}
                        buttons={dialog.buttons}
                    />
                </View>
            })
        ));

        return (
            <View>
                {tasks && tasks.length ?
                    <View>{taskList}</View>
                    : <Text style={styles.empty}>Task list is empty</Text>
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
    },
    taskList: {
        backgroundColor: "#eee",
    },
    empty: {
        marginTop: 30,
        width: "100%",
        textAlign: "center",
    }
});

const mapStateToProps = state => {
    return {
        finished: state.tasks.finished,
        refresh: state.tasks.refresh
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onFinishTask: (task, endTask = false) => dispatch(actions.finishTask(task, endTask)),
        onRemoveTask: (task) => dispatch(actions.removeTask(task)),
        onUndoTask: (task) => dispatch(actions.undoTask(task)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(TaskList);