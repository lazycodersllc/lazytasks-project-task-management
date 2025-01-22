import React, {useState, useEffect, Fragment, useRef} from 'react';
import {
    ActionIcon,
    Button,
    Input,
    Menu,
    rem,
    ScrollArea,
    Textarea,
    TextInput,
    Title,
    Text,
    Card, Group, Table
} from '@mantine/core';
import { useSelector, useDispatch } from 'react-redux';
import {createQuickTask} from "../Settings/store/quickTaskSlice";
import dayjs from "dayjs";
import {IconCalendar, IconDeviceFloppy, IconEdit} from "@tabler/icons-react";
import {Link} from "react-router-dom";

const TaskListContent = ({ tasks, header }) => {

    return (
        <ScrollArea className="relative h-[250px] pb-[30px]" scrollbarSize={4}>
            <div className="">
                {tasks && tasks.length > 0 && tasks.map((task, index) => (
                    <div className={`${index % 2 === 0?'bg-[#f8f9fa]':''}`}>
                        <div className="content px-2 py-2">
                            <Text fz="sm">{task.name}</Text>
                            {/*<h4 className="text-lg">{task.name}</h4>*/}
                        </div>
                    </div>
                ))
                }

            </div>
            {tasks && tasks.length > 5 &&
                <div className="absolute bottom-0 right-1 bg-white">
                    <Link to={`/my-task`}>
                        <Button color="#ED7D31" radius="xl" size="compact-xs">
                            More...
                        </Button>
                    </Link>
                </div>
            }
        </ScrollArea>
    );
};

export default TaskListContent;
