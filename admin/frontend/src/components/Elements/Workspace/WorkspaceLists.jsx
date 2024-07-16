import React, { useEffect, useMemo } from 'react';
import { Accordion, ScrollArea } from '@mantine/core';
import WorkspaceModal from '../Modal/Workspace/WorkspaceModal';
import { useSelector, useDispatch } from 'react-redux';
import {fetchAllCompanies} from "../../Settings/store/companySlice";
import {NavLink, useNavigate} from "react-router-dom";
import {fetchTasksByProject} from "../../Settings/store/taskSlice";

const WorkspaceLists = () => {

  const dispatch = useDispatch();
    const navigate = useNavigate()

  useEffect(() => {
    dispatch(fetchAllCompanies());
  }, [dispatch]);

  const {companies} = useSelector((state) => state.settings.company);
    const goToTasksList = (id) => {
        dispatch(fetchTasksByProject({id:id}))
        navigate(`/project/task/list/${id}`)
    }
    /*const {loggedUserId} = useSelector((state) => state.auth.user)
    console.log(loggedUserId)*/
  return (
    <>
      <WorkspaceModal />

      <ScrollArea className="h-[calc(100vh-200px)]" scrollbarSize={4}>
        <Accordion variant="separated" defaultValue="">
          {companies && companies.length>0 && companies.map((item) => (
            <Accordion.Item key={item.id} value={item.id.toString()}>
              <Accordion.Control className="!bg-white font-bold border-solid !border-[#545454] !rounded-t-md">
                {item.name}
              </Accordion.Control>
              {item.projects && item.projects.length > 0 &&
              <Accordion.Panel>
                <ul>
                  {item.projects && item.projects.map((project, index) => (
                      <li key={`${item.id}-${index}`}>
                        <a onClick={()=>goToTasksList(project.id)} rel="noopener noreferrer" className="text-[#39758D] hover:underline">
                          {project.name}
                        </a>
                      </li>
                  ))}

                </ul>
              </Accordion.Panel>
              }
            </Accordion.Item>
          ))}
        </Accordion>
      </ScrollArea>
      
    </>
  );
};

export default WorkspaceLists;