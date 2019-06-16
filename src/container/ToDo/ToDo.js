import React, {Component} from 'react';
import {StyleSheet, View, ScrollView, Picker, ActivityIndicator, Animated, Easing, Platform} from 'react-native';
import {ActionButton, Toolbar, BottomNavigation} from 'react-native-material-ui';
import TaskList from '../TaskList/TaskList';
import Template from '../Template/Template';
import ConfigCategory from "../ConfigCategory/ConfigCategory";

import { connect } from 'react-redux';
import * as actions from "../../store/actions";

const UP = 1;
const DOWN = -1;

class ToDo extends Component {
    state = {
        tasks: [],
        selectedCategory: 'All',
        searchText: '',
        loading: true,
        showModal: false,
        scroll: 0,
        offset: 0,
        scrollDirection: 0,
        buttonMoveAnimated: new Animated.Value(0)
    };

    componentDidMount() {
        this.props.onInitTasks();
        this.props.onInitFinished();
        this.props.onInitCategories();
        this.props.onInitSettings();
        //if (!this.props.isAuth) this.props.navigation.navigate('Auth');
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.refresh !== this.props.refresh) {
            if (this.state.selectedCategory === 'finished') {
                this.setState({ tasks: this.props.finished, loading: false });
            }
            else {
                this.setState({ tasks: this.props.tasks, loading: false });
            }
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

            if (currentDirection === DOWN) {
                this.moveElement(this.state.buttonMoveAnimated, 80, 195);
            } else {
                this.moveElement(this.state.buttonMoveAnimated, 0, 225);
            }
        }
    };

    moveElement = (el, value, time) => {
        Animated.timing(el, {
            toValue: value,
            duration: time,
            easing: Easing.bezier(0.0, 0.0, 0.2, 1),
            useNativeDriver: Platform.OS === 'android',
        }).start();
    };

    toggleModalHandler = () => {
        const { showModal } = this.state;
        this.setState({ showModal: !showModal });
    };

    deleteAllTask = async () => {
        const {finished} = this.props;
        await finished.forEach(task => {
            this.props.onRemoveTask(task);
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

    selectedCategoryHandler = (category) => {
        const { tasks, finished } = this.props;
        let filterTask = tasks;

        if (category === 'finished') {
            return this.setState({ selectedCategory: category, tasks: finished });
        }
        else if (category === 'new') {
            return this.toggleModalHandler();
        }
        else if (category !== 'All') {
            filterTask = tasks.filter(task => task.category === category);
        }

        return this.setState({ selectedCategory: category, tasks: filterTask });
    };

    render() {
        const {selectedCategory, tasks, loading, showModal, searchText} = this.state;
        const {navigation, categories, finished, sortingType, sorting} = this.props;

        return (
            <Template>
                <Toolbar
                    searchable={{
                        autoFocus: true,
                        placeholder: 'Search',
                        onChangeText: value => this.setState({ searchText: value }),
                        onSearchClosed: () => this.setState({ searchText: '' }),
                    }}
                    leftElement="menu"
                    onLeftElementPress={() => navigation.navigate('Drawer')}
                    centerElement={
                        <Picker
                            style={styles.picker}
                            selectedValue={selectedCategory}
                            onValueChange={(itemValue, itemIndex) =>
                                this.selectedCategoryHandler(itemValue)
                            }>
                            <Picker.Item
                                color="black"
                                label={`All (${this.props.tasks.length})`}
                                value="All" />
                            {categories.map(cate => {
                                const amountOfTasks = this.props.tasks.filter(task => task.category === cate.name);
                                return <Picker.Item
                                    key={cate.id}
                                    color="black"
                                    label={`${cate.name} (${amountOfTasks.length})`}
                                    value={cate.name} />
                                })
                            }
                            <Picker.Item
                                color="#939393"
                                value='finished'
                                label={`Finished (${finished.length})`} />
                            <Picker.Item
                                color="#939393"
                                label='New category'
                                value='new' />
                        </Picker>
                    }
                />
                <ConfigCategory
                    editCategory={false}
                    showModal={showModal}
                    toggleModal={this.toggleModalHandler}
                />
                {!loading ?
                <React.Fragment>
                    <View style={styles.container}>
                        <ScrollView
                            keyboardShouldPersistTaps="always"
                            keyboardDismissMode="interactive"
                            onScroll={this.onScroll}
                            style={styles.tasks}>
                            <TaskList
                                searchText={searchText}
                                tasks={tasks}
                                sortingType={sortingType}
                                sorting={sorting}
                                navigation={navigation}
                            />
                        </ScrollView>
                    </View>
                    <View>
                        {selectedCategory !== 'finished' ?
                            <ActionButton
                                onPress={() => navigation.navigate('ConfigTask')}
                                icon="add"
                            /> :
                            finished.length ?
                            <ActionButton
                                style={{
                                    container: {backgroundColor: '#b6c1ce'}
                                }}
                                onPress={() => this.deleteAllTask()}
                                icon="delete-sweep"
                            /> : null
                        }
                    </View>
                    <BottomNavigation active={sorting}>
                        <BottomNavigation.Action
                            key="byAZ"
                            icon="format-line-spacing"
                            label={ sortingType === 'ASC' ? "A-Z" : "Z-A" }
                            onPress={() => this.setSortingType('byAZ')}
                        />
                        <BottomNavigation.Action
                            key="byDate"
                            icon="insert-invitation"
                            label="Date"
                            onPress={() => this.setSortingType('byDate')}
                        />
                        <BottomNavigation.Action
                            key="byCategory"
                            icon="bookmark-border"
                            label="Category"
                            onPress={() => this.setSortingType('byCategory')}
                        />
                        <BottomNavigation.Action
                            key="byPriority"
                            icon="priority-high"
                            label="Priority"
                            onPress={() => this.setSortingType('byPriority')}
                        />
                    </BottomNavigation>
                </React.Fragment> :
                <View style={[styles.container, styles.horizontal]}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
                }
            </Template>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center'
    },
    tasks: {
        width: "100%",
    },
    horizontal: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 50
    },
    picker: {
        color: 'white'
    }
});

const mapStateToProps = state => {
    return {
        tasks: state.tasks.tasks,
        finished: state.tasks.finished,
        sorting: state.settings.sorting,
        sortingType: state.settings.sortingType,
        refresh: state.tasks.refresh,
        categories: state.categories.categories,
        isAuth: state.auth.isAuth
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onInitTasks: () => dispatch(actions.initTasks()),
        onInitFinished: () => dispatch(actions.initFinished()),
        onInitCategories: () => dispatch(actions.initCategories()),
        onInitSettings: () => dispatch(actions.initSettings()),
        onChangeSorting: (sorting, type) => dispatch(actions.changeSorting(sorting, type)),
        onRemoveTask: (task) => dispatch(actions.removeTask(task)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ToDo);