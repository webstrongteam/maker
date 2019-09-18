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
        showDialog: false,
        selectedList: false
    };

    showDialog = (action) => {
        let dialog;
        if (action === 'delete') {
            dialog = generateDialogObject(
                'Are you sure?',
                'Delete this list?',
                {
                    Yes: () => {
                        this.setState({showDialog: false});
                        this.props.onQuicklyList(this.state.selectedList);
                    },
                    No: () => {
                        this.setState({showDialog: false});
                    }
                }
            );
        }
        this.setState({showDialog: true, dialog});
    };

    render() {
        const {dialog, showDialog} = this.state;
        const {lists, theme, navigation} = this.props;

        const quicklyList = lists.map((list, index) => {
            // Searching system
            const searchText = this.props.searchText.toLowerCase();
            if (searchText.length > 0 && list.name.toLowerCase().indexOf(searchText) < 0) {
                if (list.description.toLowerCase().indexOf(searchText) < 0) {
                    if (list.category.toLowerCase().indexOf(searchText) < 0) {
                        return null;
                    }
                }
            }

            return (
                <View key={index}>
                    <AnimatedView value={1} duration={500}>
                        <View style={{marginLeft: 10, marginRight: 10, marginBottom: 10}}>
                            <ListItem
                                divider
                                dense
                                onPress={() => navigation.navigate('QuicklyTaskList', {list: list.id})}
                                style={{
                                    container: [
                                        styles.shadow,
                                        {bgColor: this.props.theme.noneColor, color: this.props.theme.noneTextColor}
                                    ],
                                    primaryText: {
                                        fontSize: 18,
                                        color: theme.textColor
                                    }
                                }}
                                rightElement={
                                    <View style={styles.rightElements}>
                                        <IconToggle
                                            onPress={() => this.showDialog('delete')}
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
                    <View style={{paddingBottom: 20}}>
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
        settings: state.settings
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        onRemoveQuicklyList: (list) => dispatch(actions.removeQuicklyList(list))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(QuicklyList);