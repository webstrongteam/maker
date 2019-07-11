import React, {PureComponent} from 'react';
import {View, ScrollView, TouchableOpacity} from 'react-native';
import {Toolbar, IconToggle, Icon, ListItem} from 'react-native-material-ui';
import {container, fullWidth} from '../../shared/styles';
import ConfigCategory from '../ConfigCategory/ConfigCategory';
import Template from '../Template/Template';
import {BannerAd} from '../../../adsAPI';

import { connect } from 'react-redux';
import * as actions from "../../store/actions";

class CategoriesList extends PureComponent {
    state = {
        showModal: false,
        selectedCategory: {id: false, name: ''}
    };

    toggleModalHandler = (selected) => {
        const { showModal } = this.state;
        if (selected) {
            this.setState({
                showModal: !showModal,
                selectedCategory: selected
            });
        }
        else {
            this.props.onInitCategories();
            this.setState({
                showModal: !showModal,
                selectedCategory: {id: false, name: ''}
            });
        }
    };

    render() {
        const {showModal, selectedCategory} = this.state;
        const {categories, navigation, theme, tasks} = this.props;

        return (
            <Template>
                <Toolbar
                    leftElement="arrow-back"
                    rightElement={
                        <IconToggle
                            color={theme.headerTextColor}
                            onPress={() => this.toggleModalHandler(false)} name="add" />
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
                <View style={container}>
                    <ScrollView style={[fullWidth, {backgroundColor: theme.primaryBackgroundColor}]}>
                        {categories.map(cate => (
                            <ListItem
                                divider
                                dense
                                key={cate.id}
                                onPress={() => {
                                    this.toggleModalHandler(cate);
                                }}
                                leftElement={
                                    <TouchableOpacity onPress={() => {
                                        this.toggleModalHandler(cate);
                                    }}>
                                        <Icon name="edit" />
                                    </TouchableOpacity>
                                }
                                rightElement={
                                    cate.id !== 0 ?
                                        <IconToggle onPress={() => this.props.onRemoveCategory(cate.id)} name="remove" /> : null
                                }
                                centerElement={{
                                    primaryText:
                                        `${cate.name} (${tasks.filter(task => task.category === cate.name).length})`,
                                }}
                            />
                        ))}
                    </ScrollView>
                </View>
                <BannerAd />
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
        onInitCategories: () => dispatch(actions.initCategories()),
        onRemoveCategory: (id) => dispatch(actions.removeCategory(id)),
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoriesList);