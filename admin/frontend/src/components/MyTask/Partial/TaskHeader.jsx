import React from 'react';
import { Text, Title } from '@mantine/core';

const TaskHeader = () => {


  return (
    <>
      <div className="border rounded-t-lg px-2 py-2 bg-[#39758D]">
        <div className="flex">
          <div className="text-base font-medium w-[30%]">
            <Text c={`#ffffff`} fz="md" fw={700}>Task Name</Text>
          </div>
          <div className="text-base font-medium w-[10%] flex">
            <Text c={`#ffffff`} fz="md" fw={700}>Assigned</Text>
          </div>
          <div className="text-base font-medium w-[12%] flex justify-center">
            <Text c={`#ffffff`} fz="md" fw={700}>Following</Text>
          </div>
          <div className="text-base font-medium w-[10%] flex justify-center">
            <Text c={`#ffffff`} fz="md" fw={700}>Due Date</Text>
          </div>
          <div className="text-base font-medium w-[10%] flex justify-center">
            <Text c={`#ffffff`} fz="md" fw={700}>Priority</Text>
          </div>
          <div className="text-base font-medium w-[28%] flex justify-center">
            <Text c={`#ffffff`} fz="md" fw={700}>Tags</Text>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskHeader;
