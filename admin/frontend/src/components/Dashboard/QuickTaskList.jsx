import React, {useState, useEffect, Fragment, useRef} from 'react';
import {
    ActionIcon,
    Button,
    Input,
    Menu,
    rem,
    ScrollArea,
    Textarea,
    TextInput,
    Title,
    Text,
    Card, Group, Divider
} from '@mantine/core';
import { useSelector, useDispatch } from 'react-redux';
import {createQuickTask} from "../Settings/store/quickTaskSlice";
import dayjs from "dayjs";
import {IconDeviceFloppy, IconEdit} from "@tabler/icons-react";
import {Link} from "react-router-dom";
import {useDisclosure} from "@mantine/hooks";
import AddTaskFromQuickTaskDrawer from "../QuickTask/AddTaskFromQuickTaskDrawer";
import {showNotification} from "@mantine/notifications";

const QuickTaskList = () => {

    const dispatch = useDispatch();
    const [newQuickTask, setNewQuickTask] = useState('');
    const {loggedUserId} = useSelector((state) => state.auth.user);
    const {tasks} = useSelector((state) => state.settings.quickTask);
    const handleInputChange = (e) => {
        setNewQuickTask(e.target.value);
    };
    const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (newQuickTask.trim() !== '') {
            const submitData = {
              name: newQuickTask,
              user_id:loggedUserId
            }
            dispatch(createQuickTask(submitData))
            setNewQuickTask('');
        }

        }
    };

    const handleInputClick = () =>{
        if (newQuickTask.trim() !== '') {
            const submitData = {
                name: newQuickTask,
                user_id:loggedUserId
            }
            dispatch(createQuickTask(submitData)).then((res) => {
                if(res.payload && res.payload.status && res.payload.status === 200){
                    showNotification({
                        id: 'load-data',
                        loading: true,
                        title: 'Quick Task',
                        message: res.payload && res.payload.message && res.payload.message,
                        autoClose: 2000,
                        disallowClose: true,
                        color: 'green',
                    });
                }
            });
            setNewQuickTask('');
        }
    };


    const [selectedTask, setSelectedTask] = useState(null);

    const [taskEditDrawerOpen, { open: openTaskEditDrawer, close: closeTaskEditDrawer }] = useDisclosure(false);
    const handleEditTaskDrawerOpen = (task) => {
        setSelectedTask(task)
        openTaskEditDrawer();
    };


  return (
      <>
          <Card withBorder radius="sm">
              <Card.Section withBorder inheritPadding py="xs" className="bg-[#FDFDFD]">
                  <Group>
                      {/*<IconGripVertical size="20" />*/}
                      {/*<IconCalendar size={20} />*/}
                      <Title order={6}>Quick Task</Title>
                  </Group>
              </Card.Section>
              <Card.Section withBorder inheritPadding className="bg-[#FDFDFD] py-1.5 mb-1">
                  <TextInput
                      radius="sm"
                      size="sm"
                      placeholder="Add task"
                      onKeyDown={handleKeyDown}
                      onChange={handleInputChange}
                      value={newQuickTask}
                      rightSectionWidth={42}
                      rightSection={
                          <ActionIcon onClick={handleInputClick} size={24} radius="xl" color="#ED7D31" variant="filled">
                              <IconDeviceFloppy style={{width: '18px', height: '18px'}} stroke={1.5}/>
                          </ActionIcon>
                      }
                  />
              </Card.Section>
              <Card.Section px="xs" pb="xs">
                  <ScrollArea className="relative h-[200px] pb-[35px]" scrollbarSize={4}>
                      <div className="">
                          {tasks && tasks.length > 0 && tasks.map((task, index) => (
                              //odd and even calculated index value
                              <div className={`${index % 2 === 0?'bg-[#f8f9fa]':''}`}>
                                  <div onDoubleClickCapture={()=>{handleEditTaskDrawerOpen(task)}} className="content px-2 py-2 cursor-pointer">
                                      <Text fz="sm">{task.name}</Text>
                                  </div>
                              </div>
                          ))
                          }

                      </div>
                      {tasks && tasks.length > 4 &&
                          <div className="absolute bottom-0 right-1 bg-white">
                              <Link to={`/my-task`}>
                                  <Button color="#ED7D31" radius="xl" size="compact-xs">
                                      More...
                                  </Button>
                              </Link>
                          </div>
                      }

                  </ScrollArea>
              </Card.Section>
          </Card>
          {
              selectedTask && ( <AddTaskFromQuickTaskDrawer task={selectedTask} taskEditDrawerOpen={taskEditDrawerOpen} openTaskEditDrawer={openTaskEditDrawer} closeTaskEditDrawer={closeTaskEditDrawer}  />)
            }
      </>
  );
};

export default QuickTaskList;
