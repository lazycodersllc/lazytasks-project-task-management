import React, {Fragment, useEffect} from 'react';
import {Button, Container, Grid, ScrollArea, Text} from '@mantine/core';
import Header from '../Header'; 
import SettingsNav from './SettingsNav'; 
import ProjectCard from '../Elements/ProjectCard'; 
import CreateProjectModal from '../Elements/Modal/Project/CreateProjectModal'; 

import { setProject } from '../../reducers/projectSlice'; // Import the action creator 
import { useSelector, useDispatch } from 'react-redux'; 
// Import the project data from the JSON file
import projectJson from '../Data/projectsData.json';
import {fetchAllProjects} from "./store/projectSlice";


const Projects = () => {

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchAllProjects());
    }, [dispatch]);

    const {projects} = useSelector((state) => state.settings.project);


  return (
    <Fragment>
      <Header /> 
      <div className='dashboard'> 
        <Container size="full">
          <div className="settings-page-card bg-white rounded-xl p-6 pt-3 my-5 mb-0">
            <SettingsNav />
            <ScrollArea className="h-[calc(100vh-300px)] pb-[2px]" scrollbarSize={4}>
              <Grid gutter={{base: 20}} overflow="hidden" align="stretch" spacing="sm" verticalSpacing="sm">
                  <Grid.Col  span={{ base: 12, xs:6, sm:4, md: 3, lg: 3 }}>
                      <CreateProjectModal buttonStyle="a" />
                  </Grid.Col>
                  {Array.isArray(projects) &&
                      projects && projects.length>0 && projects.map((project, index) => (
                      <Grid.Col key={index} span={{ base: 12, xs:6, sm:4, md: 3, lg: 3 }}>
                          <ProjectCard key={index}  {...project} />
                      </Grid.Col>
                  ))}
              </Grid>
            </ScrollArea>

          </div>
        </Container>
      </div>
    </Fragment>
  );
}

export default Projects;
