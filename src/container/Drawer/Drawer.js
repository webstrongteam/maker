import React, { Component } from 'react';
import {Drawer, Toolbar} from 'react-native-material-ui';
import Template from '../Template/Template';

// Redux
/*import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';*/

class DrawerContainer extends Component {
    categoriesListHandler = () => {
        this.props.navigation.navigate('CategoriesList');
    };

    render() {
        const {navigation} = this.props;

        return (
            <Template>
                <Toolbar
                    leftElement="arrow-back"
                    onLeftElementPress={() => navigation.goBack()}
                    centerElement="Back"
                />
                <Drawer>
                    <Drawer.Section
                        divider
                        items={[
                            {icon: 'bookmark-border', value: 'Edit categories', onPress: () => this.categoriesListHandler()},
                            {icon: 'people', value: 'Account'},
                        ]}
                    />
                    <Drawer.Section
                        title="App"
                        items={[
                            {icon: 'info', value: 'About Maker'},
                            {icon: 'settings', value: 'Settings'},
                            {icon: 'input', value: 'Logout'},
                        ]}
                    />
                </Drawer>
            </Template>
        )
    }
}

export default DrawerContainer;