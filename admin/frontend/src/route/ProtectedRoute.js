import React, {useEffect, useState} from 'react'
import appConfig from '../configs/app.config'
import { Navigate, Outlet } from 'react-router-dom'
import useAuth from '../utils/useAuth'
import {useSelector} from "react-redux";

const { unAuthenticatedEntryPath } = appConfig

const ProtectedRoute = () => {

    const admin = JSON.parse(localStorage.getItem('admin'));

    var data = JSON.parse(admin && admin.auth)

    var session_data = data && data.session && data.session

    const authenticated  = session_data && session_data.signedIn ? session_data.signedIn :false;
    console.log(authenticated)

    if (!authenticated) {
        return <Navigate to={`${unAuthenticatedEntryPath}`} replace />
    }

    return <Outlet />
}

export default ProtectedRoute
