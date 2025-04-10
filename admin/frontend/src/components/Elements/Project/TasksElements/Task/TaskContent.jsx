import React, {Fragment, useEffect, useState} from 'react';
import { ReactSortable } from 'react-sortablejs'; 
import SubtaskContent from './SubtaskContent';
import MainTask from './MainTask';
import { useSelector, useDispatch } from 'react-redux';
import {createTask, deleteTask} from "../../../../Settings/store/taskSlice";
import {Draggable, Droppable} from "react-beautiful-dnd";
import {Accordion, Button, Flex, Pill, Text, Title, Tooltip} from "@mantine/core";
import {hasPermission} from "../../../../ui/permissions";
import {IconChevronDown, IconPlus, IconTrash} from "@tabler/icons-react";
import {modals} from "@mantine/modals";
import TaskDelete from "./TaskDelete";
import {updateInputFieldFocus} from "../../../../../store/base/commonSlice";
import MyZenButton from "./MyZenButton";

const TaskContent = ({ view, taskData }) => {

    const dispatch = useDispatch();
    const { childColumns } = useSelector((state) => state.settings.task);
    const [ task, setTask ] = useState(taskData);

    useEffect(() => {
        setTask( taskData );
    }, [taskData]);

    const [subtasks, setSubtasks] = useState(childColumns && childColumns[taskData.slug] && childColumns[taskData.slug].length?[...Array(childColumns[taskData.slug].length).keys()]:[]);
    const {loggedUserId} = useSelector((state) => state.auth.user)
    const {loggedInUser} = useSelector((state) => state.auth.session)

    useEffect(() => {
        setTask( taskData );
    }, [taskData]);

    const addSubtask = () => {
      setSubtasks([...subtasks, subtasks.length]);

      //check if childColumns && childColumns[taskData.slug] name is 'Type task name here' using some
        if (childColumns && childColumns[taskData.slug] && childColumns[taskData.slug].some(subtask => subtask.name === 'Type task name here')) {
            // /how to get the index of the first element that matches the condition
            const index = childColumns[taskData.slug].findIndex(subtask => subtask.name === 'Type task name here');
            //index element tag editable
            const subtask = childColumns[taskData.slug][index];

            //check if subtask is not undefined
            if (subtask !== undefined) {
                //focus on the subtask
                const subtaskElement = document.querySelector(`[data-id="${subtask.id}"]`);
                if (subtaskElement) {
                    subtaskElement.focus();
                }
            }

            return false;
        }

      const newTaskData = {
          name: 'Type task name here',
          parent: taskData,
          task_section_id: taskData.task_section_id,
          project_id: taskData.project_id,
          type:'sub-task',
          created_by: loggedInUser ? loggedInUser.loggedUserId : loggedUserId,
          status: 'ACTIVE'
      }
      dispatch(createTask(newTaskData));
      dispatch(updateInputFieldFocus(true));
    };
  const onSortEnd = (sortedList) => {
    setSubtasks(sortedList);
  };

  const [selectedAccordion, setSelectedAccordion] = useState('');
    const toggleSection = (section) => {
        setSelectedAccordion(section);
    };

  return (
    <Fragment>
      {view === 'cardView' ? (
        <div className="full-project-tasks flex-col shadow-md m-4 p-3 rounded-md border border-1 border-[#efefef] gap-3">  
          <MainTask view='cardView' addSubtask={addSubtask} taskData={task}/>
          </div>
      ) : (
          <div className="full-project-tasks">
              <Accordion
                  value={selectedAccordion}
                  onChange={setSelectedAccordion}
                  chevronPosition="left"
                         chevron={<IconChevronDown size={30} stroke={2} />}
                         classNames={{
                              control: '!p-0 !w-auto',
                              content: '!pl-[30px] !pr-0 !pb-2',
                              label: '!py-0 !pt-1',
                              chevron: '!mx-0 !ml-1',
                              // chevron: classes.chevron
                            }}
              >
                  <Accordion.Item value={taskData && taskData.slug}>
                      <div className="flex w-full items-center py-1">
                          <div className={`min-w-[19px] min-h-[30px]`}>
                              {childColumns && childColumns[taskData.slug] && childColumns[taskData.slug].length > 0 &&
                                  <Accordion.Control>

                                  </Accordion.Control>
                              }
                          </div>
                          <div className="flex w-full items-center">
                              {/*<Pill className="!bg-[#ED7D31] !text-white !px-2">{childColumns && childColumns[taskData.slug] && childColumns[taskData.slug].length > 0 ? childColumns[taskData.slug].length : 0 }</Pill>*/}
                              <MainTask addSubtask={addSubtask} taskData={ task }/>
                          </div>
                          <div className="flex items-center justify-end gap-2 min-w-28">
                              {/*{ loggedInUser && loggedUserId === parseInt(taskData.assignedTo_id) &&
                                  <MyZenButton task={taskData} taskId={taskData && taskData.id} />
                              }*/}

                              {hasPermission(loggedInUser && loggedInUser.llc_permissions, ['superadmin', 'admin', 'director', 'manager', 'line_manager', 'employee', 'sub-task-add']) &&
                                  <div onClick={(e) => e.stopPropagation()}>
                                      <Tooltip label={`Add sub task`} position="top" withArrow>
                                          <div
                                              className="h-[20px] w-[20px] border border-solid border-[#4d4d4d] rounded-full p-[2px] create-subtask"
                                              onClick={()=>{
                                                  toggleSection(taskData.slug);
                                                  addSubtask();
                                              }}>
                                              <IconPlus color="#4d4d4d" size="14" className="cursor-pointer"/>
                                          </div>
                                      </Tooltip>
                                  </div>
                              }
                              <TaskDelete task={taskData} taskId={taskData && taskData.id} />

                          </div>

                      </div>

                      <Accordion.Panel>
                          <Droppable
                              key={taskData.id}
                              droppableId={taskData.slug}
                              type='SUBTASK'
                              >
                                  {(dropProvided, snapshot) => (
                                      <div
                                          style={{transition: 'background-color 0.3s ease'}}
                                          className={`w-full h-full min-h-[20px] !shadow-md mb-2 ${childColumns && childColumns[taskData.slug] && childColumns[taskData.slug].length > 0 ? 'py-1 bg-[#F0F8FF] rounded-lg' : ''}`}
                                          ref={dropProvided.innerRef}
                                          {...dropProvided.droppableProps}
                                      >
                                          {childColumns && childColumns[taskData.slug] && childColumns[taskData.slug].length > 0 && childColumns[taskData.slug].map((subTask, subtaskIndex) => (
                                              <Draggable
                                                  key={subTask.id}
                                                  draggableId={subTask.id.toString()}
                                                  index={subtaskIndex}
                                              >
                                                  {(dragProvided) => (
                                                      <div
                                                          key={subtaskIndex}
                                                          className='py-1 single-task'
                                                          ref={dragProvided.innerRef}
                                                          {...dragProvided.draggableProps}
                                                          {...dragProvided.dragHandleProps}
                                                      >
                                                          <SubtaskContent taskData={taskData} key={subtaskIndex}
                                                                          subtask={subTask}/>

                                                      </div>
                                                  )}

                                              </Draggable>
                                          ))}

                                          {dropProvided.placeholder}

                                      </div>
                                  )}

                              </Droppable>
                          <Flex
                              justify="center"
                              align="center"
                              direction="row"
                          >
                              <Button
                                  onClick={()=>{
                                  toggleSection(taskData.slug);
                                  addSubtask();
                                }}
                                  variant="filled" color={`#ED7D31`} size={`xs`}> <IconPlus size={`18`} stroke={1.5} /> Add Sub Task</Button>
                          </Flex>

                          </Accordion.Panel>
                  </Accordion.Item>
              </Accordion>

          </div>
          
        )}
    </Fragment>
  );
};

export default TaskContent;
