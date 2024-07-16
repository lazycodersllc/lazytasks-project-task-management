import React, {useState, useEffect, Fragment, useRef} from 'react';
import { Accordion } from '@mantine/core';
import { IconGripVertical } from '@tabler/icons-react';
import { useSelector, useDispatch } from 'react-redux';
import {
  createTaskSection,
  editSectionSortOrder, editTaskSortOrder,
  fetchTasksByProject, updateChildColumns, updateColumns,
  updateOrdered
} from "../../../Settings/store/taskSlice";
import TaskSectionName from "./Task/TaskSectionName";
import TaskName from "./Task/TaskName";
import {DragDropContext, Draggable, Droppable} from "react-beautiful-dnd";
import {reorder, reorderQuoteMap} from "./utils";
import TaskListContent from "./TaskListContent";

const TaskList = () => {
  // const tasks = useSelector(state => state.task);
const dispatch = useDispatch();
  const {loggedUserId} = useSelector((state) => state.auth.user)

const {projectInfo, tasks, columns, ordered, taskListSections, childColumns} = useSelector((state) => state.settings.task);
  const contentEditableRef = useRef('');


  const [expandedItems, setExpandedItems] = useState([]); // Initialize with an empty array
// console.log(expandedItems, ordered)
  const [accordionItems, setAccordionItems] = useState([]);
  useEffect(() => {
    if (tasks && taskListSections) {
      const transformedItems = Object.entries(taskListSections).map(([key, value]) => ({
        value: key,
        title: value.name,
      })
      );
      setAccordionItems(transformedItems);
      // Set all accordion items as expanded
      setExpandedItems(transformedItems.map(item => item.value));
    }
  }, [ordered]);
  
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleToggle = (itemValue) => {
    if (!expandedItems.includes(itemValue)) {
      setExpandedItems([...expandedItems, itemValue]);
    } else {
      setExpandedItems(expandedItems.filter((value) => value !== itemValue));
    }
  };

  const handleTitleChange = (e, itemValue) => {
    const newAccordionItems = accordionItems.map((item) => {
      if (item.value === itemValue) {
        return { ...item, title: e.target.value };
      }
      return item;
    });
    console.log(e.target.value, itemValue)
    setAccordionItems(newAccordionItems);
  };

  const handleAddSection = () => {
    const newItemValue = `untitle-section-${accordionItems.length + 1}`;
    const newItem = {
      value: newItemValue,
      title: `Type section name here`,
    };
    setAccordionItems([...accordionItems, newItem]);
    setExpandedItems([...expandedItems, newItemValue]);

   const newSection = {
     name: 'Type section name here',
     project_id: projectInfo.id,
     sort_order: ordered.length + 1,
     created_by: loggedUserId
   }

    dispatch(createTaskSection(newSection))
  };

  const onDragEnd = (result) => {
    console.log(result)

    if (!result.destination) {
      return
    }

    const source = result.source
    const destination = result.destination

    if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
    ) {
      return
    }

    if (result.type === 'COLUMN') {
      const newOrdered = reorder(ordered, source.index, destination.index)

      const submittedData = {
        orderedList: newOrdered,
        project_id: projectInfo.id,
        updated_by: loggedUserId
      }
      dispatch(editSectionSortOrder({data:submittedData}))
      dispatch(updateOrdered(newOrdered))
      return
    }
    if(result.type === 'SUBTASK'){
      const data = reorderQuoteMap({
        quoteMap: childColumns,
        source,
        destination,
      })
      // console.log(data.quoteMap)
      const updateColumnData = {
        ...childColumns,
        ...data.quoteMap,
      }
      const combineUpdateChildData = {
        ...result,
        updateColumnData
      }

      const submittedData = {
        orderedList: combineUpdateChildData,
        project_id: projectInfo.id,
        updated_by: loggedUserId
      }

      dispatch(editTaskSortOrder({data:submittedData}))
      dispatch(updateChildColumns(updateColumnData))
      return
    }
    const data = reorderQuoteMap({
      quoteMap: columns,
      source,
      destination,
    })
    // console.log(data.quoteMap)
    const updateColumnData = {
      ...columns,
      ...data.quoteMap,
    }
    const combineUpdateData = {
      ...result,
      updateColumnData
    }

    const submittedData = {
      orderedList: combineUpdateData,
      project_id: projectInfo.id,
      updated_by: loggedUserId
    }

    dispatch(editTaskSortOrder({data:submittedData}))
    dispatch(updateColumns(updateColumnData))
  };

  return (
    <Fragment>
      <Accordion variant="separated" multiple={true} value={expandedItems} onChange={setExpandedItems}>

        <DragDropContext onDragEnd={(result) => onDragEnd(result)}>
          <Droppable
              droppableId="droppable"
              type="COLUMN"
          >
            {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>

                  {ordered && ordered.length > 0 && ordered.map((taskListSection, index) => (
                      <Draggable key={taskListSection} draggableId={taskListSection} index={index}>
                        {(provided, snapshot) => (
                            <Accordion.Item
                                key={taskListSection}
                                value={taskListSections && taskListSections[taskListSection] && taskListSections[taskListSection].slug}
                                className="!border-solid !border-[#dddddd] !rounded-t-md accordion-item !bg-[#fcfcfc]"
                                expanded={expandedItems.includes(taskListSection)}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                            >
                              <div {...provided.dragHandleProps} className="flex items-center border-b border-solid border-[#dddddd]" >
                                <IconGripVertical size="16" className="pl-2 px-1 w-[30px] mt-[2px] cursor-move" />
                                <Accordion.Control
                                    className="!bg-[#fcfcfc] font-bold py-3 pr-3 !pl-0"
                                >
                                  <TaskSectionName
                                      taskSectionId={taskListSections[taskListSection] && taskListSections[taskListSection].id}
                                      nameOfTaskSection={taskListSections[taskListSection] && taskListSections[taskListSection].name}
                                  />
                                </Accordion.Control>
                              </div>
                              <Accordion.Panel>
                                <TaskListContent
                                    className={snapshot.isDragging ? 'is-dragging' : ''}
                                    listType="CONTENT"
                                    snapshot={snapshot}
                                    ref={provided.innerRef}
                                    view="listView"
                                    projectId={projectInfo.id}
                                    taskSection={taskListSection}
                                    taskSectionId={taskListSections[taskListSection] && taskListSections[taskListSection].id}
                                    contents={columns && columns && columns[taskListSection] ? columns[taskListSection]:[]}
                                />
                              </Accordion.Panel>
                            </Accordion.Item>
                        )}
                      </Draggable>

                  ))}
                  {provided.placeholder}
                </div>
            )}
          </Droppable>
        </DragDropContext>
      </Accordion>
      <button
        className="rounded-md border border-solid border-[#dddddd] px-4 py-2 mt-4 w-full"
        onClick={handleAddSection}
      >
        <span className="text-sm font-medium text-[#ED7D31]">+ Add Section</span>
      </button>
    </Fragment>
  );
};

export default TaskList;
