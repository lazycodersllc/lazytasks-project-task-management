import React, {useEffect, useRef, useState} from 'react';
import { useDisclosure } from '@mantine/hooks';
import {
    Drawer,
    Button,
    FileInput,
    rem,
    Textarea,
    Text,
    ScrollArea,
    Select,
    Anchor,
    LoadingOverlay, ActionIcon, useMantineTheme
} from '@mantine/core';
import {IconCheck, IconChevronDown, IconFile, IconPaperclip, IconTrash, IconTrashX} from '@tabler/icons-react';
import ContentEditable from 'react-contenteditable'; 
import TaskAssignTo from './Task/TaskAssignTo';
import TaskFollower from './Task/TaskFollower';
import TaskDueDate from './Task/TaskDueDate';
import TaskPriority from './Task/TaskPriority';
import TaskTag from './Task/TaskTag';
import TaskComment from './Task/TaskComment';
import {useDispatch, useSelector} from "react-redux";
import dayjs from "dayjs";
import TaskActivity from "./Task/TaskActivity";
import {
    createMyTaskAttachment,
    deleteMyTaskAttachment,
    editMyTask,
    setEditableMyTask
} from "../Settings/store/myTaskSlice";
import {fetchTask} from "../Settings/store/taskSlice";
import {notifications} from "@mantine/notifications";
import TaskCommentAndActivity from "./Task/TaskCommentAndActivity";

