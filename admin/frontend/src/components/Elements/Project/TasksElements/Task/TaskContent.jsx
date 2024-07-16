import React, {Fragment, useState} from 'react';
import { ReactSortable } from 'react-sortablejs'; 
import SubtaskContent from './SubtaskContent';
import MainTask from './MainTask';
import { useSelector, useDispatch } from 'react-redux';
import {createTask} from "../../../../Settings/store/taskSlice";
import {Draggable, Droppable} from "react-beautiful-dnd";
const TaskContent = ({ view, taskData }) => {
    const dispatch = useDispatch();
    const { childColumns } = useSelector((state) => state.settings.task);
    const [subtasks, setSubtasks] = useState(childColumns && childColumns[taskData.slug] && childColumns[taskData.slug].length?[...Array(childColumns[taskData.slug].length).keys()]:[]);
    const {loggedUserId} = useSelector((state) => state.auth.user)

    const addSubtask = () => {
      setSubtasks([...subtasks, subtasks.length]);

      const newTaskData = {
          name: 'Type task name here',
          parent: taskData,
          task_section_id: taskData.task_section_id,
          project_id: taskData.project_id,
          type:'sub-task',
          created_by: loggedUserId,
          status: 'ACTIVE'
      }
      dispatch(createTask(newTaskData));
    };

  const onSortEnd = (sortedList) => {
    setSubtasks(sortedList);
  };
  
  return (
    <Fragment>
      {view === 'cardView' ? (
        <div className="full-project-tasks flex-col shadow-md m-4 p-3 rounded-md border border-1 border-[#efefef] gap-3">  
          <MainTask view='cardView' addSubtask={addSubtask} task={taskData}/>
            <Droppable
                key={taskData.id}
                droppableId={taskData.slug}
                type='SUBTASK'
            >
                {(dropProvided, snapshot) => (
                    <div
                        style={{ transition: 'background-color 0.3s ease' }}
                        className="w-full h-full min-h-[25px]"
                        ref={dropProvided.innerRef}
                        {...dropProvided.droppableProps}
                    >
                        {childColumns && childColumns[taskData.slug] && childColumns[taskData.slug].length > 0 && childColumns[taskData.slug].map((subTask, subtaskIndex) => (
                            <Draggable
                                key={subTask.id}
                                draggableId={subTask.id.toString()}
                                index={subtaskIndex}
                            >
                                {(dragProvided) => (
                                    <div
                                        key={subtaskIndex}
                                        className='my-2 single-task'
                                        ref={dragProvided.innerRef}
                                        {...dragProvided.draggableProps}
                                        {...dragProvided.dragHandleProps}
                                    >
                                        <SubtaskContent taskData={taskData}  key={subtaskIndex} subtask={subTask} view='cardView'/>
                                    </div>
                                )}

                            </Draggable>
                        ))}
                        {dropProvided.placeholder}
                    </div>
                )}

            </Droppable>
        </div>
        ) : ( 
          <div className="full-project-tasks">
            <MainTask addSubtask={addSubtask} task={taskData}/>
              <Droppable
                  key={taskData.id}
                  droppableId={taskData.slug}
                  type='SUBTASK'
              >
                  {(dropProvided, snapshot) => (
                      <div
                          style={{ transition: 'background-color 0.3s ease' }}
                          className="w-full h-full min-h-[15px]"
                          ref={dropProvided.innerRef}
                          {...dropProvided.droppableProps}
                      >
                          {childColumns && childColumns[taskData.slug] && childColumns[taskData.slug].length > 0 && childColumns[taskData.slug].map((subTask, subtaskIndex) => (
                              <Draggable
                                  key={subTask.id}
                                  draggableId={subTask.id.toString()}
                                  index={subtaskIndex}
                              >
                                  {(dragProvided) => (
                                      <div
                                          key={subtaskIndex}
                                          className='mb-2 single-task'
                                          ref={dragProvided.innerRef}
                                          {...dragProvided.draggableProps}
                                          {...dragProvided.dragHandleProps}
                                      >
                                          <SubtaskContent taskData={taskData}  key={subtaskIndex} subtask={subTask}/>

                                      </div>
                                  )}

                              </Draggable>
                          ))}
                          {dropProvided.placeholder}
                      </div>
                  )}

              </Droppable>

          </div>
          
        )}
    </Fragment>
  );
};

export default TaskContent;
