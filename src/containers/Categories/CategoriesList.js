import React, {PureComponent} from 'react';
import {ScrollView, View} from 'react-native';
import {IconToggle, ListItem, Toolbar} from 'react-native-material-ui';
import {container, listRow, listContainer, shadow} from '../../shared/styles';
import {width} from '../../shared/utility';
import ConfigCategory from './ConfigCategory/ConfigCategory';
import Template from '../Template/Template';
import {BannerAd} from '../../../adsAPI';

import {connect} from 'react-redux';
import * as actions from "../../store/actions";

class CategoriesList extends PureComponent {
    state = {
        showModal: false,
        taskPerCategory: {},
        selectedCategory: false,
        ready: false
    };

    componentDidMount() {
        const {tasks} = this.props;
        const taskPerCategory = this.state.taskPerCategory;

        tasks.map(task => {
            if (!taskPerCategory[task.category.id]) taskPerCategory[task.category.id] = 1;
            else taskPerCategory[task.category.id]++;
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
        const {categories, navigation, theme, translations} = this.props;

        return (
            <Template bgColor={theme.secondaryBackgroundColor}>
                <Toolbar
                    leftElement="arrow-back"
                    rightElement={
                        <IconToggle
                            color={theme.primaryTextColor}
                            onPress={() => this.toggleModalHandler()} name="add"/>
                    }
                    onLeftElementPress={() => navigation.goBack()}
                    centerElement={translations.title}
                />

                <ConfigCategory
                    showModal={showModal}
                    category={selectedCategory}
                    toggleModal={this.toggleModalHandler}
                />

                {ready &&
                <View style={container}>
                    <ScrollView>
                        {categories.map(cate => (
                            <ListItem
                                key={cate.id}
                                style={{
                                    container: {
                                        ...shadow, ...listRow,
                                        width: width - 20,
                                        backgroundColor: theme.primaryBackgroundColor
                                    }
                                }}
                                rightElement={
                                    cate.id !== 0 ?
                                        <IconToggle
                                            onPress={() => this.props.onRemoveCategory(cate.id)}
                                            name="delete"
                                            color={theme.warningColor}
                                        /> : null
                                }
                                centerElement={{
                                    primaryText:
                                        `${cate.name} (${taskPerCategory[cate.id] ? taskPerCategory[cate.id] : 0})`,
                                }}
                                onPress={() => this.toggleModalHandler(cate.id)}
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
        theme: state.theme.theme,
        translations: state.settings.translations.Categories
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onRemoveCategory: (id) => dispatch(actions.removeCategory(id))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(CategoriesList);