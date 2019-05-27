import React, { Component } from 'react';
import { Drawer } from 'react-native-material-ui';

// Redux
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

class DrawerContainer extends Component {
    static navigationOptions =  {
        title: 'Menu',
    };

    logoutHandler = () => {
        this.props.onLogout();
        this.props.navigation.navigate('Auth');
    };

    render() {
        return (
            <Drawer>
                <Drawer.Section
                    divider
                    items={[
                        {icon: 'bookmark-border', value: 'Notifications'},
                        {icon: 'today', value: 'Calendar', active: true},
                        {icon: 'people', value: 'Clients'},
                    ]}
                />
                <Drawer.Section
                    title="Personal"
                    items={[
                        {icon: 'info', value: 'Info'},
                        {icon: 'settings', value: 'Settings'},
                        {icon: 'input', value: 'Logout', onPress: () => this.logoutHandler()},
                    ]}
                />
            </Drawer>
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onLogout: () => dispatch(actions.logout())
    };
};

export default connect(null, mapDispatchToProps)(DrawerContainer);