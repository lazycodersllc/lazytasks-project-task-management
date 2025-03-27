import React from 'react';
import {Flex, LoadingOverlay, ScrollArea} from "@mantine/core";
import TaskCalendar from "./TasksElements/TaskCalendar";
import {useSelector} from "react-redux";

const ProjectDetailsCalendar = () => {
    const { isLoading } = useSelector((state) => state.settings.task);

  return (
      <ScrollArea className="h-[calc(100vh-270px)] pb-[2px]" scrollbarSize={5} offsetScrollbars>
          <LoadingOverlay
              visible={isLoading}
              zIndex={1000}
              overlayProps={{ radius: 'sm', blur: 4 }}
          />
          <Flex justify="center" align="center" className="w-full h-full">
              <div className="relative items-center w-11/12 pt-2">
                  <TaskCalendar/>
              </div>
          </Flex>
      </ScrollArea>
  );
};

export default ProjectDetailsCalendar;
