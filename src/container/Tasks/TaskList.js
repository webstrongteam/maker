import React, {Component} from 'react';
import {Animated, Easing, Platform, ScrollView, StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import {
    ActionButton,
    BottomNavigation,
    Button,
    Icon,
    IconToggle,
    ListItem,
    Subheader,
    Toolbar
} from 'react-native-material-ui';
import {generateDialogObject, sortingByType} from '../../shared/utility';
import Dialog from '../../components/UI/Dialog/Dialog';
import AnimatedView from '../AnimatedView/AnimatedView';
import {empty, flex, fullWidth} from '../../shared/styles';
import ModalDropdown from 'react-native-modal-dropdown';
import ConfigCategory from "../Categories/ConfigCategory";
import moment from 'moment';

import {connect} from 'react-redux';
import * as actions from "../../store/actions";

const UP = 1;
const DOWN = -1;

class TaskList extends Component {
    state = {
        priorityColors: {
            none: {bgColor: this.props.theme.noneColor, color: this.props.theme.noneTextColor},
            low: {bgColor: this.props.theme.lowColor, color: this.props.theme.lowTextColor},
            medium: {bgColor: this.props.theme.mediumColor, color: this.props.theme.mediumTextColor},
            high: {bgColor: this.props.theme.highColor, color: this.props.theme.highTextColor},
        },
        dialog: {},
        showDialog: false,
        showConfigCategory: false,
        selectedTask: false,
        initDivision: false,

        scroll: 0,
        offset: 0,
        scrollDirection: 0,
        bottomHidden: false,

        tasks: [],
        dropdownData: null,
        selectedCategory: this.props.translations.all,
        selectedIndex: 0,
        searchText: '',
        rotateAnimated: new Animated.Value(0),
        rotateInterpolate: '0deg'
    };

    componentDidMount() {
        this.setState({tasks: this.props.tasks}, () => {
            this.divisionTask();
            this.renderDropdownData();
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.theme !== this.props.theme) {
            this.refreshPriorityColors();
        }
        if (prevProps.tasks !== this.props.tasks ||
            prevProps.finished !== this.props.finished) {
            const {selectedCategory, selectedIndex} = this.state;
            this.selectedCategoryHandler(selectedCategory, selectedIndex);
        }
        if (prevProps.categories !== this.props.categories) {
            this.renderDropdownData();
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
                bottomHidden: currentDirection === DOWN,
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
                none: {bgColor: this.props.theme.noneColor, color: this.props.theme.noneTextColor},
                low: {bgColor: this.props.theme.lowColor, color: this.props.theme.lowTextColor},
                medium: {bgColor: this.props.theme.mediumColor, color: this.props.theme.mediumTextColor},
                high: {bgColor: this.props.theme.highColor, color: this.props.theme.highTextColor}
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
                        this.props.onFinishTask(this.state.selectedTask, false, this.props.theme.primaryColor, () => {
                            this.setState({showDialog: false, selectedTask: false});
                            this.props.onAddEndedTask();
                        });
                    },
                    [translations.no]: () => {
                        this.props.onFinishTask(this.state.selectedTask, true, this.props.theme.primaryColor, () => {
                            this.setState({showDialog: false, selectedTask: false});
                            this.props.onAddEndedTask();
                        });
                    },
                    [translations.cancel]: () => this.setState({showDialog: false, selectedTask: false})
                }
            );
        } else if (action === 'finish') {
            dialog = generateDialogObject(
                translations.defaultTitle,
                translations.finishDescription,
                {
                    [translations.yes]: () => {
                        this.props.onFinishTask(this.state.selectedTask, true, this.props.theme.primaryColor, () => {
                            this.setState({showDialog: false, selectedTask: false});
                            this.props.onAddEndedTask();
                            this.props.navigation.goBack();
                        });
                    },
                    [translations.no]: () => {
                        this.setState({showDialog: false});
                    }
                }
            );
        } else if (action === 'delete') {
            dialog = generateDialogObject(
                translations.defaultTitle,
                translations.deleteDescription,
                {
                    [translations.yes]: () => {
                        this.setState({showDialog: false});
                        this.props.onRemoveTask(this.state.selectedTask);
                        this.props.navigation.goBack();
                    },
                    [translations.no]: () => {
                        this.setState({showDialog: false});
                    }
                }
            );
        } else if (action === 'finishAll') {
            dialog = generateDialogObject(
                translations.defaultAllTitle,
                translations.finishAllDescription,
                {
                    [translations.yes]: () => {
                        this.setState({showDialog: false});
                        this.deleteAllTask();
                    },
                    [translations.no]: () => {
                        this.setState({showDialog: false});
                    },
                }
            );
        }
        this.setState({showDialog: true, dialog});
    };

    deleteAllTask = () => {
        const {finished} = this.props;
        finished.map(task => {
            this.props.onRemoveTask(task);
        });
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

        tasks && tasks.map(task => {
            let div;
            if (task.finish) {
                div = translations.finished;
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

    checkTaskRepeatHandler = (task) => {
        this.setState({selectedTask: task});
        if (task.repeat !== 'noRepeat' &&
            !!this.props.settings.confirmRepeatingTask) {
            this.showDialog('repeat');
        } else {
            if (!!this.props.settings.confirmFinishingTask) {
                this.showDialog('finish');
            } else {
                this.props.onFinishTask(task, false, this.props.theme.primaryColor, () => {
                    this.setState({selectedTask: false});
                });
            }
        }
    };

    checkDeleteHandler = (task) => {
        if (!!this.props.settings.confirmDeletingTask) {
            this.setState({selectedTask: task});
            this.showDialog('delete');
        } else this.props.onRemoveTask(task);
    };

    toggleConfigCategory = () => {
        const {showConfigCategory} = this.state;
        this.setState({showConfigCategory: !showConfigCategory});
    };

    selectedCategoryHandler = (category, index) => {
        const {tasks, finished, translations} = this.props;
        let filterTask = tasks;

        if (category === translations.finished) {
            filterTask = finished;
        } else if (category === translations.newCategory) {
            return this.toggleConfigCategory();
        } else if (category !== translations.all) {
            filterTask = tasks.filter(task => task.category === category);
        }

        this.setState({
            selectedCategory: category,
            selectedIndex: +index,
            tasks: filterTask
        }, this.divisionTask);
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
        } else if (rowData.id === -1) data = {
            icon: 'dehaze',
            amount: tasks.length,
            bgColor: theme.primaryBackgroundColor
        };
        else if (rowData.id === -2) data = {
            icon: 'done',
            amount: finished.length,
            bgColor: theme.primaryBackgroundColor
        };
        else {
            const amountOfTasks = this.props.tasks.filter(task => task.category === rowData.name);
            data = {
                icon: 'bookmark-border',
                amount: amountOfTasks.length,
                bgColor: theme.primaryBackgroundColor
            };
        }

        return (
            <TouchableHighlight underlayColor={theme.primaryColor}>
                <View style={[styles.dropdown_row, {backgroundColor: data.bgColor}]}>
                    <Icon name={data.icon}
                          style={styles.dropdown_icon}
                          color={selectedCategory === rowData.name ?
                              theme.primaryColor :
                              theme.textColor}/>
                    <Text style={[styles.dropdown_row_text,
                        selectedCategory === rowData.name ?
                            {color: theme.primaryColor} :
                            {color: theme.textColor}]}>
                        {rowData.name}
                    </Text>
                    <Text style={[styles.dropdown_row_text,
                        selectedCategory === rowData.name ?
                            {color: theme.primaryColor} :
                            {color: theme.textColor}]}>
                        {data.amount ? `(${data.amount})` : ''}
                    </Text>
                </View>
            </TouchableHighlight>
        );
    }

    render() {
        const {
            division, priorityColors, showConfigCategory, dropdownData, selectedIndex,
            rotateInterpolate, initDivision, dialog, showDialog, bottomHidden, tasks,
            selectedCategory
        } = this.state;
        const {theme, navigation, sortingType, sorting, finished, translations} = this.props;

        const taskList = initDivision &&
            Object.keys(division).map(div => (
                division[div].map((task, index) => {
                    // Searching system
                    const searchText = this.state.searchText.toLowerCase();
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
                                        text: div === translations.overdue ? {color: theme.overdueColor} : {color: theme.textColor}
                                    }}
                                />
                                }
                                <View style={{marginLeft: 10, marginRight: 10, marginBottom: 10}}>
                                    <ListItem
                                        divider
                                        dense
                                        onPress={() => task.finish ? true : navigation.navigate('ConfigTask', {task: task.id})}
                                        style={{
                                            container: [
                                                styles.shadow,
                                                {
                                                    backgroundColor: task.finish ?
                                                        priorityColors.none.bgColor :
                                                        priorityColors[task.priority].bgColor
                                                }
                                            ],
                                            primaryText: {
                                                fontSize: 18,
                                                color: task.finish ?
                                                    theme.textColor :
                                                    priorityColors[task.priority].color
                                            },
                                            secondaryText: {
                                                fontWeight: '500',
                                                color: task.finished ?
                                                    theme.textColor :
                                                    div === translations.overdue ?
                                                        theme.overdueColor :
                                                        priorityColors[task.priority].color
                                            },
                                            tertiaryText: {
                                                color: task.finish ?
                                                    theme.textColor :
                                                    priorityColors[task.priority].color
                                            }
                                        }}
                                        rightElement={
                                            <View style={styles.rightElements}>
                                                <Button
                                                    raised
                                                    style={{
                                                        container: {
                                                            backgroundColor: task.finish ?
                                                                theme.undoButtonColor :
                                                                theme.doneButtonColor,
                                                            marginRight: task.finish ? 0 : 15
                                                        },
                                                        text: {
                                                            color: task.finish ?
                                                                theme.undoButtonTextColor :
                                                                theme.doneButtonTextColor
                                                        }
                                                    }}
                                                    text={task.finish ? translations.undo : translations.done}
                                                    icon={task.finish ? 'replay' : 'done'}
                                                    onPress={() => {
                                                        task.finish ?
                                                            this.props.onUndoTask(task) :
                                                            this.checkTaskRepeatHandler(task)
                                                    }}
                                                />
                                                {task.finish &&
                                                <IconToggle
                                                    onPress={() => this.checkDeleteHandler(task)}
                                                    name="delete"
                                                    color={theme.actionButtonColor}
                                                    size={26}
                                                />}
                                            </View>
                                        }
                                        centerElement={{
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
            <View style={flex}>
                <Toolbar
                    searchable={{
                        autoFocus: true,
                        placeholder: translations.search,
                        onChangeText: value => this.setState({searchText: value}),
                        onSearchClosed: () => this.setState({searchText: ''}),
                    }}
                    leftElement="menu"
                    onLeftElementPress={() => navigation.navigate('Drawer')}
                    centerElement={
                        <ModalDropdown
                            ref={e => this.dropdown = e}
                            style={styles.dropdown}
                            textStyle={styles.dropdown_text}
                            dropdownStyle={styles.dropdown_dropdown}
                            defaultValue={selectedCategory}
                            defaultIndex={selectedIndex}
                            options={dropdownData}
                            onDropdownWillShow={() => this.rotate(1)}
                            onDropdownWillHide={() => this.rotate(0)}
                            onSelect={(index, item) => {
                                this.selectedCategoryHandler(item.name, index);
                                return false;
                            }}
                            renderButtonText={(rowData) => rowData.name}
                            renderRow={this.dropdownRenderRow.bind(this)}
                        >
                            <View style={styles.dropdown_button}>
                                <Text style={[styles.dropdown_text, {
                                    color: theme.headerTextColor,
                                    fontWeight: '500'
                                }]}>
                                    {selectedCategory}
                                </Text>
                                <Animated.View style={{transform: [{rotate: rotateInterpolate}]}}>
                                    <Icon
                                        style={styles.dropdown_button_icon}
                                        color={theme.headerTextColor}
                                        name="expand-more"/>
                                </Animated.View>
                            </View>
                        </ModalDropdown>
                    }
                />

                {showConfigCategory &&
                <ConfigCategory
                    category={false}
                    showModal={showConfigCategory}
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

                <ScrollView
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode="interactive"
                    onScroll={this.onScroll}
                    style={fullWidth}>
                    {tasks && tasks.length ?
                        <View style={{paddingBottom: 20}}>
                            {taskList}
                        </View>
                        : <Text style={[empty, {color: theme.textColor}]}>
                            {translations.emptyList}
                        </Text>
                    }
                </ScrollView>

                <View>
                    {selectedCategory !== translations.finished ?
                        <ActionButton
                            hidden={bottomHidden}
                            onPress={() => navigation.navigate('ConfigTask', {category: selectedCategory})}
                            icon="add"
                            style={{
                                container: {backgroundColor: theme.actionButtonColor},
                                icon: {color: theme.actionButtonIconColor}
                            }}
                        /> :
                        finished.length ?
                            <ActionButton
                                hidden={bottomHidden}
                                style={{
                                    container: {backgroundColor: theme.actionButtonColor},
                                    icon: {color: theme.actionButtonIconColor}
                                }}
                                onPress={() => this.showDialog('finishAll')}
                                icon="delete-sweep"
                            /> : null
                    }
                </View>
                <BottomNavigation
                    style={{container: {backgroundColor: theme.bottomNavigationColor}}}
                    hidden={bottomHidden}
                    active={sorting}>
                    <BottomNavigation.Action
                        key="byAZ"
                        icon="format-line-spacing"
                        label={sortingType === 'ASC' ? "A-Z" : "Z-A"}
                        onPress={() => this.setSortingType('byAZ')}
                    />
                    <BottomNavigation.Action
                        key="byDate"
                        icon="insert-invitation"
                        label={translations.date}
                        onPress={() => this.setSortingType('byDate')}
                    />
                    <BottomNavigation.Action
                        key="byCategory"
                        icon="bookmark-border"
                        label={translations.category}
                        onPress={() => this.setSortingType('byCategory')}
                    />
                    <BottomNavigation.Action
                        key="byPriority"
                        icon="priority-high"
                        label={translations.priority}
                        onPress={() => this.setSortingType('byPriority')}
                    />
                </BottomNavigation>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    dropdown: {
        width: 230,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        alignSelf: 'flex-start'
    },
    dropdown_button: {
        width: 230,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    dropdown_button_icon: {
        marginVertical: 10,
        marginHorizontal: 6,
        textAlignVertical: 'center'
    },
    dropdown_text: {
        marginVertical: 10,
        marginHorizontal: 6,
        fontSize: 18,
        textAlign: 'left',
        textAlignVertical: 'center',
    },
    dropdown_dropdown: {
        marginTop: -20,
        justifyContent: 'flex-start',
        width: 230,
        height: 'auto',
        maxHeight: 425,
        borderWidth: 2,
        borderRadius: 3,
    },
    dropdown_row: {
        flexDirection: 'row',
        height: 45,
        width: '100%',
        alignItems: 'center',
    },
    dropdown_icon: {
        marginLeft: 4,
        width: 30,
        height: 30,
        textAlignVertical: 'center',
    },
    dropdown_row_text: {
        marginHorizontal: 4,
        fontSize: 17,
        textAlignVertical: 'center',
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3
    },
    rightElements: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    }
});

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
        categories: state.categories.categories
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        onFinishTask: (task, endTask, primaryColor, callback) => dispatch(actions.finishTask(task, endTask, primaryColor, callback)),
        onRemoveTask: (task) => dispatch(actions.removeTask(task)),
        onUndoTask: (task) => dispatch(actions.undoTask(task)),
        onChangeSorting: (sorting, type) => dispatch(actions.changeSorting(sorting, type)),
        onAddEndedTask: () => dispatch(actions.addEndedTask())
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(TaskList);