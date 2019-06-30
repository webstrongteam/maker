import React, { Component } from 'react';
import {Drawer, Toolbar} from 'react-native-material-ui';
import Template from '../Template/Template';
import { connect } from 'react-redux';

class DrawerContainer extends Component {
    render() {
        const {navigation, theme} = this.props;

        return (
            <Template>
                <Toolbar
                    leftElement="arrow-back"
                    onLeftElementPress={() => navigation.goBack()}
                    centerElement="Back"
                />
                <Drawer style={{ container: { backgroundColor: theme.primaryBackgroundColor } }}>
                    <Drawer.Section
                        divider
                        style={{ container: { backgroundColor: theme.primaryBackgroundColor } }}
                        items={[
                            {icon: 'bookmark-border', value: 'Categories', onPress: () => navigation.navigate('CategoriesList')},
                            {icon: 'people', value: 'Profile', onPress: () => navigation.navigate('Profile')},
                        ]}
                    />
                    <Drawer.Section
                        title="App"
                        style={{ container: { backgroundColor: theme.primaryBackgroundColor } }}
                        items={[
                            {icon: 'assessment', value: 'Themes', onPress: () => navigation.navigate('Themes')},
                            {icon: 'settings', value: 'Settings', onPress: () => navigation.navigate('Settings')},
                            {icon: 'info', value: 'About Maker'}
                        ]}
                    />
                </Drawer>
            </Template>
        )
    }
}

const mapStateToProps = state => {
    return {theme: state.theme.theme}
};

export default connect(mapStateToProps)(DrawerContainer);