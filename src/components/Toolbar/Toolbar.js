import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { Toolbar } from 'react-native-material-ui';

const toolbar = (props) => (
    <View style={styles.toolbar}>
        <Toolbar
            centerElement={props.title}
            searchable={{
                autoFocus: true,
                placeholder: 'Search',
            }}
            rightElement={{
                menu: {
                    icon: "more-vert",
                    labels: ["item 1", "item 2"]
                }
            }}
            leftElement="menu"
            onRightElementPress={ (label) => { console.log(label) }}
            onLeftElementPress={() => props.toggleDrawer()}
        />
    </View>
);

const styles = StyleSheet.create({
   toolbar: {
       backgroundColor: '#f4511e',
       paddingTop: Platform.OS === 'android' ? 30 : 0
   }
});

export default toolbar;