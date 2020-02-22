import React, {Component} from 'react';
import {
    Animated,
    Easing,
    Platform,
    ScrollView,
    Text,
    TouchableHighlight,
    View
} from 'react-native';
import {ActionButton, BottomNavigation, Icon, IconToggle, ListItem, Subheader, Toolbar} from 'react-native-material-ui';
import {generateDialogObject, sortingByType} from '../../shared/utility';
import {empty, flex, fullWidth, shadow} from '../../shared/styles';
import ModalDropdown from 'react-native-modal-dropdown';
import ConfigCategory from "../Categories/ConfigCategory/ConfigCategory";
import Spinner from '../../components/UI/Spinner/Spinner';
import styles from './TaskList.styles';
import moment from 'moment';

import {connect} from 'react-redux';
import * as actions from "../../store/actions";

const UP = 1;
const DOWN = -1;

class TaskList extends Component {
    state = {
        priorityColors: {
            none: {bgColor: this.props.theme.secondaryBackgroundColor},
            low: {bgColor: this.props.theme.lowColor},
            medium: {bgColor: this.props.theme.mediumColor},
            high: {bgColor: this.props.theme.highColor},
        },
        selectedTask: null,
        showConfigCategory: false,
        initDivision: false,
        division: {},

        scroll: 0,
        offset: 0,
        scrollDirection: 0,
        bottomHidden: false,

        tasks: [],
        dropdownData: null,
        selectedCategory: {id: -1, name: this.props.translations.all},
        selectedIndex: 0,
        searchText: '',
        rotateAnimated: new Animated.Value(0),
        rotateInterpolate: '0deg',
        animations: {},
        loading: true
    };

