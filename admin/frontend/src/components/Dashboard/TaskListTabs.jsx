import React from 'react';
import {Button, Card, Group, ScrollArea, Tabs, Text, Title} from '@mantine/core';
import { useSelector } from 'react-redux';
import {Link} from "react-router-dom";
import TaskHeader from "../MyTask/Partial/TaskHeader";
import MyTaskListContent from "../MyTask/MyTaskListContent";
import TaskList from "./TaskList";

const TaskListTabs = () => {
    const {userTaskOrdered, userTaskListSections, userTaskColumns, allTasks} = useSelector((state) => state.settings.myTask);
    return (
        <Card withBorder radius="sm">
            <Card.Section withBorder inheritPadding py="xs" className="bg-[#FDFDFD] mb-2">
                <Group>
                    <Title order={6}>My Tasks</Title>
                </Group>
            </Card.Section>

            <Card.Section px="xs" pb="xs">
                <Tabs color="#39758D" variant="pills" radius="sm" defaultValue="all">
                    <Tabs.List className="mb-3">
                        <Tabs.Tab value="all" className="font-bold">
                            All
                        </Tabs.Tab>
                        {userTaskOrdered && userTaskOrdered.length > 0 && userTaskOrdered.map((taskListSection, index) => (
                            <Tabs.Tab value={taskListSection} className="font-bold">
                                {userTaskListSections && userTaskListSections[taskListSection] && userTaskListSections[taskListSection]}
                            </Tabs.Tab>
                        ))}
                    </Tabs.List>
                    {/* {userTaskOrdered && userTaskOrdered.length > 0 ?
                        userTaskOrdered.map((taskListSection, index) => (
                            <Tabs.Panel value={taskListSection}>
                                <TaskList slug={ taskListSection} header={userTaskListSections && userTaskListSections[taskListSection] && userTaskListSections[taskListSection]}/>
                            </Tabs.Panel>
                        )) : <div className="text-center">No Task Found</div>
                    } */}
                    {userTaskOrdered && userTaskOrdered.length > 0 ? (
                        <>
                            {userTaskOrdered.map((taskListSection, index) => (
                                <Tabs.Panel key={index} value={taskListSection}>
                                    <TaskList slug={taskListSection} header={userTaskListSections && userTaskListSections[taskListSection]} />
                                </Tabs.Panel>
                            ))}
                            <Tabs.Panel value="all">
                                <ScrollArea className="relative h-[280px] pb-[30px]" scrollbarSize={4}>
                                {allTasks && allTasks.length > 0 ? (
                                    allTasks.map((task, index) => (
                                        // <TaskList key={index} slug={task.slug} header={task.name} />
                                        <div className={`${index % 2 === 0?'bg-[#f8f9fa]':''}`}>
                                            <div className="content px-2 py-2">
                                                <Text fz="sm">{task.name}</Text>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center">No Tasks Found</div>
                                )}
                                {allTasks && allTasks.length > 5 &&
                                    <div className="absolute bottom-0 right-1 bg-white">
                                        <Link to={`/my-task`}>
                                            <Button color="#ED7D31" radius="xl" size="compact-sm">
                                                More...
                                            </Button>
                                        </Link>
                                    </div>
                                }
                                </ScrollArea>
                            </Tabs.Panel>
                        </>
                    ) : (
                        <div className="text-center">No Task Found</div>
                    )}
                    
                </Tabs>
            </Card.Section>
        </Card>
  );
};

export default TaskListTabs;
