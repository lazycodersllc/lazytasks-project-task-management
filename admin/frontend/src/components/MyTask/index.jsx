import React, {Fragment, useEffect, useState} from 'react';
import {
    ActionIcon,
    Button,
    Container,
    Grid,
    Group,
    LoadingOverlay,
    ScrollArea,
    Tabs,
    TextInput,
    Title
} from '@mantine/core';
import {useDispatch, useSelector} from "react-redux";
import {fetchAllTags} from "../Settings/store/tagSlice";
import MyTaskList from "./MyTaskList";
import {fetchTasksByUser, setLoggedInUserId, updateColumns} from "../Settings/store/myTaskSlice";
import QuickTaskList from "./QuickTaskList";
import {fetchQuickTasksByUser} from "../Settings/store/quickTaskSlice";
import {IconMessageCircle, IconPhoto, IconRefresh, IconSearch, IconSettings} from "@tabler/icons-react";
import {updateIsLoading} from "../Settings/store/taskSlice";

const MyTask = () => {

    const dispatch = useDispatch();
    const {loggedUserId} = useSelector((state) => state.auth.user)

    useEffect(() => {
        setTimeout(() => {
            if( loggedUserId ){
                dispatch(fetchTasksByUser({id:loggedUserId})).then((response) => {
                dispatch(updateColumns(response.payload.data && response.payload.data.tasks ? response.payload.data.tasks : {}))
                })
                dispatch(fetchQuickTasksByUser({id:loggedUserId}))
                dispatch(fetchAllTags())
                dispatch(setLoggedInUserId(loggedUserId))
            }
        }, 500);
    }, [ dispatch, loggedUserId ]);
    const handleRefresh = () => {
        dispatch(updateIsLoading( true ))
    }

    const searchHandler = (e) => {

        const searchValue = e.target.value;
        dispatch(fetchTasksByUser({id:loggedUserId, data:{search: searchValue}})).then((response) => {
            dispatch(updateColumns(response.payload.data && response.payload.data.tasks ? response.payload.data.tasks : {}))
        })

    }

    return (
        <Fragment>
            {/*<Header />*/}
            
            <div className='dashboard'>
                <Container size="full">
                    <div className="settings-page-card bg-white rounded-xl p-6 pt-3 my-5 mb-0">

                        <Grid columns={12}>
                            <Grid.Col span={9}>
                                <div className='mt-2 mb-3 d-flex justify-between'>
                                    <Grid  align="center">
                                        <Grid.Col span={`auto`}>
                                            <Title order={5}>My Tasks</Title>
                                        </Grid.Col>
                                        <Grid.Col span={4}>
                                            <TextInput
                                                rightSectionPointerEvents="none"
                                                rightSection={<IconSearch size={24} />}
                                                onChange={(e) => { searchHandler(e) } }
                                                placeholder="Search..." />
                                        </Grid.Col>
                                        <Grid.Col span={`content`} className="flex justify-end align-middle">
                                            <ActionIcon onClick={()=> handleRefresh()} variant="white" color="yellow" radius="xs" aria-label="Refresh">
                                                <IconRefresh size={24} stroke={1.5} />
                                                {/*<IconAdjustments style={{ width: '70%', height: '70%' }} stroke={1.5} />*/}
                                            </ActionIcon>
                                        </Grid.Col>
                                    </Grid>

                                </div>
                                <div className="w-full bg-white">
                                    {/*<LoadingOverlay
                                        visible={refresh}
                                        zIndex={1000}
                                        overlayProps={{ radius: 'sm', blur: 4 }}
                                    />*/}
                                    <MyTaskList/>
                                </div>

                            </Grid.Col>
                            <Grid.Col span={3} className="mt-1">
                                <QuickTaskList/>
                            </Grid.Col>
                        </Grid>
                    </div>
                </Container>
            </div>

        </Fragment>

    );
}

export default MyTask;
