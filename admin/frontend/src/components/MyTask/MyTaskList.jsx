import React, {useState, useEffect, Fragment, useRef} from 'react';
import {Accordion, ScrollArea, Tabs} from '@mantine/core';
import { useSelector, useDispatch } from 'react-redux';
import {IconGripVertical} from "@tabler/icons-react";
import MyTaskListContent from "./MyTaskListContent";
import {updateColumns} from "../Settings/store/myTaskSlice";
import TaskHeader from "./Partial/TaskHeader";

const MyTaskList = () => {
const dispatch = useDispatch();

const {userTaskOrdered, userTaskListSections, userTaskColumns} = useSelector((state) => state.settings.myTask);
  const contentEditableRef = useRef('');
  const [expandedItems, setExpandedItems] = useState([]); // Initialize with an empty array
  const [accordionItems, setAccordionItems] = useState([]);
  useEffect(() => {
    if ( userTaskListSections ) {
      const transformedItems = Object.entries(userTaskListSections).map(([key, value]) => ({
        value: key,
        title: value,
      })
      );
      setAccordionItems(transformedItems);
      // Set all accordion items as expanded
      setExpandedItems(transformedItems.map(item => item.value));
    }
  }, [userTaskOrdered]);

  useEffect(() => {
    dispatch(updateColumns(userTaskColumns))
  }, [userTaskColumns]);


  return (
    <Fragment>
      <Tabs color="#39758D" variant="pills" radius="sm" defaultValue="today">
        <Tabs.List className="mb-3">
          {userTaskOrdered && userTaskOrdered.length > 0 && userTaskOrdered.map((taskListSection, index) => (
              <Tabs.Tab value={taskListSection} className="font-bold">
                  {userTaskListSections && userTaskListSections[taskListSection] && userTaskListSections[taskListSection]}
              </Tabs.Tab>
          ))}
        </Tabs.List>
        {userTaskOrdered && userTaskOrdered.length > 0 && userTaskOrdered.map((taskListSection, index) => (
            <Tabs.Panel value={taskListSection}>
              <TaskHeader />
              <ScrollArea className="h-[calc(100vh-260px)] p-[3px]" scrollbarSize={4}>
                {/*<LoadingOverlay
                                    visible={taskReload}
                                    zIndex={1000}
                                    overlayProps={{ radius: 'xs', blur: 1 }}
                                    loaderProps={{ color: 'red', type: 'bars' }}
                                />*/}
                <MyTaskListContent
                    contents={userTaskColumns && userTaskColumns[taskListSection] ? userTaskColumns[taskListSection]:[]}
                />
              </ScrollArea>

            </Tabs.Panel>
        ))}

      </Tabs>
      {/*<Accordion variant="separated" multiple={true} value={expandedItems} onChange={setExpandedItems}>
        {userTaskOrdered && userTaskOrdered.length > 0 && userTaskOrdered.map((taskListSection, index) => (
            <Accordion.Item
                value={taskListSection}
                className="!border-solid !border-[#dddddd] !rounded-t-md accordion-item !bg-[#fcfcfc]"
                expanded={expandedItems.includes(taskListSection)}
            >
              <div className="items-center border-b border-solid border-[#dddddd]">
                <Accordion.Control className="!bg-[#fcfcfc] font-bold">{userTaskListSections && userTaskListSections[taskListSection] && userTaskListSections[taskListSection]} ({userTaskColumns && userTaskColumns[taskListSection] ? userTaskColumns[taskListSection].length:0})</Accordion.Control>
              </div>
              <Accordion.Panel>


              </Accordion.Panel>
            </Accordion.Item>
        ))}
      </Accordion>*/}

    </Fragment>
  );
};

export default MyTaskList;
