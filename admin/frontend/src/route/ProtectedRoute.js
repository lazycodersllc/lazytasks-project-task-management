import React, {useEffect, useState} from 'react'
import appConfig from '../configs/app.config'
import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../utils/useAuth'
import {useDispatch, useSelector} from "react-redux";
import {onSignInSuccess, setLoggedInUser, setToken} from "../store/auth/sessionSlice";
import {jwtDecode} from "jwt-decode";
import Cookies from "js-cookie";
import {setUser} from "../store/auth/userSlice";

const { unAuthenticatedEntryPath } = appConfig

const ProtectedRoute = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        if(appLocalizer?.is_admin){
            if(appLocalizer.userResponse.data.token){
                const user_token = appLocalizer.userResponse.data.token
                dispatch(onSignInSuccess(user_token))
                dispatch(setToken(user_token))
                const decode_token = jwtDecode(user_token)
                if(decode_token.iss=== appConfig.liveSiteUrl){

                    const userData = decode_token.data;

                    const user = {
                        "authority" : userData.roles,
                        "loggedUserId" : userData.user_id,
                        "name" : userData.name,
                        "email" : userData.email,
                        "roles" : userData.roles,
                        "llc_roles" : userData.llc_roles,
                        "llc_permissions" : userData.llc_permissions,
                        "avatar" : userData.avatar
                    }
                    dispatch(setLoggedInUser(user || {}))
                    Cookies.set('user_id', userData.user_id);
                    dispatch(
                        setUser(
                            user || {
                                avatar: '',
                                loggedUserId : '',
                                name: '',
                                authority: [],
                                email: '',
                                roles : [],
                                llc_roles : [],
                                llc_permissions : [],
                            }
                        )
                    )
                }
            }

        }


    }, [dispatch]);

    // const admin = JSON.parse(localStorage.getItem('admin'));

    // var data = JSON.parse(admin && admin.auth)

    // var session_data = data && data.session && data.session

    // const authenticated  = session_data && session_data.signedIn ? session_data.signedIn :false;
    const { authenticated } = useAuth()
    const { token, signedIn } = useSelector((state) => state.auth.session)

    if (!authenticated) {
        return <Navigate to={`${unAuthenticatedEntryPath}`} replace />
    }

    return <Outlet />
}

export default ProtectedRoute
