import React from 'react';
import TaskAssignTo from "./Task/TaskAssignTo";
import TaskFollower from "./Task/TaskFollower";
import TaskDueDate from "./Task/TaskDueDate";
import TaskPriority from "./Task/TaskPriority";
import TaskTag from "./Task/TaskTag";

import {useDisclosure} from "@mantine/hooks";
import EditMyTaskDrawer from "./EditMyTaskDrawer";
import TaskName from "./Task/TaskName";

const MyTaskRow = ({ task }) => {

const [taskEditDrawerOpen, { open: openTaskEditDrawer, close: closeTaskEditDrawer }] = useDisclosure(false);
    const handleEditTaskDrawerOpen = (task) => {
        openTaskEditDrawer();
    };
  return (
    <>
        <div onDoubleClickCapture={()=>{handleEditTaskDrawerOpen(task)}} className="flex single-task-content main-task items-center w-full">
            <div className={`task-name pr-2 items-center ${task.parent?'w-[29%]':'w-[30%]'}`}>
                <div className="flex gap-2 items-center w-full">
                    <div className="w-full" onClick={(e) => e.stopPropagation()}>
                        <TaskName task={task && task} taskId={task.id} nameOfTask={task.name}/>
                    </div>
                </div>
            </div>
            <div className="assign-to w-[10%] pr-2">
                <div onClick={(e) => e.stopPropagation()}>
                    <TaskAssignTo task={task} assigned={task.assigned_to} />
                </div>
            </div>
            <div className="following w-[12%] items-center">
                <div onClick={(e) => e.stopPropagation()}>
                    <TaskFollower task={task} followers={task.members} />
                </div>
            </div>
            <div className="due-date w-[10%]">
                <div onClick={(e) => e.stopPropagation()}>
                    <div className="w-full inline-flex items-center justify-center">
                        <TaskDueDate taskId={task.id} dueDate={task.end_date}/>
                    </div>
                </div>
            </div>
            <div className="priority w-[10%]">
                <div onClick={(e) => e.stopPropagation()}>
                    <TaskPriority task={task} priority={task.priority}/>
                </div>
            </div>
            <div className={`tags ${task.parent?'w-[29%] pl-8':'w-[28%] pl-5'}`}>
                <div onClick={(e) => e.stopPropagation()}>
                    <TaskTag task={task} taskTags={task.tags}/>
                </div>
            </div>
        </div>


        {taskEditDrawerOpen && <EditMyTaskDrawer taskObj={task} taskId={task && task.id} taskEditDrawerOpen={taskEditDrawerOpen} openTaskEditDrawer={openTaskEditDrawer} closeTaskEditDrawer={closeTaskEditDrawer} />}

    </>

    
  );
};

export default MyTaskRow;
