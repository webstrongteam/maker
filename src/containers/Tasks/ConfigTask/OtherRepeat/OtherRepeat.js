import React, {Component} from "react";
import {Platform} from 'react-native';
import RepeatTime from "./RepeatTime";
import RepeatDays from "./RepeatDays";
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import Spinner from "../../../../components/UI/Spinner/Spinner";
import Modal from "react-native-modalbox";

import {connect} from "react-redux";

class OtherRepeat extends Component {
    state = {
        tabs: {
            index: 0,
            routes: [
                {key: 'time', title: this.props.translations.repeatTime},
                {key: 'days', title: this.props.translations.repeatDay}
            ]
        }
    };

    saveHandler = (repeat, selectedTime) => {
        this.props.save(repeat, selectedTime);
    };

    render() {
        const {tabs} = this.state;
        const {showModal, usingTime, repeat, selectedTime, theme} = this.props;

        return (
            <React.Fragment>
                <Modal
                    coverScreen={true}
                    style={{
                        marginTop: Platform.OS === 'ios' ? 20 : 0,
                        backgroundColor: theme.secondaryBackgroundColor
                    }}
                    isOpen={showModal}
                    swipeToClose={showModal}
                    onClosed={() => this.props.cancel()}>

                    <TabView
                        navigationState={tabs}
                        tabStyle={{backgroundColor: theme.primaryColor}}
                        onIndexChange={index => {
                            tabs.index = index;
                            this.setState({tabs});
                        }}
                        renderScene={SceneMap({
                            time: () => (
                                <>
                                    <RepeatTime
                                        save={this.saveHandler}
                                        close={this.props.cancel}
                                        usingTime={usingTime} repeat={repeat}
                                        selectedTime={selectedTime}/>
                                </>
                            ),
                            days: () => (
                                <>
                                    <RepeatDays
                                        save={this.saveHandler}
                                        close={this.props.cancel}
                                        repeat={repeat}
                                        selectedTime={selectedTime}/>
                                </>
                            )
                        })}
                        renderTabBar={(props) =>
                            <TabBar
                                {...props}
                                onTabPress={({route}) => {
                                    props.jumpTo(route.key);
                                }}
                                indicatorStyle={{backgroundColor: theme.primaryTextColor}}
                                style={{backgroundColor: theme.primaryColor}}
                            />
                        }
                        renderLazyPlaceholder={() => <Spinner/>}
                        lazy
                    />
                </Modal>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        theme: state.theme.theme,
        translations: {
            ...state.settings.translations.OtherRepeat
        }
    }
};

export default connect(mapStateToProps)(OtherRepeat);