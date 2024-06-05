import React, {useEffect} from 'react';
import {Container, Grid, ScrollArea} from '@mantine/core';
import Header from '../Header'; 
import SettingsNav from './SettingsNav'; 
import CreateWorkspaceModal from '../Elements/Modal/Workspace/CreateWorkspaceModal'; 
import {useDispatch, useSelector} from "react-redux";
import {fetchAllCompanies} from "./store/companySlice";
import WorkspaceCard from "../Elements/WorkspaceCard";
const Workspace = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchAllCompanies());
    }, [dispatch]);

    const {companies} = useSelector((state) => state.settings.company);
    
    return (
        <>
            <Header />
            <div className='dashboard'>
                <Container size="full">
                    <div className="settings-page-card bg-white rounded-xl p-6 pt-3 my-5 mb-0">
                        <SettingsNav />
                        <ScrollArea className="h-[calc(100vh-300px)] pb-[2px]" scrollbarSize={4}>
                            <Grid gutter={{base: 20}} overflow="hidden" align="stretch" spacing="sm" verticalSpacing="sm">
                                <Grid.Col  span={{ base: 12, xs:6, sm:4, md: 3, lg: 3 }}>
                                    <CreateWorkspaceModal />
                                </Grid.Col>
                                {Array.isArray(companies) &&
                                    companies && companies.length>0 && companies.map((workspace, index) => (
                                        <Grid.Col key={index} span={{ base: 12, xs:6, sm:4, md: 3, lg: 3 }}>
                                            <WorkspaceCard key={index} {...workspace} />
                                        </Grid.Col>
                                    ))
                                }
                            </Grid>
                        </ScrollArea>
                    </div>
                </Container>
            </div>   
        </>
    );
}

export default Workspace;
