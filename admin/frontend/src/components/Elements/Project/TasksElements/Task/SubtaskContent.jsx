
import React from 'react'; 
import TaskName from './TaskName';
import TaskAssignTo from './TaskAssignTo';
import TaskFollower from './TaskFollower';
import TaskDueDate from './TaskDueDate';
import TaskPriority from './TaskPriority';
import TaskTag from './TaskTag';
import {useDisclosure} from "@mantine/hooks";
import EditTaskDrawer from "../EditTaskDrawer";
import TaskDelete from "./TaskDelete";
import {Grid} from "@mantine/core";

const SubtaskContent = ({taskData, subtask, view}) => {


  const [subTaskEditDrawerOpen, { open: openSubTaskEditDrawer, close: closeSubTaskEditDrawer }] = useDisclosure(false);

  const handleEditSubTaskDrawerOpen = () => {
    openSubTaskEditDrawer();
  };
// console.log(subtask, taskData);
  return (
    <> 

        {view === 'cardView' ? (
            <div onDoubleClickCapture={()=>{handleEditSubTaskDrawerOpen()}} className="sabtask mb-2" >
                <div className="flex single-task-content sub-task items-center gap-2 justify-between">
                    <TaskName task={subtask && subtask} taskId={subtask && subtask.id} view='cardView' isSubtask nameOfTask={subtask && subtask.name ? subtask.name : "Untitled Subtask"} />
                    <div className="flex items-center gap-2">
                        <TaskDueDate taskId={subtask && subtask.id} dueDate={subtask && subtask.end_date ? subtask.end_date : null}/>
                        <TaskAssignTo
                            taskId={subtask && subtask.id}
                            view='cardView'
                            assigned={subtask && subtask.assigned_to ? subtask.assigned_to : null}
                            assignedMember={(props) => {
                              console.log('')
                            }}/>
                    </div>
                </div>  
            </div>

            ) : ( 
                
            <div onDoubleClickCapture={()=>{handleEditSubTaskDrawerOpen()}} className="sabtask pl-[5px]" >
                <div className="single-task-content sub-task py-1.5">
                  <Grid columns={24}>
                    <Grid.Col className={`flex items-center w-full !py-0 !pl-0`} span={6.2}>
                      <div className="flex gap-4 items-center w-full">
                        <TaskName task={subtask && subtask} taskId={subtask && subtask.id} isSubtask nameOfTask={subtask && subtask.name ? subtask.name : "Untitled Subtask"} />
                      </div>
                    </Grid.Col>
                    <Grid.Col className={`assign-to flex items-center w-full !py-0`} span={2.3}>
                      <div onClick={(e) => e.stopPropagation()}>
                        <TaskAssignTo
                            taskId={subtask && subtask.id}
                            assigned={subtask && subtask.assigned_to ? subtask.assigned_to : null}
                            assignedMember={(props) => {
                              console.log('')
                            }}
                        />
                      </div>
                    </Grid.Col>
                    <Grid.Col className={`following flex items-center justify-center !py-0`} span={2.3}>
                      <div onClick={(e) => e.stopPropagation()} >
                        <TaskFollower taskId={subtask && subtask.id} followers={subtask && subtask.members ? subtask.members : null} editHandler={(props) => {
                          console.log('')
                        }}/>
                      </div>
                    </Grid.Col>
                    <Grid.Col className={`due-date flex items-center w-full !py-0`} span={2.35}>
                      <div className={`w-full`} onClick={(e) => e.stopPropagation()} >
                        <div className={`w-full flex items-start justify-center`}>
                          <TaskDueDate taskId={subtask && subtask.id} dueDate={subtask && subtask.end_date ? subtask.end_date : null}/>
                        </div>
                      </div>
                    </Grid.Col>
                    <Grid.Col className={`priority flex items-center w-full !py-0`} span={2.35}>
                      <div className="pl-1 w-full flex justify-center" onClick={(e) => e.stopPropagation()}>
                        <TaskPriority taskId={subtask && subtask.id} priority={subtask && subtask.priority ? subtask.priority : null}/>
                      </div>
                    </Grid.Col>
                    <Grid.Col className={`tags flex items-center w-full !py-0 !pl-10`} span={7.35}>
                      <div className={`w-full flex items-center`} onClick={(e) => e.stopPropagation()}>
                        <TaskTag taskId={subtask && subtask.id} taskTags={subtask && subtask.tags ? subtask.tags : null} />
                      </div>
                    </Grid.Col>
                    <Grid.Col className={`w-full flex items-center justify-end !pr-0`} span={1}>
                      <TaskDelete task={subtask} taskId={subtask && subtask.id} isSubtask />
                    </Grid.Col>

                  </Grid>

                </div>
            </div>
            
        )}

      {subTaskEditDrawerOpen && <EditTaskDrawer taskObj={subtask} taskId={subtask && subtask.id} taskEditDrawerOpen={subTaskEditDrawerOpen} openTaskEditDrawer={openSubTaskEditDrawer} closeTaskEditDrawer={closeSubTaskEditDrawer} />}

    </>
  );
};

export default SubtaskContent;
