import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import { ListItem, Subheader, IconToggle } from 'react-native-material-ui';
import {sortingByDiv, sortingByType} from '../../shared/utility';
import Dialog from "react-native-dialog";
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
        selectedTask: false,
        showModal: false,
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
        date = moment(date, 'DD-MM-YYYY');
        const now = new Date().setHours(0,0,0,0);
        let text;

        if (+date === +now) text = 'Today';
        else if (+date < +now) text = 'Overdue';
        else if (+date === +moment(now).add(1, 'days')) text = 'Tomorrow';
        else if (date <= moment(now).endOf("week")) text = 'This week';
        else if (+date <= +moment(now).add(1, 'week')) text = 'Next week';
        else if (date <= moment(now).endOf("month")) text = 'This month';
        else text = 'Later';

        return text;
    };

    checkTaskRepeatHandler = (task) => {
        if (task.repeat !== 'noRepeat' && !this.state.selectedTask) {
            this.setState({ showModal: true, selectedTask: task });
        } else {
            this.props.onFinishTask(task);
            this.setState({ showModal: false, selectedTask: false });
        }
    };

    finishTaskHandler = (task) => {
        task.repeat = 'noRepeat';
        this.props.onFinishTask(task);
        this.setState({ showModal: false, selectedTask: false });
    };

    render() {
        const {division, priorityColors, initDivision, showModal, selectedTask} = this.state;
        const {tasks, navigation} = this.props;

        const taskList = initDivision &&
            Object.keys(division).sort((a, b) => (
                '' + sortingByDiv(a)).localeCompare(sortingByDiv(b))
            ).map(div => (
            division[div].map((task, index) => (
                <View key={div + index}>
                    {!index &&
                        <Subheader
                            text={div}
                            style={{
                                container: {backgroundColor: '#d8ddd8'},
                                text: div === 'Overdue' ? {color: '#ce3241'} : {color: 'black'} }}
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
                                    onPress={() => {task.finish ? this.props.onUndoTask(task) : this.checkTaskRepeatHandler(task)}}
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
                        centerElement={{
                            primaryText: `${task.name}`,
                            secondaryText: task.date,
                            tertiaryText: task.category
                        }}
                    />
                    <Dialog.Container visible={showModal}>
                        <Dialog.Title>Repeat task?</Dialog.Title>
                        <Dialog.Description>
                            Do you want to repeat this task?
                        </Dialog.Description>
                        <Dialog.Button
                            label="Yes"
                            onPress={() => this.checkTaskRepeatHandler(selectedTask)}
                        />
                        <Dialog.Button
                            label="No"
                            onPress={() => this.finishTaskHandler(selectedTask)}
                        />
                    </Dialog.Container>
                </View>
            ))
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
        onFinishTask: (task) => dispatch(actions.finishTask(task)),
        onRemoveTask: (task) => dispatch(actions.removeTask(task)),
        onUndoTask: (task) => dispatch(actions.undoTask(task)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(TaskList);