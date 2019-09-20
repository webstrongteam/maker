import React, {Component} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {IconToggle, ListItem} from 'react-native-material-ui';
import {generateDialogObject} from '../../shared/utility';
import Dialog from '../../components/UI/Dialog/Dialog';
import AnimatedView from '../AnimatedView/AnimatedView';
import {empty} from '../../shared/styles';

import {connect} from 'react-redux';
import * as actions from "../../store/actions";

class QuicklyList extends Component {
    state = {
        dialog: {},
        showDialog: false
    };

    showDialog = (list_id) => {
        const dialog = generateDialogObject(
            'Are you sure?',
            'Delete this list?',
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
        const {dialog, showDialog} = this.state;
        const {lists, theme, navigation} = this.props;

        const quicklyList = lists.map((list, index) => {
            // Searching system
            const searchText = this.props.searchText.toLowerCase();
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
                                            onPress={() => this.showDialog(list.id)}
                                            name="delete"
                                            color={theme.actionButtonColor}
                                            size={26}
                                        />
                                    </View>
                                }
                                centerElement={{primaryText: list.name}}
                            />
                        </View>
                    </AnimatedView>
                </View>
            )
        });

        return (
            <View>
                {showDialog &&
                <Dialog
                    showModal={showDialog}
                    title={dialog.title}
                    description={dialog.description}
                    buttons={dialog.buttons}
                />
                }
                {lists && lists.length ?
                    <View style={{paddingTop: 20}}>
                        {quicklyList}
                    </View>
                    : <Text style={[empty, {color: theme.textColor}]}>
                        Quickly list is empty!
                    </Text>
                }
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
        onRemoveList: (list_id) => dispatch(actions.removeList(list_id))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(QuicklyList);