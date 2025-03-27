import {IconCheck, IconGripVertical, IconPlus, IconTrash, IconTrashX} from '@tabler/icons-react';
import React, {Fragment, useEffect, useRef, useState} from 'react';
import ContentEditable from 'react-contenteditable';
import { useSelector, useDispatch } from 'react-redux';
import {deleteTask, editTask, removeSuccessMessage} from "../../../../Settings/store/taskSlice";
import {Button, Pill, Text, Title, useMantineTheme, Tooltip} from '@mantine/core';
import {modals} from "@mantine/modals";
import {hasPermission} from "../../../../ui/permissions";
import {notifications} from "@mantine/notifications";
import {updateInputFieldFocus} from "../../../../../store/base/commonSlice";
const TaskName = ({ task, taskId, isSubtask, nameOfTask, view }) => {

    const dispatch = useDispatch();
    const theme = useMantineTheme();
    const defaultTaskName = isSubtask ? (nameOfTask || "Type task name here") : (nameOfTask || "Type task name here");
    const contentEditableRef = useRef('');
    const {loggedUserId} = useSelector((state) => state.auth.user)
    const {loggedInUser} = useSelector((state) => state.auth.session)
    const { childColumns } = useSelector((state) => state.settings.task);
    const {inputFieldIsFocused} = useSelector((state) => state.base.common);

    const [taskObject, setTaskObject] = useState(task);

    useEffect(() => {
        setTaskObject(task)
    }, [ task ]);

    const [taskName, setTaskName] = useState(defaultTaskName);
    const [isFocused, setIsFocused] = useState(inputFieldIsFocused || false);
    // const [isTaskNameFull, setIsTaskNameFull] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
        dispatch(updateInputFieldFocus(false));
    };

    const handleChange = (e) => {
        setTaskName(e.target.value);
    };

    const handlerBlur = () => {
        const taskEditableName = contentEditableRef.current.innerHTML;
        console.log('Task Editable Name:', taskEditableName);
        if( taskId && taskId!=='undefined'){
            if (taskEditableName === 'Type task name here' || taskEditableName === '') {
                // Clear the subtask name and show placeholder
                setTaskName('Type task name here');
            }else if(taskEditableName !== taskName){
                dispatch(editTask({id: taskId, data: {name: taskEditableName, 'updated_by': loggedUserId}})).then((response) => {
                    if( response.payload && response.payload.status === 200 ){
                        const newTaskName = response.payload.data.name;

                        setTaskObject( response.payload.data );
                        setTaskName(newTaskName);
                        notifications.show({
                            color: theme.primaryColor,
                            title: response.payload.message,
                            icon: <IconCheck />,
                            autoClose: 5000,
                            // withCloseButton: true,
                        });
                        setIsFocused(false);

                        /*const timer = setTimeout(() => {
                            dispatch(removeSuccessMessage());
                            dispatch(updateInputFieldFocus(false));
                        }, 5000); // Clear notification after 3 seconds

                        return () => clearTimeout(timer);*/
                    }
                })
            }
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            contentEditableRef.current.blur();
        }
    };

    const handleFocusSubtask = () => {
        setIsFocused(true);
    
        // Clear the task name and show placeholder if it matches the default placeholder
        if (taskName === 'Type task name here') {
            setTaskName('');
        }
    };

    const [isShown, setIsShown] = useState(false);

    useEffect(() => {
        setTaskName(defaultTaskName);
    }, [ nameOfTask ]);
    const previewTextLength = view === 'cardView' ? 30 : 40; // Adjust the number of characters to show
    const isLongText = taskName && taskName.length > previewTextLength;
    const previewText = isLongText ? taskName.slice(0, previewTextLength) + ' ...' : taskName;

    return (
        <>
            <div className={`flex items-center gap-1 w-full`}
                onFocus={handleFocus} onBlur={handleBlur}
                 onMouseEnter={() => {
                     setIsShown(true)
                 }
            }
                 onMouseLeave={() => setIsShown(false)}
            >
                {!(view === 'cardView') && (
                    <>
                        <div className="!min-w-[18px] w-[18px]">

                            {(isShown || isFocused) &&
                                <>
                                    <IconGripVertical size={20} stroke={1.25} />
                                </>
                            }

                        </div>
                        {!isSubtask &&
                            <Pill className="!bg-[#ED7D31] !text-white !px-2">{childColumns && childColumns[task.slug] && childColumns[task.slug].length > 0 ? childColumns[task.slug].length : 0 }</Pill>
                        }
                    </>
                )} 
                <div className={`${isFocused ? 'border border-solid border-[#bababa] rounded-md min-w-[150px] w-full' : 'w-full'} 
              ${isSubtask ? 'pl-3.5' : ''}`} >
                    {hasPermission(loggedInUser && loggedInUser.llc_permissions, ['superadmin', 'admin', 'director', 'manager', 'line_manager', 'employee', 'task-edit']) ?
                        <ContentEditable
                            // disabled={false}
                            innerRef={contentEditableRef}
                            html={isFocused ? taskName : previewText} // Inner HTML content
                            onChange={handleChange} // Handle changes
                            onBlur={handlerBlur} // Handle changes
                            onFocus={handleFocusSubtask} // Handle Focus Changes
                            onKeyDown={handleKeyDown}
                            tagName="p" // Use a paragraph tag
                            className={`text-[#000000] font-medium text-[14px] p-1 cursor-pointer !outline-none pr-1 w-full ${isFocused && taskName === 'Type task name here' ? 'text-gray-400' : ''}`}
                            style={{'lineHeight':'normal'}}
                            lineClamp={1}
                        />
                        :
                        <Text lineClamp={1} size="sm" className="text-[#000000] font-medium text-[14px] px-0 !outline-none pr-1">avijit</Text>
                    }

                </div>
            </div>
        </>
    );
};

export default TaskName;
