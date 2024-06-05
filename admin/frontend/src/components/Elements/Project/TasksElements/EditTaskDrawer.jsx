import React, {useEffect, useRef, useState} from 'react';
import { useDisclosure } from '@mantine/hooks';
import {Drawer, Button, FileInput, rem, Textarea, Text, ScrollArea, Select, Loader} from '@mantine/core';
import {IconChevronDown, IconColumnRemove, IconFile, IconPaperclip, IconTrashX} from '@tabler/icons-react';
import ContentEditable from 'react-contenteditable'; 
import TaskAssignTo from './Task/TaskAssignTo';
import TaskFollower from './Task/TaskFollower';
import TaskDueDate from './Task/TaskDueDate';
import TaskPriority from './Task/TaskPriority';
import TaskTag from './Task/TaskTag';
import TaskComment from './TaskComment';
import {useDispatch, useSelector} from "react-redux";
import {
    createAttachment,
    createTask,
    deleteAttachment,
    editTask,
    setEditableTask
} from "../../../Settings/store/taskSlice";
import DueDate from "./Task/DueDate";
import dayjs from "dayjs";
import Priority from "./Task/Priority";
import TaskActivity from "./TaskActivity";

const EditTaskDrawer = ({ task, taskEditDrawerOpen, openTaskEditDrawer, closeTaskEditDrawer }) => {
    console.log(task)
    const dispatch = useDispatch();
    const {loggedUserId} = useSelector((state) => state.auth.user)
    const contentEditableRef = useRef('');

    const icon = <IconPaperclip style={{ width: rem(18), height: rem(18) }} stroke={1.5} />;
    // const [taskEditDrawerOpen, { open: openTaskEditDrawer, close: closeTaskEditDrawer }] = useDisclosure(false);

    const [taskName, setTaskName] = useState(task && task.name ? task.name: 'Type task name here');
    const [taskDescription, setTaskDescription] = useState(task && task.description ? task.description: '');
    const [selectedMember, setSelectedMember] = useState(null);
    const [selectedFollower, setSelectedFollower] = useState(task && task.members && task.members.length > 0 ? task.members :[]);
    const [selectedDueDate, setSelectedDueDate] = useState(task && task.end_date ? dayjs(task.end_date).format('YYYY-MM-DD'): null);
    const [selectedPriority, setSelectedPriority] = useState(null);


  const [attachments, setAttachments] = useState( task.attachments && task.attachments.length>0 ? task.attachments : []);

    const handleAssignButtonClick = (member) => {
        setSelectedMember(member);
    }
    const handleDrawerClose = () => {
        dispatch(setEditableTask(task))

    }

    const handleAssignFollower = (members) => {
        setSelectedFollower(members);
    }
    const handleDueDateSelect = (date) => {
        if(date){
            var formatedDate = dayjs(date).format('YYYY-MM-DD');
            setSelectedDueDate(formatedDate)
        }
    };

    const handlePriority = (priority) => {
        setSelectedPriority(priority);
    }
  const handleFileUpload = (files) => {
      const formData = new FormData();
      files.forEach((file, index) => {
          // formData.append(`attachments[${index}]`, file);
          formData.append(`attachments${index}`, file);
      });
      formData.append('task_id', task.id);
      formData.append('user_id', loggedUserId);
      dispatch(createAttachment({data: formData}))
      // setAttachments([...attachments, ...files]);
    // setAttachments(Array.from(files)); // Convert files to an array
};
    useEffect(() => {
        if(taskEditDrawerOpen===false){
            // setShowMembersList(workspaceCreateModalOpen);
            handleTaskCreation();
        }
        setAttachments(task.attachments && task.attachments.length>0 ? task.attachments : [])
    }, [taskEditDrawerOpen]);
    const handleTaskCreation = () => {
        const newTaskData = {
            name: taskName,
            // project_id: projectId,
            // task_section_id: taskSectionId,
            created_by: loggedUserId,
            assigned_to: selectedMember,
            members: selectedFollower,
            start_date: selectedDueDate,
            end_date: selectedDueDate,
            priority: selectedPriority,
            type:'task'
        };

    };

    const [commentDropdownOpened, { toggle }] = useDisclosure();
    const [selectedValue, setSelectedValue] = useState('Only Comments');

    const handleSelect = (value) => {
        console.log(value)
        setSelectedValue(value);
        toggle();
    };


    const handlerBlur = () => {
        const taskEditableName = contentEditableRef.current.innerHTML;
        if( task && task.id && task.id!=='undefined' && taskEditableName !== taskName){
            dispatch(editTask({id: task.id, data: {name: taskEditableName, 'updated_by': loggedUserId}}))
            setTaskName(taskEditableName);
        }
    };

    const handleTaskDescription = (description) => {
        if(description && description!=='' && description !== task.description){
            const updatedTask = {
                description: description,
                updated_by: loggedUserId
            }
            dispatch(editTask({ id:task.id, data: updatedTask}))
            setTaskDescription(description);
        }

    }
    const handleAttachmentDelete = (id) => {
        const deletedTaskAttachment = {
            task_id: task && task.id,
            deleted_by: loggedUserId
        }
        dispatch(deleteAttachment({ id:id, data: deletedTaskAttachment}))
    }

    useEffect(() => {
        setTaskName(task && task.name ? task.name: 'Type task name here')
        setAttachments(task.attachments && task.attachments.length>0 ? task.attachments : [])
        },[task]);

  return (
    <>
        <div className="drawer">

          <Drawer
              opened={taskEditDrawerOpen}
              onClose={() => {
                  closeTaskEditDrawer();
                  handleDrawerClose();
              }}
              position="right"
              withCloseButton={false} size="lg" closeOnClickOutside={false}
          overlayProps={{ backgroundOpacity: 0, blur: 0 }}
          >
              <div className="mt-4">

                  <div className="drawer-head flex mb-4">
                      <div className="w-[85%]">
                          <ContentEditable
                              innerRef={contentEditableRef}
                              onChange={(e) => setTaskName(e.target.value)}
                              onBlur={handlerBlur} // Handle changes
                              html={taskName}
                              className="inline-block w-full text-[#4d4d4d] font-bold text-[16px]"
                          />
                      </div>
                      <div className="dh-btn flex w-[10%]">
                          <div className="attachment w-[35px] mt-[-3px]">
                              <FileInput
                                  multiple
                                  variant="unstyled"
                                  rightSection={icon}
                                  rightSectionPointerEvents="none"
                                  clearable
                                  onChange={handleFileUpload}
                              />
                          </div>
                          <Drawer.CloseButton/>

                      </div>
                  </div>
                  <ScrollArea className="h-[calc(100vh-130px)]" scrollbarSize={4}>
                      <div className="tasks-body flex flex-col gap-4 relative w-full">
                          <div className="flex z-[104]">
                              <div className="w-1/3">
                                  <Text fw={400} fz={14} c="#202020">Assign To</Text>
                              </div>
                              {/*<TaskAssignTo assignedMember={(props) => {
                                handleAssignButtonClick(props);
                            }} />*/}
                              <TaskAssignTo taskId={task.id} assigned={task.assigned_to} assignedMember={(props) => {
                                  console.log('')
                              }}/>
                          </div>
                          <div className="flex z-[103]">
                              <div className="w-1/3">
                                  <Text fw={400} fz={14} c="#202020">Following</Text>
                              </div>
                              <TaskFollower taskId={task.id} followers={task.members} editHandler={(props) => {
                                  console.log('')
                              }}/>
                          </div>
                          <div className="flex z-[102]">
                              <div className="w-1/3">
                                  <Text fw={400} fz={14} c="#202020">Due Date</Text>
                              </div>
                              <TaskDueDate taskId={task.id} dueDate={task.end_date}/>
                          </div>
                          <div className="flex z-[101]">
                              <div className="w-1/3">
                                  <Text fw={400} fz={14} c="#202020">Priority</Text>
                              </div>
                              <div className="border border-solid border-grey rounded-md">
                                  <TaskPriority taskId={task.id} priority={task.priority}/>
                              </div>
                          </div>
                          <div className="flex z-[100]">
                              <div className="w-1/3">
                                  <Text fw={400} fz={14} c="#202020">Tags</Text>
                              </div>
                              <TaskTag taskId={task.id} taskTags={task.tags}/>
                          </div>
                          <div className="flex z-[100]">
                              <div className="w-1/3">
                                  <Text fw={400} fz={14} c="#202020">Attachments</Text>
                              </div>
                              <div className='flex flex-wrap gap-3'>
                                  {attachments && attachments.length >0 && attachments.map((attachment, index) => (
                                      <div key={index}
                                           className='bg-[#EBF1F4] rounded-[20px] px-2 py-1 flex gap-2 items-center'>
                                          <IconFile size={14}/>
                                          <Text size="xs" lineClamp={1} fw={300} fz={14} c="#202020">{attachment.name}</Text>
                                          <IconTrashX onClick={()=>handleAttachmentDelete(attachment.id)} size={18} stroke={1} color="red"/>
                                      </div>
                                  ))}
                                  <div className="attachment w-[35px]">
                                      <FileInput
                                          multiple
                                          variant="unstyled"
                                          rightSection={icon}
                                          rightSectionPointerEvents="none"
                                          clearable
                                          onChange={handleFileUpload}
                                      />
                                  </div>
                              </div>
                          </div>
                          <div className="flex z-0">
                              <Textarea
                                  label="Description"
                                  description=""
                                  style={{width: '100%'}}
                                  autosize
                                  minRows={4}
                                  placeholder="What is the task about"
                                  onChange={(e) => setTaskDescription(e.target.value)}
                                  value={taskDescription}
                                  onBlur={(e) => {
                                      handleTaskDescription(e.target.value)
                                  }}
                              />
                          </div>
                          <div className="flex">
                              <button className="mt-1">
                                  <span className="text-sm font-medium text-[#ED7D31]">+ Add sub task</span>
                              </button>
                          </div>

                          <div className="commentbox">
                              <div className="border border-solid border-[#e9e9e9] rounded-md bg-[#ebebeb] p-4">
                                  <div className="mb-4">
                                      {!commentDropdownOpened ? (
                                          <div className="cursor-pointer flex items-center gap-2 text-[#39758D]"
                                               onClick={toggle}>
                                              <Text fw={500} fz={14} c="#39758D">
                                                  {selectedValue ? selectedValue : 'Comments'}
                                              </Text>
                                              <IconChevronDown size={18}/>
                                          </div>
                                      ) : null}

                                      {commentDropdownOpened && (
                                          <Select
                                              variant="unstyled"
                                              placeholder="Comments"
                                              data={['Only Comments', 'Only Activities', 'Comments & Activities',]}
                                              style={{width: '200px', color: '#f00'}}
                                              comboboxProps={{transitionProps: {transition: 'pop', duration: 200}}}
                                              dropdownOpened={commentDropdownOpened}
                                              onChange={handleSelect}
                                          />
                                      )}
                                  </div>
                                  {selectedValue === 'Only Comments' &&
                                      <TaskComment task={task} selectedValue={selectedValue}/>
                                  }
                                  {selectedValue === 'Only Activities' &&
                                      <TaskActivity task={task} selectedValue={selectedValue}/>
                                  }
                              </div>
                          </div>
                      </div>
                  </ScrollArea>
              </div>

          </Drawer>
        </div>
    </>
  );
};


export default EditTaskDrawer;