import React from 'react';
import {AdMobBanner} from 'expo-ads-admob';

const bannerAPI = 'ca-app-pub-1606849839773048/6304086761';

export const BannerAd = () => (
    <AdMobBanner
        bannerSize="fullBanner"
        adUnitID={bannerAPI}
        testDeviceID="EMULATOR"/>
);