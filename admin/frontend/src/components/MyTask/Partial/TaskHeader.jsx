import React from 'react';
import {Text, Title} from '@mantine/core';

const TaskHeader = () => {


  return (
      <div className="border rounded-lg mt-1 px-2 py-1 bg-blue-100">
        <div className="flex">
          <div className="text-base font-medium w-[30%]">
            <Text fz="sm">Task Name</Text>
          </div>
          <div className="text-base font-medium w-[10%] flex">
            <Text fz="sm">Assigned</Text>
          </div>
          <div className="text-base font-medium w-[12%] flex justify-center">
            <Text fz="sm">Following</Text>
          </div>
          <div className="text-base font-medium w-[10%] flex justify-center">
            <Text fz="sm">Due Date</Text>
          </div>
          <div className="text-base font-medium w-[10%] flex justify-center">
            <Text fz="sm">Priority</Text>
          </div>
          <div className="text-base font-medium w-[28%] flex pl-5">
            <Text fz="sm">Tags</Text>
          </div>
        </div>
      </div>
  );
};

export default TaskHeader;
