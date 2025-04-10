import React, {Fragment, useEffect, useState} from 'react';
import TaskName from './TaskName';
import TaskAssignTo from './TaskAssignTo';
import TaskFollower from './TaskFollower';
import TaskDueDate from './TaskDueDate';
import TaskPriority from './TaskPriority';
import TaskTag from './TaskTag';
import {IconPlus, IconSubtask} from '@tabler/icons-react';
import EditTaskDrawer from "../EditTaskDrawer";
import {useDisclosure} from "@mantine/hooks";
import {useSelector} from "react-redux";
import {hasPermission} from "../../../../ui/permissions";
import {Accordion, Box, Grid, Pill} from "@mantine/core";
import {Draggable, Droppable} from "react-beautiful-dnd";
import SubtaskContent from "./SubtaskContent";

const MainTask = ({ addSubtask, taskData, view }) => {
    const {loggedInUser} = useSelector((state) => state.auth.session)
    const { childColumns } = useSelector((state) => state.settings.task);
    const [taskEditDrawerOpen, { open: openTaskEditDrawer, close: closeTaskEditDrawer }] = useDisclosure(false);

    const [ task, setTask ] = useState(taskData);

    useEffect(() => { setTask( taskData ); }, [taskData]);

    const handleEditTaskDrawerOpen = () => {
        openTaskEditDrawer();
    };

    const [selectedAccordion, setSelectedAccordion] = useState('');
    const toggleSection = (section) => {
        setSelectedAccordion(section);
    };

  return (
    <>
      {view === 'cardView' ? (

        <Fragment>
            <div className="flex single-task-content main-task flex-col gap-3">
                <Box onDoubleClickCapture={()=>{handleEditTaskDrawerOpen()}} component="div">
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="task-name">
                            <TaskName task={task && task} taskId={task.id} nameOfTask={task.name} view='cardView'/>
                        </div>
                        <div className="assign-to">
                            <TaskAssignTo taskId={task.id} assigned={task.assigned_to} view='cardView'
                                          assignedMember={(props) => {
                                              console.log('')
                                          }}/>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="due-date">
                            <TaskDueDate taskId={task.id} dueDate={task.end_date}/>
                        </div>
                        <div className="priority">
                            <TaskPriority taskId={task.id} priority={task.priority}/>
                        </div>
                    </div>
                    <div className="tags">
                        {task.tags && task.tags.length > 0 &&
                            <TaskTag taskId={task.id} taskTags={task.tags}/>
                        }
                    </div>
                </Box>

                <Accordion
                    chevronPosition="right"
                    classNames={{
                        control: '!p-0 !pr-2 !w-auto',
                        content: '!px-0',
                        label: '!py-0 !pt-1',
                        chevron: '!mx-0 !ml-1',
                        // chevron: classes.chevron
                    }}
                   value={selectedAccordion}
                   onChange={setSelectedAccordion}
                >
                    <Accordion.Item value={task && task.slug}>
                        <div className="flex w-full items-center mb-2">
                            <div className="w-full following flex gap-1">
                                <TaskFollower taskId={task.id} followers={task.members} editHandler={(props) => {
                                    console.log('')
                                }}/>
                                {task.tags && task.tags.length === 0 &&
                                    <TaskTag taskId={task.id} taskTags={task.tags}/>
                                }
                            </div>
                            <IconSubtask color="#ED7D31" size="22"/>
                            <Pill
                                className="!bg-[#ED7D31] !text-white !px-2 !ml-1">{childColumns && childColumns[task.slug] && childColumns[task.slug].length > 0 ? childColumns[task.slug].length : 0 }</Pill>
                            <Accordion.Control>

                            </Accordion.Control>
                        </div>
                        <Accordion.Panel>

                            <Droppable
                                key={task.id}
                                droppableId={task.slug}
                                type='SUBTASK'
                            >
                                {(dropProvided, snapshot) => (
                                    <div
                                        style={{ transition: 'background-color 0.3s ease' }}
                                        className="w-full h-full min-h-[20px]"
                                        ref={dropProvided.innerRef}
                                        {...dropProvided.droppableProps}
                                    >
                                        {childColumns && childColumns[task.slug] && childColumns[task.slug].length > 0 && childColumns[task.slug].map((subTask, subtaskIndex) => (
                                            <Draggable
                                                key={subTask.id}
                                                draggableId={subTask.id.toString()}
                                                index={subtaskIndex}
                                            >
                                                {(dragProvided) => (
                                                    <div
                                                        key={subtaskIndex}
                                                        className='my-2 single-task'
                                                        ref={dragProvided.innerRef}
                                                        {...dragProvided.draggableProps}
                                                        {...dragProvided.dragHandleProps}
                                                    >
                                                        <SubtaskContent taskData={task}  key={subtaskIndex} subtask={subTask} view='cardView'/>
                                                    </div>
                                                )}

                                            </Draggable>
                                        ))}
                                        {dropProvided.placeholder}
                                    </div>
                                )}

                            </Droppable>

                        </Accordion.Panel>
                    </Accordion.Item>


                </Accordion>
            </div>
            {hasPermission(loggedInUser && loggedInUser.llc_permissions, ['superadmin', 'admin', 'director', 'manager', 'line_manager', 'employee', 'sub-task-add']) &&
                <div className="flex justify-end pt-3">
                    <button className="float-right" onClick={()=>{
                        toggleSection(task.slug);
                        addSubtask();
                    }}>
                        <span className="text-[#ED7D31] font-semibold text-[14px]">+ Subtask</span>
                    </button>
                </div>
            }
        </Fragment>

      ) : (
          <div onDoubleClickCapture={() => {
              handleEditTaskDrawerOpen()
          }} className="single-task-content main-task w-full">

              <Grid columns={24}>
                  <Grid.Col className={`flex items-center w-full !py-0`} span={7}>
                      <div
                          className="w-full"
                          onClick={(e) => e.stopPropagation()}>
                          <TaskName task={task && task} taskId={task.id} nameOfTask={task.name}/>
                      </div>
                  </Grid.Col>
                  <Grid.Col className={`assign-to flex items-center w-full !py-0`} span={2.5}>
                      <div className={`pl-1`} onClick={(e) => e.stopPropagation()}>
                          <TaskAssignTo taskId={task.id} assigned={task.assigned_to} assignedMember={(props) => {
                              console.log('')
                          }}/>
                      </div>
                  </Grid.Col>
                  <Grid.Col className={`following flex items-center justify-center !py-0`} span={2.5}>
                      <div onClick={(e) => e.stopPropagation()} >
                          <TaskFollower taskId={task.id} followers={task.members} editHandler={(props) => {
                              console.log('')
                          }}/>
                      </div>
                  </Grid.Col>
                  <Grid.Col className={`due-date flex items-center w-full !py-0`} span={2.5}>
                      <div className={`w-full`} onClick={(e) => e.stopPropagation()} >
                          <div className={`w-full flex items-start justify-center`}>
                              <TaskDueDate taskId={task.id} dueDate={task.end_date}/>
                          </div>
                      </div>
                  </Grid.Col>
                  <Grid.Col className={`priority flex items-center w-full !py-0`} span={2.5}>
                      <div className="pl-1 w-full flex justify-center" onClick={(e) => e.stopPropagation()}>
                          <TaskPriority taskId={task.id} priority={task.priority}/>
                      </div>
                  </Grid.Col>
                  <Grid.Col className={`tags flex items-center w-full !py-0 !pl-10`} span={7}>
                      <div className={`w-full flex items-center`} onClick={(e) => e.stopPropagation()}>
                          <TaskTag taskId={task.id} taskTags={task.tags} />
                      </div>
                  </Grid.Col>

              </Grid>

        </div>
      )}

        {taskEditDrawerOpen && <EditTaskDrawer taskObj={task} taskId={task && task.id} taskEditDrawerOpen={taskEditDrawerOpen} openTaskEditDrawer={openTaskEditDrawer} closeTaskEditDrawer={closeTaskEditDrawer} />}
    </>

    
  );
};

export default MainTask;
