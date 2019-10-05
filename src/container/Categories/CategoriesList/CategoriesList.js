import React, {PureComponent} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {Icon, IconToggle, ListItem, Toolbar} from 'react-native-material-ui';
import {container, fullWidth} from '../../../shared/styles';
import ConfigCategory from '../ConfigCategory/ConfigCategory';
import Template from '../../Template/Template';
import {BannerAd} from '../../../../adsAPI';

import {connect} from 'react-redux';
import * as actions from "../../../store/actions";

class CategoriesList extends PureComponent {
    state = {
        showModal: false,
        taskPerCategory: {},
        selectedCategory: {id: false, name: ''},
        ready: false
    };

    componentDidMount() {
        const {tasks} = this.props;
        const taskPerCategory = this.state.taskPerCategory;

        tasks.map(task => {
            if (!taskPerCategory[task.category]) taskPerCategory[task.category] = 1;
            else taskPerCategory[task.category]++;
        });

        this.setState({taskPerCategory, ready: true});
    }

    toggleModalHandler = (selected = false) => {
        const {showModal} = this.state;
        if (selected !== false) {
            this.setState({
                showModal: !showModal,
                selectedCategory: selected
            });
        } else {
            this.setState({
                showModal: !showModal,
                selectedCategory: false
            });
        }
    };

    render() {
        const {showModal, selectedCategory, taskPerCategory, ready} = this.state;
        const {categories, navigation, theme} = this.props;

        return (
            <Template>
                <Toolbar
                    leftElement="arrow-back"
                    rightElement={
                        <IconToggle
                            color={theme.headerTextColor}
                            onPress={() => this.toggleModalHandler()} name="add"/>
                    }
                    onLeftElementPress={() => {
                        navigation.goBack();
                    }}
                    centerElement='Categories'
                />
                {showModal &&
                <ConfigCategory
                    showModal={showModal}
                    category={selectedCategory}
                    toggleModal={this.toggleModalHandler}
                />
                }
                {ready &&
                <View style={container}>
                    <ScrollView style={[fullWidth, {backgroundColor: theme.primaryBackgroundColor}]}>
                        {categories.map(cate => (
                            <ListItem
                                divider
                                dense
                                key={cate.id}
                                onPress={() => {
                                    this.toggleModalHandler(cate.id);
                                }}
                                leftElement={
                                    <TouchableOpacity onPress={() => this.toggleModalHandler(cate.id)}>
                                        <Icon name="edit"/>
                                    </TouchableOpacity>
                                }
                                rightElement={
                                    cate.id !== 0 ?
                                        <IconToggle onPress={() => this.props.onRemoveCategory(cate.id)}
                                                    name="remove"/> : null
                                }
                                centerElement={{
                                    primaryText:
                                        `${cate.name} (${taskPerCategory[cate.name] ? taskPerCategory[cate.name] : 0})`,
                                }}
                            />
                        ))}
                    </ScrollView>
                </View>
                }
                <BannerAd/>
            </Template>
        )
    }
}

const mapStateToProps = state => {
    return {
        tasks: state.tasks.tasks,
        categories: state.categories.categories,
        theme: state.theme.theme
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onRemoveCategory: (id) => dispatch(actions.removeCategory(id)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoriesList);