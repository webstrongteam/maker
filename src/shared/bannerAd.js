import React from 'react';
import {AdMobBanner} from 'expo-ads-admob';
import {bannerAPI} from '../API/bannerAPI';

export const BannerAd = () => (
    <AdMobBanner
        bannerSize="fullBanner"
        adUnitID={bannerAPI}
        testDeviceID="EMULATOR"/>
);