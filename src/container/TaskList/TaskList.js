import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import { ListItem, Subheader, Divider } from 'react-native-material-ui';
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
        initDivision: false,
        swiping: false
    };

    componentDidMount() {
        this.divisionTask();
        this.setState({initDivision: true});
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps !== this.props || prevProps.refresh !== this.props.refresh) {
            this.divisionTask();
        }
    }

    divisionTask = () => {
        const division = [];
        this.props.tasks.map(task => {
            if (!division[this.dateDivision(task.date)]) division[this.dateDivision(task.date)] = [];
            division[this.dateDivision(task.date)].push(task);
        });
        this.setState({division});
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

    render() {
        const {division, priorityColors, initDivision} = this.state;
        const {tasks, navigation} = this.props;

        const taskList = initDivision && Object.keys(division).map(div => (
            division[div].map((task, index) => {
                return (
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
                            onPress={() => navigation.navigate('ConfigTask', {task})}
                            style={{
                                container: {backgroundColor: priorityColors[task.priority]},
                                secondaryText: div === 'Overdue' ? {color: '#ce3241'} : {color: 'black'}
                            }}
                            rightElement={
                                <Button
                                    style={{
                                        container: {backgroundColor: '#26b596', marginRight: 15},
                                    }}
                                    raised primary text="Done" icon="done"
                                    onPress={() => this.props.onRemoveTask(task)} />
                            }
                            centerElement={{
                                primaryText: `${task.name}`,
                                secondaryText: task.date,
                                tertiaryText: task.category
                            }}
                        />
                    </View>
                )
            })
        ));

        return (
            <View>
                {tasks.length ?
                    <View>{taskList}</View>
                    : <Text style={styles.empty}>Task list is empty</Text>
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
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
        refresh: state.todo.refresh,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onRemoveTask: (task) => dispatch(actions.removeTask(task)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(TaskList);