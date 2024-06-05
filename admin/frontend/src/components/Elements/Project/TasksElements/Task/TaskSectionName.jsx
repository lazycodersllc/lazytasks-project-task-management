import { IconGripVertical, IconPlus } from '@tabler/icons-react';
import React, {useRef, useState} from 'react';
import ContentEditable from 'react-contenteditable';
import { useSelector, useDispatch } from 'react-redux';
import {editTaskSection} from "../../../../Settings/store/taskSlice";

const TaskSectionName = ({ taskSectionId, nameOfTaskSection }) => {
    const dispatch = useDispatch();
    const {loggedUserId} = useSelector((state) => state.auth.user)

    const defaultTaskName = (nameOfTaskSection || "Type section name here")
    const contentEditableRef = useRef('');

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
        if( taskSectionId && taskSectionId!=='undefined' && taskEditableName !== taskName){
            dispatch(editTaskSection({id: taskSectionId, data: {name: taskEditableName, updated_by: loggedUserId}}))
            setTaskName(taskEditableName);
        }
    };

    return (
        <div className={isFocused ? 'border border-solid border-[#000000] rounded-md min-w-[150px]' : ''}>
            <ContentEditable
                // disabled={false}
                innerRef={contentEditableRef}
                html={taskName} // Inner HTML content
                onChange={handleChange} // Handle changes
                onBlur={handlerBlur} // Handle changes
                tagName="p" // Use a paragraph tag
                className="text-[#4d4d4d] font-semibold text-[14px] px-1 !outline-none pr-1"
            />
        </div>
    );
};

export default TaskSectionName;