const EditMyTaskDrawer = ({ taskObj, taskId, taskEditDrawerOpen, openTaskEditDrawer, closeTaskEditDrawer }) => {
    const dispatch = useDispatch();
    const theme = useMantineTheme();

    const {loggedUserId} = useSelector((state) => state.auth.user)
    const {task} = useSelector((state) => state.settings.task);
    const [selectedValue, setSelectedValue] = useState('Comments & Activities');

    useEffect(() => {
        if(taskId){
            dispatch(fetchTask({id: taskId}))
        }
    }, [ dispatch, taskId, selectedValue ])

    const icon = <IconPaperclip style={{ width: rem(18), height: rem(18) }} stroke={1.5} />;

    const [taskName, setTaskName] = useState(task && task.name ? task.name: 'Untitled Task');
    const [taskDescription, setTaskDescription] = useState(task && task.description ? task.description: '');
    const contentEditableRef = useRef('');
    const [visible, setVisible] = useState(false);


  const [attachments, setAttachments] = useState( task.attachments && task.attachments.length>0 ? task.attachments : []);

    const handleDrawerClose = () => {
        dispatch(setEditableMyTask(task))
    }

    const handleFileUpload = (files) => {
        const formData = new FormData();
        files.forEach((file, index) => {
            // formData.append(`attachments[${index}]`, file);
            formData.append(`attachments${index}`, file);
        });
        formData.append('task_id', task.id);
        formData.append('user_id', loggedUserId);
        dispatch(createMyTaskAttachment({data: formData})).then( ( response ) => {
            if( response.payload && response.payload.status === 200 ) {

                setAttachments( response.payload.data );

                notifications.show({
                    color: theme.primaryColor,
                    title: response.payload.message,
                    icon: <IconCheck />,
                    autoClose: 2000,
                });
            }
        });
    };


    const handleAttachmentDelete = (id) => {
        const deletedTaskAttachment = {
            task_id: task && task.id,
            deleted_by: loggedUserId
        }
        dispatch(deleteMyTaskAttachment({ id:id, data: deletedTaskAttachment})).then((response) => {
            if(response.payload && response.payload.status === 200){

                setAttachments(response.payload.data);

                notifications.show({
                    color: theme.primaryColor,
                    title: response.payload.message,
                    icon: <IconCheck />,
                    autoClose: 2000,
                    // withCloseButton: true,
                });

            }

        });
    }

    useEffect(() => {
        if(taskEditDrawerOpen===true){
            setVisible(true);
        }
        setAttachments(task.attachments && task.attachments.length>0 ? task.attachments : [])
        setTimeout(() => {
            setVisible(false);
        }, 1000);
    }, [taskEditDrawerOpen]);

    const [commentDropdownOpened, { toggle }] = useDisclosure();

    const handleSelect = (value) => {
        console.log(value)
        setSelectedValue(value);
        toggle();
    };
    const handleTaskDescription = (description) => {
        if(description && description!=='' && description !== task.description){
            const updatedTask = {
                description: description,
                updated_by: loggedUserId
            }
            dispatch(editMyTask({ id:task.id, data: updatedTask}))
            setTaskDescription(description);
        }

    }

    const handlerBlur = () => {
        const taskEditableName = contentEditableRef.current.innerHTML;
        if( task && task.id && task.id!=='undefined' && taskEditableName !== taskName){
            dispatch(editMyTask({id: task.id, data: {name: taskEditableName, 'updated_by': loggedUserId}}))
            setTaskName(taskEditableName);
        }
    };

    useEffect(() => {
        setTaskName(task && task.name ? task.name: 'Type task name here')
        setTaskDescription(task && task.description ? task.description: '')
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
              withCloseButton={false} size="lg" closeOnClickOutside={true}
          overlayProps={{ backgroundOpacity: 0, blur: 0 }}
          >
            <div className="mt-2">

                <LoadingOverlay
                    visible={visible}
                    zIndex={1000}
                    overlayProps={{ radius: 'sm', blur: 4 }}
                />
              
              <Drawer.Body>
                <div className="drawer-head flex mb-4">
                  <div className="w-[88%]">
                  <ContentEditable
                      innerRef={contentEditableRef}
                      onChange={(e) => setTaskName(e.target.value)}
                      onBlur={handlerBlur} // Handle changes
                    html={taskName}
                    className="inline-block w-full text-[#4d4d4d] font-bold text-[16px]"
                  />
                  </div>
                  <div className="dh-btn flex w-[10%]">
                    <Drawer.CloseButton size={`md`} icon={`Update`} className={`!w-[70px]`} />

                  </div>
                </div>
                  <ScrollArea className="h-[calc(100vh-90px)]" scrollbarSize={4}>
                    <div className="tasks-body flex flex-col gap-4 relative">
                        <div className="flex z-[104]">
                            <div className="w-1/4">
                                <Text fw={700} fz={14} c="#202020">Created By</Text>
                            </div>
                            <div className={`relative w-3/4`}>
                                <Text fw={400} fz={14} c="#202020">{ task.createdBy_name }</Text>
                            </div>
                        </div>
                        <div className="flex z-[104]">
                            <div className="w-1/4">
                                <Text fw={700} fz={14} c="#202020">Assigned</Text>
                            </div>
                            <TaskAssignTo task={task} assigned={task.assigned_to} />
                        </div>
                        <div className="flex z-[103]">
                            <div className="w-1/4">
                                <Text fw={700} fz={14} c="#202020">Following</Text>
                            </div>
                            <TaskFollower task={task} followers={task.members} />
                        </div>
                        <div className="flex z-[102]">
                            <div className="w-1/4">
                                <Text fw={700} fz={14} c="#202020">Due Date</Text>
                            </div>
                            <TaskDueDate taskId={task.id} dueDate={task.end_date}/>
                        </div>
                        <div className="flex z-[101]">
                            <div className="w-1/4">
                                <Text fw={700} fz={14} c="#202020">Priority</Text>
                            </div>
                            <div className="border border-solid border-grey rounded-md">
                                <TaskPriority task={task} priority={task.priority}/>
                            </div>
                        </div>
                        <div className="flex z-[100]">
                            <div className="w-1/4">
                                <Text fw={700} fz={14} c="#202020">Tags</Text>
                            </div>
                            <TaskTag task={task} taskTags={task.tags} />
                        </div>
                        <div className="flex z-[100]">
                            <div className="w-1/4">
                                <Text fw={700} fz={14} c="#202020">Attachments</Text>
                            </div>
                            <div className='flex flex-wrap gap-3 w-3/4'>
                              {attachments && attachments.length>0 && attachments.map((attachment, index) => (
                                  <div key={index} className='bg-[#EBF1F4] rounded-[20px] px-2 py-1 flex gap-2 items-center'>
                                      <IconFile size={14}/>

                                      <Anchor href={attachment.file_path} download underline="not-hover">
                                          <Text size="xs" lineClamp={1} fw={300} fz={14} c="#202020">{attachment.name}</Text>
                                      </Anchor>

                                      <ActionIcon onClick={()=>handleAttachmentDelete(attachment.id)} variant="transparent" aria-label="Delete">
                                          <IconTrash size={20} stroke={1} color="red"/>
                                      </ActionIcon>

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
                                labelProps={{ style: { fontWeight: 'bold' } }}
                                label="Description"
                                description=""
                                style={{ width: '100%' }}
                                autosize
                                minRows={4}
                                placeholder="What is the task about"
                                value={taskDescription}
                                onChange={(e) => setTaskDescription(e.target.value)}
                                onBlur={(e) => handleTaskDescription(e.target.value)}
                                />
                        </div>
                        <div className="flex">
                            <button className="mt-1">
                                {/*<span className="text-sm font-medium text-[#ED7D31]">+ Add sub task</span>*/}
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
                                { selectedValue ==='Only Comments' &&
                                    <TaskComment task={task} selectedValue={selectedValue}/>
                                }
                                { selectedValue ==='Only Activities' &&
                                    <TaskActivity task={task} selectedValue={selectedValue}/>
                                }
                                { selectedValue ==='Comments & Activities' &&
                                    <TaskCommentAndActivity task={task} selectedValue={selectedValue}/>
                                }
                            </div>
                        </div>
                    </div>
                  </ScrollArea>
              </Drawer.Body>
            </div>

          </Drawer>
        </div>
    </>
  );
};


export default EditMyTaskDrawer;