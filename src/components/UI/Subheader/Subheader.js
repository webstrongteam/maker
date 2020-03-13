import React from 'react';
import {Subheader} from 'react-native-material-ui';

import {connect} from "react-redux";

const subheader = (props) => (
    <Subheader text={props.text}
               style={{
                   container: {
                       width: '100%',
                       paddingLeft: 10
                   },
                   text: {color: props.theme.primaryColor}
               }}
    />
);

const mapStateToProps = state => {
    return {theme: state.theme.theme}
};

export default connect(mapStateToProps)(subheader);