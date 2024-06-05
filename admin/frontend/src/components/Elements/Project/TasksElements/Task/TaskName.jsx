import { IconGripVertical, IconPlus } from '@tabler/icons-react';
import React, {useEffect, useRef, useState} from 'react';
import ContentEditable from 'react-contenteditable';
import { useSelector, useDispatch } from 'react-redux';
import {editTask} from "../../../../Settings/store/taskSlice";

const TaskName = ({ taskId, isSubtask, nameOfTask, view }) => {
    const dispatch = useDispatch();

    const defaultTaskName = isSubtask ? (nameOfTask || "Type task name here") : (nameOfTask || "Type task name here");
    const contentEditableRef = useRef('');
    const {loggedUserId} = useSelector((state) => state.auth.user)

    const [taskName, setTaskName] = useState(defaultTaskName);
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    const handleChange = (e) => {
        setTaskName(e.target.value);
    };
    const handlerBlur = () => {
        const taskEditableName = contentEditableRef.current.innerHTML;
        if( taskId && taskId!=='undefined' && taskEditableName !== taskName){
            dispatch(editTask({id: taskId, data: {name: taskEditableName, 'updated_by': loggedUserId}}))
            setTaskName(taskEditableName);
        }
    };
    const [isShown, setIsShown] = useState(false);

    useEffect(() => {
        setTaskName(defaultTaskName);
    }, [nameOfTask]);

    return (
        <>
            <div className={`flex items-center gap-1`}
                onFocus={handleFocus} onBlur={handleBlur}
                 onMouseEnter={() => setIsShown(true)}
                 onMouseLeave={() => setIsShown(false)}
            >
                {!(view === 'cardView') && (
                    <div className="cursor-pointer w-[14px]">
                        {(isShown || isFocused) && <IconGripVertical size="14" />}
                    </div>
                )} 
                <div className={isFocused ? 'border border-solid border-[#bababa] rounded-md min-w-[150px]' : ''}>
                    <ContentEditable
                        // disabled={false}
                        innerRef={contentEditableRef}
                        html={taskName} // Inner HTML content
                        onChange={handleChange} // Handle changes
                        onBlur={handlerBlur} // Handle changes
                        tagName="p" // Use a paragraph tag
                        className="text-[#000000] font-semibold text-[14px] px-0 !outline-none pr-1"
                    />
                </div>
            </div>
        </>
    );
};

export default TaskName;
