import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import { ListItem, Subheader } from 'react-native-material-ui';
import moment from 'moment';

class TaskList extends Component {
    state = {
        priorityColors: {
            none: '#ddd',
            low: '#26b596',
            medium: '#cec825',
            high: '#ce3241'
        },
        division: {
            overdue: [],
            today: [],
            tomorrow: [],
            week: [],
            month: [],
            later: []
        }
    };

    componentDidMount() {
        const {division} = this.state;
        this.props.tasks.map(task => {
            division[this.dateDivision(task.date)].push(task);
        });
        alert(division.today[0]);
        this.setState({division});
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps !== this.props) {
            const {division} = this.state;
            this.props.tasks.map(task => {
                division[this.dateDivision(task.date)].push(task);
            });
            alert(division.today[0]);
            this.setState({division});
        }
    }

    dateDivision = (date) => {
        date = moment(date, 'DD-MM-YYYY');
        const now = new Date().setHours(0,0,0,0);
        let text;

        if (+date === +now) text = 'today';
        else if (+date < +now) text = 'overdue';
        else if (+date === +moment(now).add(1, 'days')) text = 'tomorrow';
        else if (date <= moment(now).endOf("week")) text = 'week';
        else if (date <= moment(now).endOf("month")) text = 'month';
        else text = 'later';

        return text;
    };

    render() {
        const {division, priorityColors} = this.state;

        return (
            <View>
                {this.props.tasks.length ?
                    <View>
                        {Object.keys(division).map(div => (
                            <Subheader text={div}/> +
                            division[div].map(task => (
                                <ListItem
                                    divider
                                    dense
                                    onPress={() => this.props.toggleModal(task)}
                                    style={{
                                        container: {backgroundColor: priorityColors[task.priority]}
                                    }}
                                    centerElement={{
                                        primaryText: `${task.name}`,
                                        secondaryText: task.description ? task.description : null
                                    }}
                                />
                            ))
                        )).join(' ')
                        }
                    </View>
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
        width: "100%",
        textAlign: "center",
    }
});

export default TaskList;