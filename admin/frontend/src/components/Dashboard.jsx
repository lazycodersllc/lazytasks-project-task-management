import React, {Fragment, useEffect, useState} from 'react';
import {Button, Container, Grid, Modal, ScrollArea, Tabs, Title} from '@mantine/core';
import {useDispatch, useSelector} from "react-redux";
import {fetchTasksByUser} from "./Settings/store/myTaskSlice";
import {fetchQuickTasksByUser} from "./Settings/store/quickTaskSlice";
import QuickTaskList from "./Dashboard/QuickTaskList";
import DashboardBarChart from "./Dashboard/DashboardBarChart";
import ProjectSummery from "./Dashboard/ProjectSummery";
import TaskListTabs from "./Dashboard/TaskListTabs";
import {fatchLazytasksConfig} from "./Settings/store/settingSlice";
import Onboarding from "./Onboarding/Onboarding";

const Dashboard = () => {

    const dispatch = useDispatch();
    const {token} = useSelector((state) => state.auth.session);
    const {loggedUserId} = useSelector((state) => state.auth.user)
    const {lazytasksConfig} = useSelector((state) => state.settings.setting);

    const [ config, setConfig ] = useState(lazytasksConfig);


    useEffect(() => {
        const fetchData = async () => {
            try {
                if(loggedUserId){
                    await dispatch(fetchTasksByUser({id:loggedUserId}))
                    await dispatch(fetchQuickTasksByUser({id:loggedUserId}))
                }

                await dispatch(fatchLazytasksConfig()).then((response) => {
                    if (response.payload.status === 200){
                        setConfig(response.payload.data)
                    }
                });

            } catch (err) {
                console.error("Unexpected error:", err);
            }
        };
        fetchData();
    }, [ dispatch, loggedUserId ]);

    return (
        <Fragment>
            {/*<Header /> */}
            
            <div className='dashboard'>
                <Container size="full">
                    <div className="settings-page-card bg-white rounded-xl p-5 pt-3 mt-5 mb-5">
                        <div className='mt-2 mb-3'>
                            {/*<h3 className="text-2xl font-semibold text-red-500 mb-4">Dashboard Content</h3>*/}
                            <Title order={4}>Dashboard</Title>
                        </div>
                        <ScrollArea scrollbars="y" className="w-full h-[calc(100vh-186px)] px-2" scrollbarSize={4}>
                            <Grid className="mb-5" columns={12}>
                                <Grid.Col span={3}>
                                    <QuickTaskList/>
                                </Grid.Col>
                                <Grid.Col span={3}>
                                    <ProjectSummery/>
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <DashboardBarChart/>
                                </Grid.Col>
                            </Grid>
                            <Grid columns={12}>
                                <Grid.Col span={6}>
                                    <TaskListTabs />
                                </Grid.Col>
                            </Grid>
                        </ScrollArea>
                    </div>
                </Container>

                <Modal
                    opened={config?.lazytasks_basic_info_guide_modal && appLocalizer?.is_admin }
                    onClose={()=> setConfig({...config, lazytasks_basic_info_guide_modal: false})}
                    title=""
                    size="auto"
                    // scrollAreaComponent={ScrollArea.Autosize}
                    withCloseButton={false}
                    closeOnClickOutside={false}
                    centered
                >
                    <Onboarding />
                </Modal>
            </div>

            {/* <Footer /> */}
        </Fragment>

);
}

export default Dashboard;