    componentDidMount() {
        this.selectedCategoryHandler();
        this.renderDropdownData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.theme !== this.props.theme) {
            this.refreshPriorityColors();
        }
        if (prevProps.tasks !== this.props.tasks ||
            prevProps.finished !== this.props.finished) {
            this.selectedCategoryHandler();
        }
        if (prevProps.sorting !== this.props.sorting ||
            prevProps.sortingType !== this.props.sortingType) {
            this.divisionTask();
        }
    }

    onScroll = (e) => {
        const currentOffset = e.nativeEvent.contentOffset.y;
        const sub = this.state.offset - currentOffset;

        if (sub > -10 && sub < 10) return;
        this.state.offset = e.nativeEvent.contentOffset.y;

        const currentDirection = sub > 0 ? UP : DOWN;

        if (this.state.scrollDirection !== currentDirection) {
            this.state.scrollDirection = currentDirection;

            this.setState({
                bottomHidden: currentDirection === DOWN
            });
        }
    };

    rotate = (value) => {
        const {rotateAnimated} = this.state;
        Animated.timing(rotateAnimated, {
            toValue: value,
            duration: 250,
            easing: Easing.bezier(0.0, 0.0, 0.2, 1),
            useNativeDriver: Platform.OS === 'android',
        }).start();

        const rotateInterpolate = rotateAnimated.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg']
        });

        this.setState({rotateInterpolate});
    };

    refreshPriorityColors = () => {
        this.setState({
            priorityColors: {
                none: {bgColor: this.props.theme.secondaryBackgroundColor},
                low: {bgColor: this.props.theme.lowColor},
                medium: {bgColor: this.props.theme.mediumColor},
                high: {bgColor: this.props.theme.highColor}
            }
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
                            const {selectedTask} = this.state;
                            this.props.onFinishTask(selectedTask, false, this.props.theme.primaryColor, () => {
                                this.props.onAddEndedTask();

                                const {animations} = this.state;
                                animations[`move${selectedTask.id}`] = new Animated.Value(0);
                                animations[`hide${selectedTask.id}`] = false;
                                this.setState({animations});
                            })
                        });
                    },
                    [translations.no]: () => {
                        this.props.onUpdateModal(false);
                        this.moveAnimate(() => {
                            this.props.onFinishTask(this.state.selectedTask, true, this.props.theme.primaryColor, () => {
                                this.props.onAddEndedTask();
                            })
                        });
                    },
                    [translations.cancel]: () => this.props.onUpdateModal(false)
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
                            this.props.onFinishTask(this.state.selectedTask, true, this.props.theme.primaryColor, () => {
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
                            this.props.onRemoveTask(this.state.selectedTask);
                        });
                    },
                    [translations.no]: () => this.props.onUpdateModal(false)
                }
            );
        } else if (action === 'deleteAll') {
            dialog = generateDialogObject(
                translations.defaultAllTitle,
                translations.finishAllDescription,
                {
                    [translations.yes]: () => {
                        this.props.onUpdateModal(false);
                        this.deleteAllTask();
                    },
                    [translations.no]: () => {
                        this.props.onUpdateModal(false);
                    },
                }
            );
        }

        this.props.onUpdateModal(true, dialog);
    };

    checkTaskRepeatHandler = (task) => {
        if (task.repeat !== 'noRepeat') {
            if (!!this.props.settings.confirmRepeatingTask) {
                this.showDialog('repeat');
            } else {
                this.moveAnimate(() => {
                    this.props.onFinishTask(task, false, this.props.theme.primaryColor, () => {
                        this.props.onAddEndedTask();

                        const {animations} = this.state;
                        animations[`move${task.id}`] = new Animated.Value(0);
                        animations[`hide${task.id}`] = false;
                        this.setState({animations});
                    });
                })
            }
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

    deleteAllTask = () => {
        const {finished} = this.props;
        finished.map(task => {
            return this.props.onRemoveTask(task);
        });
    };

    checkDeleteHandler = () => {
        if (!!this.props.settings.confirmDeletingTask) {
            this.showDialog('delete');
        } else {
            this.moveAnimate(() => {
                this.props.onRemoveTask(this.state.selectedTask);
            })
        }
    };

    undoTask = (task) => {
        this.moveAnimate(() => {
            this.props.onUndoTask(task);
        })
    };

    moveAnimate = (callback = () => null) => {
        const {animations} = this.state;
        animations[`move${this.state.selectedTask.id}`] = new Animated.Value(0);
        this.setState({animations}, () => {
            Animated.timing(
                this.state.animations[`move${this.state.selectedTask.id}`],
                {
                    toValue: -400,
                    duration: 500,
                    easing: Easing.bezier(0.0, 0.0, 0.2, 1),
                    useNativeDriver: Platform.OS === 'android'
                }
            ).start(() => {
                animations[`hide${this.state.selectedTask.id}`] = true;
                this.setState({animations});
                callback()
            });
        })
    };

    setSortingType = (key) => {
        if (key === this.props.sorting) {
            if (this.props.sortingType === 'ASC') {
                this.props.onChangeSorting(key, 'DESC');
            } else {
                this.props.onChangeSorting(key, 'ASC');
            }
        } else {
            this.props.onChangeSorting(key, 'ASC');
        }
    };

    divisionTask = () => {
        const {tasks} = this.state;
        const {sorting, sortingType, translations} = this.props;
        const division = {
            [translations.overdue]: [],
            [translations.today]: [],
            [translations.tomorrow]: [],
            [translations.thisWeek]: [],
            [translations.nextWeek]: [],
            [translations.thisMonth]: [],
            [translations.nextMonth]: [],
            [translations.later]: [],
            [translations.other]: [],
            [translations.finished]: []
        };

        tasks && Promise.all(tasks.map(task => {
            let div;
            if (task.finish) {
                div = translations.finished;
                division[div].push(task);
            } else {
                div = this.getDateDivision(task.date);
                division[div].push(task);
            }
            return sortingByType(division[div], sorting, sortingType);
        })).then(() => {
            this.setState({division, animations: {}, initDivision: true, loading: false});
        });
    };

    getDateDivision = (date) => {
        const {translations} = this.props;
        let text;
        let now;
        if (!date) {
            text = translations.other;
            return text;
        } else {
            if (date.length > 12) {
                date = moment(date, 'DD-MM-YYYY - HH:mm');
                now = new Date();
            } else {
                date = moment(date, 'DD-MM-YYYY');
                now = new Date().setHours(0, 0, 0, 0);
            }
        }

        let week = 'week';
        if (this.props.settings.firstDayOfWeek === 'Monday') week = 'isoWeek';

        if (+date < +now) text = translations.overdue;
        else if (+date <= moment(now).endOf("day")) text = translations.today;
        else if (+date <= +moment(now).add(1, 'days').endOf("day")) text = translations.tomorrow;
        else if (date <= moment(now).endOf(week)) text = translations.thisWeek;
        else if (+date <= +moment(now).add(1, 'week').endOf(week)) text = translations.nextWeek;
        else if (date <= moment(now).endOf("month")) text = translations.thisMonth;
        else if (date <= moment(now).add(1, 'month').endOf("month")) text = translations.nextMonth;
        else text = translations.later;

        return text;
    };

    toggleConfigCategory = () => {
        const {showConfigCategory} = this.state;
        this.setState({showConfigCategory: !showConfigCategory});
    };

    selectedCategoryHandler = (
        category = this.state.selectedCategory,
        index = this.state.selectedIndex) => {
        const {tasks, finished, translations} = this.props;

        let filterTask = tasks;
        if (category.name === translations.finished) {
            filterTask = finished;
        } else if (category.name === translations.newCategory) {
            return this.toggleConfigCategory();
        } else if (category.name !== translations.all) {
            filterTask = tasks.filter(task => task.category.id === category.id);
        }

        this.setState({
            selectedCategory: category,
            selectedIndex: +index,
            tasks: filterTask
        }, this.divisionTask);
    };

    renderTaskList = () => {
        const {division, initDivision, priorityColors} = this.state;
        const {translations, theme, navigation} = this.props;
        if (initDivision) {
            return Object.keys(division).map(div => (
                division[div].map((task, index) => {
                    const moveValue = this.state.animations[`move${task.id}`] ?
                        this.state.animations[`move${task.id}`] : 0;
                    const hideTask = this.state.animations[`hide${task.id}`] ?
                        this.state.animations[`hide${task.id}`] : 'auto';

                    // Searching system
                    const searchText = this.state.searchText.toLowerCase();
                    if (searchText.length > 0 && task.name.toLowerCase().indexOf(searchText) < 0) {
                        if (task.description.toLowerCase().indexOf(searchText) < 0) {
                            if (task.category.name.toLowerCase().indexOf(searchText) < 0) {
                                return null;
                            }
                        }
                    }

                    return (
                        <View key={index}>
                            {!index &&
                            <Subheader
                                text={div}
                                style={{
                                    text: div === translations.overdue ?
                                        {color: theme.warningColor} :
                                        {color: theme.thirdTextColor}
                                }}
                            />
                            }
                            <Animated.View style={{height: hideTask, left: moveValue}}>
                                <View style={{marginLeft: 15, marginRight: 15, marginBottom: 15}}>
                                    <ListItem
                                        divider
                                        dense
                                        onPress={() => task.finish ?
                                            null : navigation.navigate('ConfigTask', {task: task.id})}
                                        style={{
                                            container: [
                                                shadow,
                                                {backgroundColor: theme.primaryBackgroundColor}
                                            ],
                                            leftElementContainer: {
                                                marginRight: -50
                                            },
                                            primaryText: {
                                                fontSize: 18,
                                                color: theme.secondaryTextColor
                                            },
                                            secondaryText: {
                                                fontWeight: '500',
                                                color: task.finished ?
                                                    theme.thirdTextColor :
                                                    div === translations.overdue ?
                                                        theme.warningColor :
                                                        theme.thirdTextColor
                                            },
                                            tertiaryText: {
                                                color: theme.thirdTextColor
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
                                            tertiaryText: task.category ? task.category.name : ' '
                                        }}
                                        rightElement={
                                            <View style={styles.rightElements}>
                                                <IconToggle
                                                    color={task.finish ?
                                                        theme.undoIconColor :
                                                        theme.doneIconColor
                                                    }
                                                    style={{
                                                        container: {
                                                            marginRight: task.finish ? -10 : 5
                                                        }
                                                    }}
                                                    size={32}
                                                    name={task.finish ? 'replay' : 'done'}
                                                    onPress={() => this.updateTask(task)}
                                                />
                                                {task.finish &&
                                                <IconToggle
                                                    onPress={() => this.updateTask(task, 'delete')}
                                                    name="delete"
                                                    color={theme.warningColor}
                                                    size={28}
                                                />}
                                            </View>
                                        }
                                    />
                                </View>
                            </Animated.View>
                        </View>
                    )
                })
            ));
        }
    };

    renderDropdownData = () => {
        const {categories, translations} = this.props;
        if (!categories.length) return null;
        const dropdownData = [];
        const all = {
            id: -1,
            name: translations.all
        };
        const finish = {
            id: -2,
            name: translations.finished
        };
        const newCate = {
            id: -3,
            name: translations.newCategory
        };
        dropdownData.push(all, ...categories, finish, newCate);
        this.setState({dropdownData});
    };

    dropdownRenderRow(rowData) {
        const {selectedCategory} = this.state;
        const {tasks, finished, theme} = this.props;
        let data;
        if (rowData.id === -3) {
            data = {
                icon: 'playlist-add',
                amount: false,
                bgColor: theme.secondaryBackgroundColor
            };
        } else if (rowData.id === -1)
            data = {
                icon: 'dehaze',
                amount: tasks.length,
                bgColor: theme.primaryBackgroundColor
            };
        else if (rowData.id === -2)
            data = {
                icon: 'done',
                amount: finished.length,
                bgColor: theme.primaryBackgroundColor
            };
        else {
            const amountOfTasks = tasks.filter(task => task.category.id === rowData.id);
            data = {
                icon: 'bookmark-border',
                amount: amountOfTasks.length,
                bgColor: theme.primaryBackgroundColor
            };
        }

        return (
            <TouchableHighlight underlayColor={theme.primaryColor}>
                <View style={[styles.dropdownRow, {backgroundColor: data.bgColor}]}>
                    <Icon name={data.icon}
                          style={styles.dropdownIcon}
                          color={selectedCategory.id === rowData.id ?
                              theme.primaryColor :
                              theme.thirdTextColor}/>
                    <Text style={[styles.dropdownRowText,
                        selectedCategory.id === rowData.id ?
                            {color: theme.primaryColor} :
                            {color: theme.thirdTextColor}]}>
                        {rowData.name}
                    </Text>
                    <Text style={[styles.dropdownRowText,
                        selectedCategory.id === rowData.id ?
                            {color: theme.primaryColor} :
                            {color: theme.thirdTextColor}]}>
                        {data.amount ? `(${data.amount})` : ''}
                    </Text>
                </View>
            </TouchableHighlight>
        );
    };

    updateTask = (task, action = null) => {
        this.setState({selectedTask: task}, () => {
            if (action === 'delete') {
                this.checkDeleteHandler();
            } else {
                if (task.finish) {
                    this.undoTask(task);
                } else {
                    this.checkTaskRepeatHandler(task);
                }
            }
        })
    };

    render() {
        const {
            showConfigCategory, dropdownData, selectedIndex,
            rotateInterpolate, bottomHidden, tasks, selectedCategory, loading
        } = this.state;
        const {theme, navigation, sortingType, sorting, finished, translations} = this.props;

        return (
            <View style={flex}>
                <Toolbar
                    searchable={{
                        autoFocus: true,
                        placeholder: translations.search,
                        onChangeText: value => this.setState({searchText: value}),
                        onSearchClosed: () => this.setState({searchText: ''})
                    }}
                    leftElement="menu"
                    onLeftElementPress={() => navigation.navigate('Drawer')}
                    centerElement={
                        <ModalDropdown
                            ref={e => this.dropdown = e}
                            style={styles.dropdown}
                            textStyle={styles.dropdownText}
                            dropdownStyle={styles.dropdownDropdown}
                            defaultValue={selectedCategory.name}
                            defaultIndex={selectedIndex}
                            options={dropdownData}
                            onDropdownWillShow={() => this.rotate(1)}
                            onDropdownWillHide={() => this.rotate(0)}
                            onSelect={(index, item) => {
                                this.selectedCategoryHandler(item, index);
                            }}
                            renderButtonText={(rowData) => rowData.name}
                            renderRow={this.dropdownRenderRow.bind(this)}
                        >
                            <View style={styles.dropdownButton}>
                                <Text style={[styles.dropdownText, {
                                    color: theme.primaryTextColor,
                                    fontWeight: '500'
                                }]}>
                                    {selectedCategory.name}
                                </Text>
                                <Animated.View style={{transform: [{rotate: rotateInterpolate}]}}>
                                    <Icon
                                        style={styles.dropdownButtonIcon}
                                        color={theme.primaryTextColor}
                                        name="expand-more"/>
                                </Animated.View>
                            </View>
                        </ModalDropdown>
                    }
                />

                <ConfigCategory
                    category={false}
                    showModal={showConfigCategory}
                    toggleModal={this.toggleConfigCategory}
                />

                {loading ? <Spinner/> :
                    <ScrollView
                        keyboardShouldPersistTaps="always"
                        keyboardDismissMode="interactive"
                        onScroll={this.onScroll}
                        style={fullWidth}>
                        {(tasks && tasks.length) ?
                            <View style={{paddingBottom: 20}}>
                                {this.renderTaskList()}
                            </View>
                            : <Text style={[empty, {color: theme.thirdTextColor}]}>
                                {translations.emptyList}
                            </Text>
                        }
                    </ScrollView>
                }

                <View>
                    {selectedCategory.name !== translations.finished ?
                        <ActionButton
                            hidden={bottomHidden}
                            onPress={() => navigation.navigate('ConfigTask', {category: selectedCategory})}
                            icon="add"
                            style={{
                                container: {backgroundColor: theme.warningColor},
                                icon: {color: theme.primaryTextColor}
                            }}
                        /> :
                        finished.length ?
                            <ActionButton
                                hidden={bottomHidden}
                                style={{
                                    container: {backgroundColor: theme.warningColor},
                                    icon: {color: theme.primaryTextColor}
                                }}
                                onPress={() => this.showDialog('deleteAll')}
                                icon="delete-sweep"
                            /> : null
                    }
                </View>
                <BottomNavigation
                    style={{container: {backgroundColor: theme.primaryBackgroundColor}}}
                    hidden={bottomHidden}
                    active={sorting}>
                    <BottomNavigation.Action
                        key="byAZ"
                        style={{label: {fontSize: 13}}}
                        icon="format-line-spacing"
                        label={sortingType === 'ASC' ? "A-Z" : "Z-A"}
                        onPress={() => this.setSortingType('byAZ')}
                    />
                    <BottomNavigation.Action
                        key="byDate"
                        style={{label: {fontSize: 13}}}
                        icon="insert-invitation"
                        label={translations.date}
                        onPress={() => this.setSortingType('byDate')}
                    />
                    <BottomNavigation.Action
                        key="byCategory"
                        style={{label: {fontSize: 13}}}
                        icon="bookmark-border"
                        label={translations.category}
                        onPress={() => this.setSortingType('byCategory')}
                    />
                    <BottomNavigation.Action
                        key="byPriority"
                        style={{label: {fontSize: 13}}}
                        icon="priority-high"
                        label={translations.priority}
                        onPress={() => this.setSortingType('byPriority')}
                    />
                </BottomNavigation>
            </View>
        )
    }
}

const mapStateToProps = state => {
    return {
        sorting: state.settings.settings.sorting,
        sortingType: state.settings.settings.sortingType,
        theme: state.theme.theme,
        settings: state.settings.settings,
        translations: {
            ...state.settings.translations.TaskList,
            ...state.settings.translations.common
        },
        tasks: state.tasks.tasks,
        finished: state.tasks.finished,
        categories: state.categories.categories,
        showModal: state.config.showModal
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        onInitToDo: (callback) => dispatch(actions.initToDo(callback)),
        onFinishTask: (task, endTask, primaryColor, callback) => dispatch(actions.finishTask(task, endTask, primaryColor, callback)),
        onRemoveTask: (task) => dispatch(actions.removeTask(task)),
        onUndoTask: (task) => dispatch(actions.undoTask(task)),
        onAddEndedTask: () => dispatch(actions.addEndedTask()),
        onChangeSorting: (sorting, type) => dispatch(actions.changeSorting(sorting, type)),
        onUpdateModal: (showModal, modal) => dispatch(actions.updateModal(showModal, modal))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(TaskList);