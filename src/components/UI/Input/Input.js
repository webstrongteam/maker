import React, {Component} from 'react';
import {View} from 'react-native';
import {IconToggle} from 'react-native-material-ui'
import {TextField} from 'react-native-material-textfield';
import {fullWidth} from '../../../shared/styles';
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
        this.setState({control: elementConfig, loading: false});
    }

    checkValid = (value = this.props.value) => {
        const {translations} = this.props;
        const {control} = this.state;
        valid(control, value, translations, (newControl) => {
            this.props.changed(value, newControl);
            this.setState({control: newControl});
        })
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
                        style={style ? style : fullWidth}
                        textColor={theme.textColor}
                        baseColor={theme.textColor}
                        tintColor={theme.primaryColor}
                        autoFocus={focus ? focus : false}
                        onChangeText={(val) => this.checkValid(val)}
                        value={value}
                    />
                </View>
                {value !== '' &&
                <View style={{marginLeft: -30, marginRight: -10}}>
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