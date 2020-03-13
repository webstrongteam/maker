import React, {Component} from 'react';
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import Spinner from '../../components/UI/Spinner/Spinner';
import TaskList from '../Tasks/TaskList';
import Template from '../Template/Template';
import QuicklyList from '../QuicklyList/QuicklyList';

import {connect} from 'react-redux';
import * as actions from "../../store/actions";

class ToDo extends Component {
    state = {
        loading: true,
        tabs: {
            index: 0,
            routes: [
                {key: 'tasks', title: this.props.translations.tasks},
                {key: 'lists', title: this.props.translations.quicklyLists}
            ]
        }
    };

    componentDidMount() {
        this.props.onInitTheme();
        this.props.onInitCategories();
        this.props.onInitProfile();
        this.props.onInitToDo();
        this.props.onInitLists();
        this.props.onInitSettings(() => {
            this.setState({loading: false});
        });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.translations !== this.props.translations) {
            const {tabs} = this.state;
            tabs.routes[0].title = this.props.translations.tasks;
            tabs.routes[1].title = this.props.translations.quicklyLists;
            this.setState({tabs});
        }
    }

    render() {
        const {tabs, loading} = this.state;
        const {navigation, theme, hideTabView} = this.props;

        return (
            <React.Fragment>
                {theme && !loading ?
                    <Template bgColor={theme.secondaryBackgroundColor}>
                        <TabView
                            navigationState={tabs}
                            tabStyle={{backgroundColor: theme.primaryColor}}
                            onIndexChange={index => {
                                tabs.index = index;
                                this.setState({tabs});
                            }}
                            renderScene={SceneMap({
                                tasks: () => (
                                    <TaskList navigation={navigation}/>
                                ),
                                lists: () => (
                                    <QuicklyList navigation={navigation}/>
                                )
                            })}
                            renderTabBar={(props) =>
                                <TabBar
                                    {...props}
                                    onTabPress={({route}) => {
                                        props.jumpTo(route.key);
                                    }}
                                    indicatorStyle={{backgroundColor: theme.primaryTextColor}}
                                    style={{
                                        backgroundColor: theme.primaryColor,
                                        height: !!hideTabView ? 0 : 50
                                    }}
                                />
                            }
                            renderLazyPlaceholder={() => <Spinner/>}
                            lazy
                        />
                    </Template> : <Spinner color="#f4511e"/>
                }
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        lang: state.settings.settings.lang,
        hideTabView: state.settings.settings.hideTabView,
        translations: state.settings.translations.ToDo
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onInitToDo: () => dispatch(actions.initToDo()),
        onInitLists: () => dispatch(actions.initLists()),
        onInitCategories: () => dispatch(actions.initCategories()),
        onInitTheme: () => dispatch(actions.initTheme()),
        onInitProfile: () => dispatch(actions.initProfile()),
        onInitSettings: (callback) => dispatch(actions.initSettings(callback))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ToDo);