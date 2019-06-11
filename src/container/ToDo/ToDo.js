import React, {Component} from 'react';
import {StyleSheet, View, ScrollView, Picker, ActivityIndicator} from 'react-native';
import {ActionButton, Toolbar, BottomNavigation} from 'react-native-material-ui';
import TaskList from '../TaskList/TaskList';
import Template from '../Template/Template';

import { connect } from 'react-redux';
import ConfigCategory from "../ConfigCategory/ConfigCategory";
import * as actions from "../../store/actions";

class ToDo extends Component {
    state = {
        active: 'byAZ',
        tasks: null,
        selectedCategory: 'All',
        loading: true,
        showModal: false
    };

    componentDidMount() {
        this.props.onInitTasks();
        this.props.onInitFinished();
        this.props.onInitCategories();
        //if (!this.props.isAuth) this.props.navigation.navigate('Auth');
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps !== this.props || prevProps.refresh !== this.props.refresh) {
            if (this.state.selectedCategory === 'finished') {
                this.setState({ tasks: this.props.finished, loading: false });
            }
            else {
                this.setState({ tasks: this.props.tasks, loading: false });
            }
        }
    }

    toggleModalHandler = () => {
        const { showModal } = this.state;
        this.setState({ showModal: !showModal });
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
        const {selectedCategory, tasks, loading, showModal} = this.state;
        const {navigation, categories} = this.props;

        return (
            <Template>
                <Toolbar
                    searchable={{
                        autoFocus: true,
                        placeholder: 'Search task',
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
                            <Picker.Item label="All" value="All" />
                            { categories.map(cate => (
                                <Picker.Item key={cate.id} label={cate.name} value={cate.name} />
                            )) }
                            <Picker.Item label='Finished' value='finished' />
                            <Picker.Item label='New category' value='new' />
                        </Picker>
                    }
                />
                {!loading ?
                <React.Fragment>
                    <View style={styles.container}>
                        <ScrollView style={styles.tasks}>
                            <TaskList tasks={tasks} navigation={navigation}/>
                        </ScrollView>
                    </View>
                    {selectedCategory !== 'finished' &&
                        <ActionButton
                            style={{
                                container: {marginBottom: 50}
                            }}
                            onPress={() => navigation.navigate('ConfigTask')}
                            icon="add"
                        />
                    }
                    <BottomNavigation active={this.state.active} >
                        <BottomNavigation.Action
                            key="byAZ"
                            icon="format-line-spacing"
                            label="A-Z"
                            onPress={() => this.setState({active: 'byAZ'})}
                        />
                        <BottomNavigation.Action
                            key="byDate"
                            icon="insert-invitation"
                            label="Date"
                            onPress={() => this.setState({active: 'byDate'})}
                        />
                        <BottomNavigation.Action
                            key="byCategory"
                            icon="bookmark-border"
                            label="Category"
                            onPress={() => this.setState({active: 'byCategory'})}
                        />
                        <BottomNavigation.Action
                            key="byPriority"
                            icon="priority-high"
                            label="Priority"
                            onPress={() => this.setState({active: 'byPriority'})}
                        />
                    </BottomNavigation>
                </React.Fragment> :
                <View style={[styles.container, styles.horizontal]}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
                }
                {showModal &&
                <ConfigCategory
                    navigation={navigation}
                    showModal={showModal}
                    toggleModal={this.toggleModalHandler}
                />
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
    inputContainer: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center"
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
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ToDo);