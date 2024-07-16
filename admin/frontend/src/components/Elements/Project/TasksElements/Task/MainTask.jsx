import React from 'react';
import TaskName from './TaskName';
import TaskAssignTo from './TaskAssignTo';
import TaskFollower from './TaskFollower';
import TaskDueDate from './TaskDueDate';
import TaskPriority from './TaskPriority';
import TaskTag from './TaskTag';
import { IconPlus } from '@tabler/icons-react';
import EditTaskDrawer from "../EditTaskDrawer";
import {useDisclosure} from "@mantine/hooks";

const MainTask = ({ addSubtask, task, view }) => {

const [taskEditDrawerOpen, { open: openTaskEditDrawer, close: closeTaskEditDrawer }] = useDisclosure(false);

    const handleEditTaskDrawerOpen = () => {
        openTaskEditDrawer();
    };
  return (
    <>
      {view === 'cardView' ? (

        <div onDoubleClickCapture={()=>{handleEditTaskDrawerOpen()}} className="flex single-task-content main-task flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="task-name">
              <TaskName taskId={task.id} nameOfTask={task.name} view='cardView'/>
            </div> 
            <div className="assign-to">
              <TaskAssignTo taskId={task.id} assigned={task.assigned_to} view='cardView' assignedMember={(props) => {
                console.log('')
              }}/>
            </div>
          </div> 
          <div className="flex items-center justify-between">
            <div className="due-date">
              <TaskDueDate taskId={task.id} dueDate={task.end_date}/>
            </div>
            <div className="priority">
              <TaskPriority taskId={task.id} priority={task.priority}/>
            </div>
          </div>
          <div className="tags">
              {task.tags && task.tags.length > 0 &&
                  <TaskTag taskId={task.id} taskTags={task.tags} />
              }
          </div>
          <div className="flex items-center justify-between">
            <div className="following flex gap-1">
              <TaskFollower taskId={task.id} followers={task.members} editHandler={(props) => {
                console.log('')
              }}/>
                {task.tags && task.tags.length === 0 &&
                    <TaskTag taskId={task.id} taskTags={task.tags} />
                }
            </div> 
            {/* <div className="h-[20px] w-[20px] border border-solid border-[#4d4d4d] rounded-full p-[2px] create-subtask" onClick={addSubtask}>
              <IconPlus color="#4d4d4d" size="14" className="cursor-pointer" />
            </div> */}

            <button onClick={addSubtask}>
              <span className="text-[#ED7D31] font-semibold text-[14px]">+ Subtask</span>
            </button>
          </div>
        </div> 
      ) : (
        <div onDoubleClickCapture={()=>{handleEditTaskDrawerOpen()}} className="flex single-task-content main-task">
          <div className="task-name w-[30%] pr-4 items-center">
              <div className="flex gap-2 items-center">
                  <div className="inline-block" onClick={(e) => e.stopPropagation()}>
                      <TaskName taskId={task.id} nameOfTask={task.name}/>
                  </div>
                  <div className="inline-block" onClick={(e) => e.stopPropagation()}>
                      <div
                          className="h-[20px] w-[20px] border border-solid border-[#4d4d4d] rounded-full p-[2px] create-subtask"
                          onClick={addSubtask}>
                          <IconPlus color="#4d4d4d" size="14" className="cursor-pointer"/>
                      </div>
                  </div>
              </div>
          </div>
            <div className="assign-to w-[10%]">
                <div className="inline-block" onClick={(e) => e.stopPropagation()}>
                    <TaskAssignTo taskId={task.id} assigned={task.assigned_to} assignedMember={(props) => {
                  console.log('')
                }}/>
              </div>
          </div>
          <div className="following w-[12%]">
              <div className="inline-block" onClick={(e) => e.stopPropagation()} >
                  <TaskFollower taskId={task.id} followers={task.members} editHandler={(props) => {
                      console.log('')
                  }}/>
              </div>
          </div>
          <div className="due-date w-[10%]">
              <div className="inline-block" onClick={(e) => e.stopPropagation()} >
                  <TaskDueDate taskId={task.id} dueDate={task.end_date}/>
              </div>
          </div>
          <div className="priority w-[10%]">
              <div className="inline-block" onClick={(e) => e.stopPropagation()}>
                  <TaskPriority taskId={task.id} priority={task.priority}/>
              </div>
          </div>
          <div className="tags w-[28%]">
              <div className="inline-block" onClick={(e) => e.stopPropagation()}>
                  <TaskTag taskId={task.id} taskTags={task.tags} />
              </div>
          </div>
        </div>
      )}

        {taskEditDrawerOpen && <EditTaskDrawer task={task} taskEditDrawerOpen={taskEditDrawerOpen} openTaskEditDrawer={openTaskEditDrawer} closeTaskEditDrawer={closeTaskEditDrawer} />}
    </>

    
  );
};

export default MainTask;
