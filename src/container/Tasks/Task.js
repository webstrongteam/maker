import React, {Component} from 'react';
import {Animated, Easing, Platform, View} from "react-native";
import {IconToggle, ListItem, Subheader} from "react-native-material-ui";
import {shadow} from "../../shared/styles";
import styles from "./TaskList.styles";
import {generateDialogObject} from "../../shared/utility";

import {connect} from "react-redux";
import * as actions from "../../store/actions";

class Task extends Component {
    state = {
        hideTask: false,
        moveAnim: new Animated.Value(0)
    };

    checkTaskRepeatHandler = (task) => {
        if (task.repeat !== 'noRepeat' &&
            !!this.props.settings.confirmRepeatingTask) {
            this.showDialog('repeat');
        } else {
            if (!!this.props.settings.confirmFinishingTask) {
                this.showDialog('finish');
            } else {
                this.moveAnimate(() => {
                    this.props.onFinishTask(task, false, this.props.theme.primaryColor);
                })
            }
        }
    };

    checkDeleteHandler = () => {
        if (!!this.props.settings.confirmDeletingTask) {
            this.showDialog('delete');
        } else {
            this.moveAnimate(() => {
                this.props.onRemoveTask(this.props.task);
            })
        }
    };

    undoTask = (task) => {
        this.moveAnimate(() => {
            this.props.onUndoTask(task)
        })
    };

    showDialog = (action) => {
        const {translations} = this.props;
        let dialog;
        if (action === 'repeat') {
            dialog = generateDialogObject(
                translations.repeatTitle,
                translations.repeatDescription,
                {
                    [translations.yes]: () => {
                        this.props.onUpdateModal(false);
                        this.moveAnimate(() => {
                            this.props.onFinishTask(this.props.task, false, this.props.theme.primaryColor, () => {
                                this.props.onAddEndedTask();
                            })
                        });
                    },
                    [translations.no]: () => {
                        this.props.onUpdateModal(false);
                        this.moveAnimate(() => {
                            this.props.onFinishTask(this.props.task, true, this.props.theme.primaryColor, () => {
                                this.props.onAddEndedTask();
                            })
                        });
                    },
                    [translations.cancel]: () => {
                        this.props.onUpdateModal(false);
                    }
                }
            );
        } else if (action === 'finish') {
            dialog = generateDialogObject(
                translations.defaultTitle,
                translations.finishDescription,
                {
                    [translations.yes]: () => {
                        this.props.onUpdateModal(false);
                        this.moveAnimate(() => {
                            this.props.onFinishTask(this.props.task, true, this.props.theme.primaryColor, () => {
                                this.props.onAddEndedTask();
                            });
                        });
                    },
                    [translations.no]: () => this.props.onUpdateModal(false)
                }
            );
        } else if (action === 'delete') {
            dialog = generateDialogObject(
                translations.defaultTitle,
                translations.deleteDescription,
                {
                    [translations.yes]: () => {
                        this.props.onUpdateModal(false);
                        this.moveAnimate(() => {
                            this.props.onRemoveTask(this.props.task);
                        });
                    },
                    [translations.no]: () => this.props.onUpdateModal(false)
                }
            );
        }

        this.props.onUpdateModal(true, dialog);
    };

    moveAnimate = (callback) => {
        Animated.timing(
            this.state.moveAnim,
            {
                toValue: -400,
                duration: 500,
                easing: Easing.bezier(0.0, 0.0, 0.2, 1),
                useNativeDriver: Platform.OS === 'android'
            }
        ).start(() => {
            this.setState({hideTask: true}, callback);
        });
    };

    render() {
        const {hideTask} = this.state;
        const {task, priorityColors, div, navigation, translations, theme} = this.props;

        console.log(task)
        return (
            <Animated.View style={{
                height: hideTask ? 0 : 'auto',
                transform: [{translateX: this.state.moveAnim}]
            }}>
                <View style={{marginLeft: 15, marginRight: 15, marginBottom: 15}}>
                    <ListItem
                        divider
                        dense
                        onPress={() => task.finish ? true : navigation.navigate('ConfigTask', {task: task.id})}
                        style={{
                            container: [
                                shadow,
                                {backgroundColor: "#fff"}
                            ],
                            leftElementContainer: {
                                marginRight: -50
                            },
                            primaryText: {
                                fontSize: 18,
                                color: "#000"
                            },
                            secondaryText: {
                                fontWeight: '500',
                                color: task.finished ?
                                    theme.textColor :
                                    div === translations.overdue ?
                                        theme.overdueColor :
                                        theme.textColor
                            },
                            tertiaryText: {
                                color: theme.textColor
                            }
                        }}
                        leftElement={
                            <View style={{
                                marginLeft: -20,
                                width: 15,
                                height: '100%',
                                backgroundColor: priorityColors[task.priority].bgColor
                            }}/>
                        }
                        centerElement={{
                            primaryText: task.name,
                            secondaryText: task.date ?
                                task.date : task.description ?
                                    task.description : ' ',
                            tertiaryText: task.category ? task.category : ' '
                        }}
                        rightElement={
                            <View style={styles.rightElements}>
                                <IconToggle
                                    color={task.finish ?
                                        theme.undoButtonColor :
                                        theme.doneButtonColor
                                    }
                                    style={{
                                        container: {
                                            marginRight: task.finish ? -10 : 5
                                        }
                                    }}
                                    size={32}
                                    name={task.finish ? 'replay' : 'done'}
                                    onPress={() => {
                                        task.finish ?
                                            this.undoTask(task) :
                                            this.checkTaskRepeatHandler(task)
                                    }}
                                />
                                {task.finish &&
                                <IconToggle
                                    onPress={this.checkDeleteHandler}
                                    name="delete"
                                    color={theme.actionButtonColor}
                                    size={28}
                                />}
                            </View>
                        }
                    />
                </View>
            </Animated.View>
        )
    }
}

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        settings: state.settings.settings,
        translations: {
            ...state.settings.translations.TaskList,
            ...state.settings.translations.common
        }
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        onFinishTask: (task, endTask, primaryColor, callback) => dispatch(actions.finishTask(task, endTask, primaryColor, callback)),
        onRemoveTask: (task) => dispatch(actions.removeTask(task)),
        onUndoTask: (task) => dispatch(actions.undoTask(task)),
        onAddEndedTask: () => dispatch(actions.addEndedTask()),
        onUpdateModal: (showModal, modal) => dispatch(actions.updateModal(showModal, modal))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(Task);