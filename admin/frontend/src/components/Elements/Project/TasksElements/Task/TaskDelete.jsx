import {IconCheck, IconTrash} from '@tabler/icons-react';
import React, {Fragment, useEffect, useRef, useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {deleteTask, removeSuccessMessage} from "../../../../Settings/store/taskSlice";
import {Button, Text, Title, Tooltip, useMantineTheme, Center} from '@mantine/core';
import {modals} from "@mantine/modals";
import {hasPermission} from "../../../../ui/permissions";
import {notifications} from "@mantine/notifications";
const TaskDelete = ({ task, taskId, isSubtask }) => {
    const theme = useMantineTheme();
    const dispatch = useDispatch();
    const {loggedUserId} = useSelector((state) => state.auth.user)
    const {loggedInUser} = useSelector((state) => state.auth.session)

    //taskDeleteHandler
    const taskDeleteHandler = () => modals.openConfirmModal({
        title: (
            <Title order={5}>You are parmanently deleting this item</Title>
        ),
        size: 'sm',
        radius: 'md',
        withCloseButton: false,
        children: (
            <Text size="md" mb='lg'>
                Are you Sure?
            </Text>
        ),
        labels: { confirm: 'Yes', cancel: 'No' },
        onCancel: () => console.log('Cancel'),
        onConfirm: () => {
            if(taskId && taskId!=='undefined'){
                if(task && (task.children && task.children.length > 0 || task.attachments && task.attachments.length > 0)){
                    modals.open({
                        withCloseButton: false,
                        centered: true,
                        children: (
                            <Fragment>
                                { task.children && task.children.length > 0 &&
                                    <Text size="sm">
                                        This task has {task.children.length} sub-tasks. Please delete all sub-tasks before deleting this task.
                                    </Text>
                                }
                                { task.attachments && task.attachments.length > 0 &&
                                    <Text size="sm">
                                        This task has {task.attachments.length} attachments. Please delete all attachments before deleting this task.
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
                    const taskType = isSubtask ? 'sub-task' : 'task';
                    dispatch(deleteTask({id: taskId, data: {'deleted_by': loggedInUser ? loggedInUser.loggedUserId : loggedUserId, 'type': taskType}})).then((response) => {
                        //status 200
                        if(response.payload.status === 200){

                            notifications.show({
                                color: theme.primaryColor,
                                title: response.payload.message,
                                icon: <IconCheck />,
                                autoClose: 5000,
                                // withCloseButton: true,
                            });
                            const timer = setTimeout(() => {
                                dispatch(removeSuccessMessage());
                            }, 3000); // Clear notification after 3 seconds

                            return () => clearTimeout(timer);
                        }

                    });

                }

            }
        },
    });

    return (
        <>
            {hasPermission(loggedInUser && loggedInUser.llc_permissions, ['superadmin', 'admin', 'director', 'manager', 'line_manager', 'employee', 'task-delete']) &&
                <Tooltip label="Task delete" position="top" withArrow>
                    <IconTrash
                        className="cursor-pointer"
                        onClick={()=> {taskDeleteHandler()}}
                        size={20}
                        stroke={1}
                        color="red"
                    />
                </Tooltip>
            }
        </>
    );
};

export default TaskDelete;
