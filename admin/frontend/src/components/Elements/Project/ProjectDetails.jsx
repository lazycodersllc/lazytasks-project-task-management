import React, {Fragment, useEffect, useState} from 'react';
import {Button, Container, LoadingOverlay, ScrollArea} from '@mantine/core';
import Header from '../../Header';
import ProjectDetailsNav from './ProjectDetailsNav';
import ProjectDetailsList from './ProjectDetailsList';
import ProjectDetailsBorad from './ProjectDetailsBorad';
import {useLocation, useParams} from 'react-router-dom';
import {useDispatch, useSelector} from "react-redux";
import {fetchTasksByProject, updateIsLoading} from "../../Settings/store/taskSlice";
import {fetchAllTags} from "../../Settings/store/tagSlice";
import ProjectDetailsCalendar from "./ProjectDetailsCalendar";
import {fetchTasksByUser, updateColumns} from "../../Settings/store/myTaskSlice";
const ProjectDetails = () => { 
    const location = useLocation();
    const dispatch = useDispatch();
    const {id}= useParams();

    const { isLoading } = useSelector((state) => state.settings.task);

    useEffect(() => {
        dispatch(fetchTasksByProject({id:id})).then((response) => {

            if (response.payload.state === 200){
                dispatch(updateIsLoading( false ))
            }
        });
        dispatch(fetchAllTags())
    }, [dispatch]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if ( isLoading === true ) {
                    await dispatch(fetchTasksByProject({id:id})).then((response) => {

                        if (response.payload.state === 200){
                            dispatch(updateIsLoading( false ))
                        }
                    });
                }
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                dispatch(updateIsLoading( false ))
            }
        };
        fetchData();
    }, [ isLoading ]);

    const listPagePathName = `/project/task/list/${id}`;
    const boardPagePathName = `/project/task/board/${id}`;
    const calendarPagePathName = `/project/task/calendar/${id}`;

    useEffect(() => {
        dispatch(updateIsLoading( true ))

        setTimeout(() => {
            dispatch(updateIsLoading( false ))
        }, 1000);
    }, [location.pathname]);

    return (
        <Fragment>
            {/*<Header /> */}
            <div className='dashboard'> 
                <Container size="full">
                    <div className="settings-page-card bg-white rounded-xl p-6 pt-3 my-5 mb-0">
                        <ProjectDetailsNav />
                        {location.pathname === listPagePathName && <ProjectDetailsList />}
                        {location.pathname === boardPagePathName && <ProjectDetailsBorad />}
                        {location.pathname === calendarPagePathName && <ProjectDetailsCalendar />}
                    </div>
                </Container>
            </div>   
        </Fragment>
        
    );
}

export default ProjectDetails;
