import React, {Component} from 'react';
import {Animated, ScrollView, StyleSheet, Text, View} from 'react-native';
import {ActionButton, Icon, IconToggle, ListItem, Toolbar} from 'react-native-material-ui';
import {generateDialogObject} from '../../shared/utility';
import Dialog from '../../components/UI/Dialog/Dialog';
import AnimatedView from '../AnimatedView/AnimatedView';
import {content, empty, fullWidth} from '../../shared/styles';
import Spinner from '../../components/UI/Spinner/Spinner';

import {connect} from 'react-redux';
import * as actions from "../../store/actions";

const UP = 1;
const DOWN = -1;

class QuicklyList extends Component {
    state = {
        dialog: {},
        showDialog: false,
        amounts: {},
        searchText: '',

        scroll: 0,
        offset: 0,
        scrollDirection: 0,
        bottomHidden: false,
        loading: true
    };

    componentDidMount() {
        this.reloadListsAmount();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.lists !== this.props.lists) {
            this.reloadListsAmount();
        }
    }

    reloadListsAmount = () => {
        const {lists} = this.props;
        const {amounts} = this.state;
        if (lists.length) {
            lists.map(list => {
                this.props.onInitList(list.id, (tasks) => {
                    amounts[list.id] = tasks.length;
                    this.setState({amounts, loading: false});
                });
            });
        } else {
            this.setState({loading: false});
        }
    };

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

    showDialog = (list_id, list_name) => {
        const dialog = generateDialogObject(
            'Are you sure?',
            `Delete ${list_name} list?`,
            {
                Yes: () => {
                    this.setState({showDialog: false});
                    this.props.onRemoveList(list_id);
                },
                No: () => {
                    this.setState({showDialog: false});
                }
            }
        );
        this.setState({showDialog: true, dialog});
    };

    render() {
        const {dialog, showDialog, amounts, bottomHidden, loading} = this.state;
        const {lists, theme, navigation} = this.props;

        const quicklyList = lists.map((list, index) => {
            // Searching system
            const searchText = this.state.searchText.toLowerCase();
            if (searchText.length > 0 && list.name.toLowerCase().indexOf(searchText) < 0) {
                return null
            }

            return (
                <View key={index}>
                    <AnimatedView value={1} duration={500}>
                        <View style={{marginLeft: 10, marginRight: 10, marginBottom: 10}}>
                            <ListItem
                                divider
                                dense
                                onPress={() => navigation.navigate('QuicklyTaskList', {list: list})}
                                style={{
                                    container: [
                                        styles.shadow,
                                        {backgroundColor: theme.noneColor}
                                    ],
                                    primaryText: {
                                        fontSize: 18,
                                        color: theme.textColor
                                    }
                                }}
                                rightElement={
                                    <View style={styles.rightElements}>
                                        <IconToggle
                                            onPress={() => this.showDialog(list.id, list.name)}
                                            name="delete"
                                            color={theme.actionButtonColor}
                                            size={26}
                                        />
                                    </View>
                                }
                                centerElement={{
                                    primaryText: list.name,
                                    secondaryText: `Total tasks: ${amounts[list.id]}`
                                }}
                            />
                        </View>
                    </AnimatedView>
                </View>
            )
        });

        return (
            <View style={content}>
                <Toolbar
                    searchable={{
                        autoFocus: true,
                        placeholder: 'Search',
                        onChangeText: value => this.setState({searchText: value}),
                        onSearchClosed: () => this.setState({searchText: ''}),
                    }}
                    leftElement="menu"
                    centerElement="Quickly lists"
                    onLeftElementPress={() => navigation.navigate('Drawer')}
                />

                {showDialog &&
                <Dialog
                    showModal={showDialog}
                    title={dialog.title}
                    description={dialog.description}
                    buttons={dialog.buttons}
                />
                }

                {!loading ?
                    <ScrollView
                        keyboardShouldPersistTaps="always"
                        keyboardDismissMode="interactive"
                        onScroll={this.onScroll}
                        style={fullWidth}>
                        {lists && lists.length ?
                            <View style={{paddingTop: 20}}>
                                {quicklyList}
                            </View>
                            : <Text style={[empty, {color: theme.textColor}]}>
                                Quickly lists is empty!
                            </Text>
                        }
                    </ScrollView> : <Spinner/>
                }

                <View style={{marginBottom: -40}}>
                    <ActionButton
                        hidden={bottomHidden}
                        onPress={() => navigation.navigate('QuicklyTaskList', {list: false})}
                        icon="add"
                        style={{
                            container: {backgroundColor: theme.actionButtonColor},
                            icon: {color: theme.actionButtonIconColor}
                        }}
                    />
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
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
        theme: state.theme.theme,
        settings: state.settings,
        lists: state.lists.lists
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        onInitList: (id, callback) => dispatch(actions.initList(id, callback)),
        onRemoveList: (list_id) => dispatch(actions.removeList(list_id))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(QuicklyList);