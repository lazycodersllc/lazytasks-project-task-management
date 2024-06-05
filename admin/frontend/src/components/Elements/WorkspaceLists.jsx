import React from 'react';
import { Accordion } from '@mantine/core';   
import WorkspaceModal from './Modal/Workspace/WorkspaceModal';

const groceries = [
    {
      value: 'Right Brain Solution Ltd.',
      description: [
        { name: 'Project 1', url: 'https://example.com/project-1' },
        { name: 'Project 2', url: 'https://example.com/project-2' },
        { name: 'Project 3', url: 'https://example.com/project-3' },
      ],
    },
    {
      value: 'Prokaushal Upodesta Ltd.',
      description: [
        { name: 'Project A', url: 'https://example.com/project-a' },
        { name: 'Project B', url: 'https://example.com/project-b' },
      ],
    },
    {
      value: 'The Eastway Electric Co.',
      description: [
        { name: 'Project X', url: 'https://example.com/project-x' },
        { name: 'Project Y', url: 'https://example.com/project-y' },
        { name: 'Project Z', url: 'https://example.com/project-z' },
      ],
    },
  ];
const WorkspaceLists = () => {  
    const items = groceries.map((item) => (
        <Accordion.Item key={item.value} value={item.value}>
          <Accordion.Control className="!bg-white font-bold border-solid !border-[#545454] !rounded-t-md">
            {item.value}
        </Accordion.Control>
          <Accordion.Panel>
            <ul>
            {item.description.map((project, index) => (
                <li key={index}>
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-[#39758D] hover:underline">
                    {project.name}
                    </a>
                </li>
            ))}
            </ul>
        </Accordion.Panel>
        </Accordion.Item>
      ));
    return (
        <> 
            <WorkspaceModal />
            <Accordion variant="separated" defaultValue="Apples">
                {items}
            </Accordion>
 
        </>
        
    );
}

export default WorkspaceLists;
