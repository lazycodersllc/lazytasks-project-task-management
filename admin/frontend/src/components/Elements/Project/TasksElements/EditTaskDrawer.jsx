import React, {Fragment, useEffect, useRef, useState} from 'react';
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
    Loader,
    Title,
    LoadingOverlay, Anchor, ActionIcon, useMantineTheme
} from '@mantine/core';
import {IconCheck, IconChevronDown, IconColumnRemove, IconFile, IconPaperclip, IconTrash} from '@tabler/icons-react';
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
    deleteAttachment, deleteTask,
    editTask, fetchTask,
    setEditableTask
} from "../../../Settings/store/taskSlice";
import DueDate from "./Task/DueDate";
import dayjs from "dayjs";
import TaskActivity from "./TaskActivity";
import {modals} from "@mantine/modals";
import {hasPermission} from "../../../ui/permissions";
import {notifications} from "@mantine/notifications";
import TaskCommentAndActivity from "./TaskCommentAndActivity";

const EditTaskDrawer = ({taskObj, taskId, taskEditDrawerOpen, openTaskEditDrawer, closeTaskEditDrawer, isCalendar, submit }) => {

    const dispatch = useDispatch();
    const theme = useMantineTheme();

    const {loggedUserId} = useSelector((state) => state.auth.user)
    const {loggedInUser} = useSelector((state) => state.auth.session)
    const {task} = useSelector((state) => state.settings.task);
    const [selectedValue, setSelectedValue] = useState('Comments & Activities');

    useEffect(() => {
        if(taskId){
            dispatch(fetchTask({id: taskId}))
        }
    }, [ taskId, selectedValue ])

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
  const [subTask, setSubTask] = useState(task.children && task.children.length>0 ? task.children : []);

  const [visible, setVisible] = useState(false);

    const handleAssignButtonClick = (member) => {
        setSelectedMember(member);
    }
    const handleDrawerClose = () => {
        if(isCalendar){
            submit(taskObj);
        }else {
            dispatch(setEditableTask(taskObj))
        }
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
      dispatch(createAttachment({data: formData})).then( ( response ) => {
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
    useEffect(() => {
        if(taskEditDrawerOpen===true){
            setVisible(true);
            setTaskDescription(task && task.description ? task.description: '')
        }
        setAttachments(task.attachments && task.attachments.length>0 ? task.attachments : [])
        setSubTask(task.children && task.children.length>0 ? task.children : [])

        setTimeout(() => {
            setVisible(false);
        }, 1000);

    }, [taskEditDrawerOpen]);

    const [commentDropdownOpened, { toggle }] = useDisclosure();

    const handleSelect = (value) => {
        setSelectedValue(value);
        toggle();
    };


    const handlerBlur = () => {
        const taskEditableName = contentEditableRef.current.innerHTML;
        if( task && task.id && task.id!=='undefined' && taskEditableName !== taskName){
            dispatch(editTask({id: task.id, data: {name: taskEditableName, 'updated_by': loggedUserId}}))
            setTaskName(taskEditableName);
            dispatch(setEditableTask({...task, name: taskEditableName}))
        }
    };

    const handleTaskDescription = (description) => {

        if(description && description!=='' && description !== task.description && hasPermission(loggedInUser && loggedInUser.llc_permissions, ['superadmin', 'admin', 'director', 'manager', 'line_manager', 'employee', 'task-edit'])){
            const updatedTask = {
                description: description,
                updated_by: loggedUserId
            }
            dispatch(editTask({ id:task.id, data: updatedTask}))
            setTaskDescription(description);
            dispatch(setEditableTask({...task, description: description}))
        }
    }
    const handleAttachmentDelete = (id) => {
        const deletedTaskAttachment = {
            task_id: task && task.id,
            deleted_by: loggedUserId
        }
        dispatch(deleteAttachment({ id:id, data: deletedTaskAttachment})).then((response) => {
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
        setTaskName(task && task.name ? task.name: 'Type task name here')
        setTaskDescription(task && task.description ? task.description: '')
        setAttachments(task.attachments && task.attachments.length>0 ? task.attachments : [])
        setSubTask(task.children && task.children.length>0 ? task.children : [])
        },[task]);

    const taskDeleteHandler = (taskId) => modals.openConfirmModal({
        title: (
            <Title order={5}>You are parmanently deleting this item</Title>
        ),
        size: 'sm',
        radius: 'md',
        withCloseButton: false,
        children: (
            <Text size="sm" mb="lg">
                Are you Sure?
            </Text>
        ),
        labels: { confirm: 'Yes', cancel: 'No' },
        onCancel: () => console.log('Cancel'),
        onConfirm: () => {
            if(taskId && taskId!=='undefined'){
                if(task && (subTask && subTask.length > 0 || attachments && attachments.length > 0)){
                    modals.open({
                        withCloseButton: false,
                        centered: true,
                        children: (
                            <Fragment>
                                { subTask && subTask.length > 0 &&
                                    <Text size="sm">
                                        This task has {subTask.length} sub-tasks. Please delete all sub-tasks before deleting this task.
                                    </Text>
                                }
                                { attachments && attachments.length > 0 &&
                                    <Text size="sm">
                                        This task has {attachments.length} attachments. Please delete all attachments before deleting this task.
                                    </Text>
                                }
                                <div className="!grid w-full !justify-items-center">
                                    <Button justify="center" onClick={() => modals.closeAll()} mt="md">
                                        Ok
                                    </Button>
                                </div>
                            </Fragment>
                        ),
                    });
                }else{
                    const taskType = task && task.parent ? 'sub-task' : 'task';
                    dispatch(deleteTask({id: taskId, data: {'deleted_by': loggedUserId, 'type': taskType}}));
                }

            }
        },
    });


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

                  <div className="drawer-head flex w-full items-center mb-4">
                      <div className="w-[80%]">
                          {hasPermission(loggedInUser && loggedInUser.llc_permissions, ['superadmin', 'admin', 'director', 'manager', 'line_manager', 'employee', 'task-edit']) ?
                              <ContentEditable
                                  innerRef={contentEditableRef}
                                  onChange={(e) => setTaskName(e.target.value)}
                                  onBlur={handlerBlur} // Handle changes
                                  html={taskName}
                                  className="inline-block w-full text-[#4d4d4d] font-bold text-[16px] !min-h-[36px]"
                              />
                              :
                              <Text size="sm" className="text-[#000000] font-semibold text-[14px] px-0 !outline-none pr-1">{taskName}</Text>
                          }
                      </div>
                      <div className="dh-btn flex w-[20%]">
                          <div className="flex w-full gap-3 items-center justify-center">

                              <Drawer.CloseButton size={`lg`} icon={"Update"} className={`!ml-2 !h-[36px] !border-0 !w-[70px] !bg-[#ED7D31] !text-white`} />
                              {hasPermission(loggedInUser && loggedInUser.llc_permissions, ['superadmin', 'admin', 'director', 'manager', 'line_manager', 'employee', 'task-delete']) &&
                                  <IconTrash
                                      onClick={()=> {taskDeleteHandler(task && task.id)}}
                                      size="24"
                                      color="var(--mantine-color-red-filled)"
                                  />
                              }
                          </div>
                      </div>
                  </div>
                  <ScrollArea className="h-[calc(100vh-90px)]" scrollbarSize={4}>
                      <div className="tasks-body flex flex-col gap-4 relative w-full">
                          <div className="flex items-center z-[104]">
                              <div className="w-1/4">
                                  <Text fw={700} fz={14} c="#202020">Created By</Text>
                              </div>
                              <div className={`relative w-3/4`}>
                                  <Text fw={400} fz={14} c="#202020">{ task.createdBy_name }</Text>
                              </div>
                          </div>
                          <div className="flex items-center z-[104]">
                              <div className="w-1/4">
                                  <Text fw={700} fz={14} c="#202020">Assigned</Text>
                              </div>
                              <div className={`relative w-3/4`}>
                                  <TaskAssignTo taskId={task.id} assigned={task.assigned_to} assignedMember={(props) => {
                                      console.log('')
                                  }}/>
                              </div>
                          </div>
                          <div className="flex items-center z-[103]">
                              <div className="w-1/4">
                                  <Text fw={700} fz={14} c="#202020">Following</Text>
                              </div>
                              <div className={`relative w-3/4`}>
                                  <TaskFollower taskId={task.id} followers={task.members} editHandler={(props) => {
                                      console.log('')
                                  }}/>
                              </div>
                          </div>
                          <div className="flex items-center z-[102]">
                              <div className="w-1/4">
                                  <Text fw={700} fz={14} c="#202020">Due Date</Text>
                              </div>
                              <TaskDueDate taskId={task.id} dueDate={task.end_date}/>
                          </div>
                          <div className="flex items-center z-[101]">
                              <div className="w-1/4">
                                  <Text fw={700} fz={14} c="#202020">Priority</Text>
                              </div>
                              <TaskPriority taskId={task.id} priority={task.priority}/>
                          </div>
                          <div className="flex items-center z-[100]">
                              <div className="w-1/4">
                                  <Text fw={700} fz={14} c="#202020">Tags</Text>
                              </div>
                              <div className={`relative`}>
                                <TaskTag taskId={task.id} taskTags={task.tags}/>
                              </div>
                          </div>
                          <div className="flex z-[100]">
                              <div className="w-1/4">
                                  <Text fw={700} fz={14} c="#202020">Attachments</Text>
                              </div>
                              <div className='flex flex-wrap gap-3 w-3/4'>
                                  {attachments && attachments.length >0 && attachments.map((attachment, index) => (
                                      <div key={index}
                                           className='bg-[#EBF1F4] rounded-[20px] px-2 py-1 flex gap-2 items-center'>
                                          <IconFile size={14}/>
                                          <Anchor href={attachment.file_path} download underline="not-hover">
                                              <Text size="xs" lineClamp={1} fw={300} fz={14} c="#202020">{attachment.name}</Text>
                                          </Anchor>
                                          {hasPermission(loggedInUser && loggedInUser.llc_permissions, ['superadmin', 'admin', 'director', 'manager', 'line_manager', 'employee', 'task-delete']) &&
                                              <ActionIcon onClick={()=>handleAttachmentDelete(attachment.id)} variant="transparent" aria-label="Delete">
                                                  <IconTrash size={20} stroke={1} color="red"/>
                                              </ActionIcon>
                                          }
                                      </div>
                                  ))}
                                  {hasPermission(loggedInUser && loggedInUser.llc_permissions, ['superadmin', 'admin', 'director', 'manager', 'line_manager', 'employee', 'task-edit']) &&
                                      <div className="attachment w-[30px] h-[30px]">
                                          <FileInput
                                              multiple
                                              variant="unstyled"
                                              rightSection={icon}
                                              rightSectionPointerEvents="none"
                                              clearable
                                              onChange={handleFileUpload}
                                          />
                                      </div>
                                  }
                              </div>
                          </div>
                          <div className="flex z-0">
                              <Textarea
                                  labelProps={{ style: { fontWeight: 'bold' } }}
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
                                  {selectedValue === 'Only Comments' &&
                                      <TaskComment task={task} selectedValue={selectedValue}/>
                                  }
                                  {selectedValue === 'Only Activities' &&
                                      <TaskActivity task={task} selectedValue={selectedValue}/>
                                  }
                                  {selectedValue === 'Comments & Activities' &&
                                      <TaskCommentAndActivity task={task} selectedValue={selectedValue}/>
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