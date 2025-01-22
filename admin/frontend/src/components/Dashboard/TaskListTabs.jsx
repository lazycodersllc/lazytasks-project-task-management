import React from 'react';
import {Button, Card, Group, ScrollArea, Tabs, Text, Title} from '@mantine/core';
import { useSelector } from 'react-redux';
import {Link} from "react-router-dom";
import TaskHeader from "../MyTask/Partial/TaskHeader";
import MyTaskListContent from "../MyTask/MyTaskListContent";
import TaskList from "./TaskList";

const TaskListTabs = () => {
    const {userTaskOrdered, userTaskListSections, userTaskColumns} = useSelector((state) => state.settings.myTask);
    return (
        <Card withBorder radius="sm">
            <Card.Section withBorder inheritPadding py="xs" className="bg-[#FDFDFD] mb-2">
                <Group>
                    <Title order={6}>My Tasks</Title>
                </Group>
            </Card.Section>

            <Card.Section px="xs" pb="xs">
                <Tabs color="#39758D" variant="pills" radius="sm" defaultValue="today">
                    <Tabs.List className="mb-3">
                        {userTaskOrdered && userTaskOrdered.length > 0 && userTaskOrdered.map((taskListSection, index) => (
                            <Tabs.Tab value={taskListSection} className="font-bold">
                                {userTaskListSections && userTaskListSections[taskListSection] && userTaskListSections[taskListSection]}
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>
                    {userTaskOrdered && userTaskOrdered.length > 0 ?
                        userTaskOrdered.map((taskListSection, index) => (
                            <Tabs.Panel value={taskListSection}>
                                <TaskList slug={ taskListSection} header={userTaskListSections && userTaskListSections[taskListSection] && userTaskListSections[taskListSection]}/>
                            </Tabs.Panel>
                        )) : <div className="text-center">No Task Found</div>
                    }
                </Tabs>
            </Card.Section>
        </Card>
  );
};

export default TaskListTabs;
