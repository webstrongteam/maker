import React, {PureComponent} from 'react';
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import Spinner from '../../components/UI/Spinner/Spinner';
import TaskList from '../TaskList/TaskList';
import Template from '../Template/Template';
import QuicklyList from '../QuicklyList/QuicklyList';

import {connect} from 'react-redux';
import * as actions from "../../store/actions";

class ToDo extends PureComponent {
    state = {
        tabs: {
            index: 0,
            routes: [
                {key: 'tasks', title: 'Tasks'},
                {key: 'lists', title: 'Quickly lists'},
            ]
        }
    };

    componentDidMount() {
        this.props.onInitTheme();
        this.props.onInitCategories();
        this.props.onInitProfile();
        this.props.onInitToDo();
        this.props.onInitLists();
        this.props.onInitSettings();
    }

    render() {
        const {tabs} = this.state;
        const {navigation, theme, hideTabView} = this.props;

        return (
            <React.Fragment>
                {theme ?
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
                                    indicatorStyle={{backgroundColor: theme.headerTextColor}}
                                    style={{
                                        backgroundColor: theme.primaryColor,
                                        height: !!hideTabView ? 0 : 50
                                    }}
                                />
                            }
                            renderLazyPlaceholder={() => <Spinner/>}
                            lazy
                        />
                    </Template> : <Spinner color="#0000ff"/>
                }
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        locale: state.settings.locale,
        hideTabView: state.settings.settings.hideTabView
    }
};
const mapDispatchToProps = dispatch => {
    return {
        onInitToDo: () => dispatch(actions.initToDo()),
        onInitLists: () => dispatch(actions.initLists()),
        onInitCategories: () => dispatch(actions.initCategories()),
        onInitTheme: () => dispatch(actions.initTheme()),
        onInitProfile: () => dispatch(actions.initProfile()),
        onInitSettings: () => dispatch(actions.initSettings()),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(ToDo);