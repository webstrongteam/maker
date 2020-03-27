import React, {Component} from 'react';
import {View} from 'react-native';
import {IconToggle} from 'react-native-material-ui'
import {TextField} from 'react-native-material-textfield';
import {valid} from "../../../shared/utility";
import styles from './Input.styles';

import {connect} from 'react-redux';

class Input extends Component {
    state = {
        control: {},
        loading: true
    };

    componentDidMount() {
        const {elementConfig} = this.props;
        this.setState({control: elementConfig, loading: false}, () => {
            this.checkValid(this.props.value, true);
        });
    }

    checkValid = (value = this.props.value, initial = false) => {
        const {control} = this.state;
        if (initial && control.required &&
            (value === '' || value === null || value === undefined)) {
            // Initial valid without label
            control.error = true;
            this.props.changed('', control);
            this.setState({control});
        } else {
            const {translations} = this.props;
            valid(control, value, translations, (newControl) => {
                this.props.changed(value, newControl);
                this.setState({control: newControl});
            })
        }
    };

    render() {
        const {control, loading} = this.state;
        const {style, theme, focus, value} = this.props;

        return (
            !loading &&
            <View style={styles.container}>
                <View style={{flex: 1}}>
                    <TextField
                        {...control}
                        style={{marginRight: 25, ...style}}
                        textColor={theme.thirdTextColor}
                        baseColor={theme.thirdTextColor}
                        tintColor={theme.primaryColor}
                        errorColor={control.error === true ? theme.thirdTextColor : theme.warningColor}
                        autoFocus={focus ? focus : false}
                        onChangeText={(val) => this.checkValid(val)}
                        value={value}
                    />
                </View>
                {value !== '' &&
                <View style={{marginLeft: -30, marginRight: -10, marginTop: 5}}>
                    <IconToggle
                        onPress={() => this.checkValid('')}
                        name="clear"
                        size={18}
                    />
                </View>
                }
            </View>
        )
    }
}

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        translations: {
            ...state.settings.translations.validation
        }
    }
};

export default connect(mapStateToProps)(Input);