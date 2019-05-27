import * as actionTypes from './actionTypes';
import {AsyncStorage} from 'react-native';
import {API_KEY} from '../apiKey';
import axios from 'axios';

export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    };
};

export const authSuccess = (token, userId, isAdmin) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        idToken: token,
        userId: userId,
        isAdmin: isAdmin
    };
};

export const logout = () => {
    AsyncStorage.removeItem('token');
    AsyncStorage.removeItem('userId');
    AsyncStorage.removeItem('isAdmin');
    return {
        type: actionTypes.AUTH_LOGOUT
    };
};

export const authFail = (error) => {
    return {
        type: actionTypes.AUTH_FAIL,
        error: error
    };
};

export const auth = (email, password, isSignUp) => {
    return dispatch => {
        dispatch(authStart());
        const authData = {
            email: email,
            password: password,
            returnSecureToken: true
        };

        let url = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/signupNewUser?key=${API_KEY}`;
        if (!isSignUp) {
            url = `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${API_KEY}`;
        }

        axios.post(url, authData)
            .then(res => {
                let isAdmin = false;
                if (res.data.localId === "JNxwHszV0sZXaaMfrHx8qK9SbKn1") {
                    isAdmin = true;
                }
                AsyncStorage.setItem('token', res.data.idToken);
                AsyncStorage.setItem('userId', res.data.localId);
                AsyncStorage.setItem('isAdmin', isAdmin);
                dispatch(authSuccess(res.data.idToken, res.data.localId, isAdmin));
            })
            .catch(err => {
                dispatch(authFail(err.response.data.error));
            })
    };
};

export const authCheckState = () => {
    return dispatch => {
        const token = AsyncStorage.getItem('token');
        if(!token) {
            dispatch(logout());
        } else {
            const userId = AsyncStorage.getItem('userId');
            const isAdmin = AsyncStorage.getItem('isAdmin') === "true";
            dispatch(authSuccess(token, userId, isAdmin));
        }
    };
};