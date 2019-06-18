import React, {Component} from 'react';
import {StyleSheet, View, ScrollView, Animated, Text, ActivityIndicator,TouchableHighlight, Easing, Platform} from 'react-native';
import {ActionButton, Toolbar, BottomNavigation, Icon} from 'react-native-material-ui';
import ModalDropdown from 'react-native-modal-dropdown';
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
        dropdownData: null,
        selectedCategory: 'All',
        selectedIndex: 0,
        searchText: '',
        loading: true,
        showModal: false,
        scroll: 0,
        offset: 0,
        scrollDirection: 0,
        bottomHidden: false,
        rotateAnimated: new Animated.Value(0),
        rotateInterpolate: '0deg',
    };

    componentDidMount() {
        this.props.onInitToDo();
        this.props.onInitCategories();
        this.props.onInitSettings();
        //if (!this.props.isAuth) this.props.navigation.navigate('Auth');
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.refresh !== this.props.refresh) {
            if (this.state.selectedCategory === 'Finished') {
                this.setState({ tasks: this.props.finished, loading: false });
            }
            else {
                let filterTask = this.props.tasks;
                if (this.state.selectedCategory !== 'All') {
                    filterTask = this.props.tasks.filter(task => task.category === this.state.selectedCategory);
                }
                this.setState({ tasks: filterTask, loading: false });
            }
        }
        if (prevProps.categories !== this.props.categories && this.props.categories.length) {
            this.renderDropdownData();
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

        this.setState({ rotateInterpolate });
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

    selectedCategoryHandler = (category, index) => {
        const { tasks, finished } = this.props;
        let filterTask = tasks;

        if (category === 'Finished') {
            return this.setState({ selectedCategory: category, selectedIndex: +index, tasks: finished });
        }
        else if (category === 'New category') {
            return this.toggleModalHandler();
        }
        else if (category !== 'All') {
            this.props.onChangeCategory(category);
            filterTask = tasks.filter(task => task.category === category);
        }

        return this.setState({ selectedCategory: category, selectedIndex: +index, tasks: filterTask });
    };

    renderDropdownData = () => {
        const { categories } = this.props;
        if (!categories.length) return null;
        const dropdownData = [];
        const all = {
            id: -1,
            name: 'All'
        };
        const finish = {
            id: -2,
            name: 'Finished'
        };
        const newCate = {
            id: -3,
            name: 'New category'
        };
        dropdownData.push(all, ...categories, finish, newCate);
        this.setState({ dropdownData });
    };

    dropdownRenderRow(rowData) {
        const {selectedCategory} = this.state;
        const {tasks,finished} = this.props;
        let data;
        if (rowData.id === -3) data = { icon: 'playlist-add', amount: false, bgColor: '#ddd' };
        else if (rowData.id === -1) data = { icon: 'dehaze', amount: tasks.length, bgColor: 'white' };
        else if (rowData.id === -2) data = { icon: 'done', amount: finished.length, bgColor: 'white' };
        else {
            const amountOfTasks = this.props.tasks.filter(task => task.category === rowData.name);
            data = { icon: 'bookmark-border', amount: amountOfTasks.length, bgColor: 'white' };
        }

        return (
            <TouchableHighlight underlayColor='#f4511e'>
                <View style={[styles.dropdown_row, {backgroundColor: data.bgColor}]}>
                    <Icon style={styles.dropdown_image} color="black" name={data.icon} />
                    <Text style={[styles.dropdown_row_text, selectedCategory === rowData.name && {color: '#f4511e'}]}>
                        {rowData.name}
                    </Text>
                    <Text>{data.amount ? `(${data.amount})` : ''}</Text>
                </View>
            </TouchableHighlight>
        );
    }

    render() {
        const {selectedCategory, tasks, loading, showModal, searchText, bottomHidden, dropdownData, selectedIndex, rotateInterpolate} = this.state;
        const {navigation, finished, sortingType, sorting} = this.props;

        return (
            <Template bgColor="#e5e5e5">
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
                        <ModalDropdown ref={e => this.dropdown = e}
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
                                <Text style={styles.dropdown_text}>{selectedCategory}</Text>
                                <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                                    <Icon style={styles.dropdown_button_icon} color="white" name="expand-more"/>
                                </Animated.View>
                            </View>
                        </ModalDropdown>
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
                                hidden={bottomHidden}
                                onPress={() => navigation.navigate('ConfigTask')}
                                icon="add"
                            />
                            :
                            finished.length ?
                            <ActionButton
                                hidden={bottomHidden}
                                style={{container: {backgroundColor: '#b6c1ce'}}}
                                onPress={() => this.deleteAllTask()}
                                icon="delete-sweep"
                            /> : null
                        }
                    </View>
                    <BottomNavigation hidden={bottomHidden} active={sorting}>
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
    },
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
        color: 'white',
        textAlign: 'left',
        textAlignVertical: 'center',
    },
    dropdown_dropdown: {
        marginTop: -20,
        justifyContent: 'flex-start',
        width: 230,
        height: 'auto',
        maxHeight: '80%',
        borderWidth: 2,
        borderRadius: 3,
    },
    dropdown_row: {
        flexDirection: 'row',
        height: 45,
        width: '100%',
        alignItems: 'center',
    },
    dropdown_image: {
        marginLeft: 4,
        width: 30,
        height: 30,
        textAlignVertical: 'center',
    },
    dropdown_row_text: {
        marginHorizontal: 4,
        fontSize: 17,
        color: 'black',
        textAlignVertical: 'center',
    },
    dropdown_separator: {
        height: 1,
        backgroundColor: 'cornflowerblue',
    },
});

const mapStateToProps = state => {
    return {
        tasks: state.tasks.tasks,
        finished: state.tasks.finished,
        sorting: state.settings.sorting,
        sortingType: state.settings.sortingType,
        refresh: state.tasks.refresh,
        categories: state.categories.categories
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onInitToDo: () => dispatch(actions.initToDo()),
        onInitCategories: () => dispatch(actions.initCategories()),
        onInitSettings: () => dispatch(actions.initSettings()),
        onChangeCategory: (category) => dispatch(actions.changeCategory(category)),
        onChangeSorting: (sorting, type) => dispatch(actions.changeSorting(sorting, type)),
        onRemoveTask: (task) => dispatch(actions.removeTask(task)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ToDo);