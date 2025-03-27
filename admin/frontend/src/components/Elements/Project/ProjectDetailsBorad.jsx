import React from 'react';
import TaskBoard from "./TasksElements/TaskBoard";
import {LoadingOverlay, ScrollArea} from "@mantine/core";
import {useSelector} from "react-redux";

const ProjectDetailsBoard = () => {

    const { isLoading } = useSelector((state) => state.settings.task);

  return (
      <ScrollArea className="h-[calc(100vh-270px)] pb-[2px]" scrollbarSize={8}>
          <LoadingOverlay
              visible={isLoading}
              zIndex={1000}
              overlayProps={{ radius: 'sm', blur: 4 }}
          />
      <div className="relative w-full pt-2">
          <TaskBoard/>
      </div>
      </ScrollArea>
  );
};

export default ProjectDetailsBoard;
