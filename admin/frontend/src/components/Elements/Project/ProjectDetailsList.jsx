import React, {Fragment} from 'react';
import TaskList from './TasksElements/TaskList';
import {Grid, LoadingOverlay, ScrollArea, Text} from "@mantine/core";
import {useSelector} from "react-redux";

const ProjectDetailsList = (props) => {

    const { isLoading } = useSelector((state) => state.settings.task);

    return (
        <Fragment>
            <div className="border rounded-t-lg px-2 py-1 bg-[#39758D] !pl-[25px]">
                <Grid gutter="0" columns={24}>
                    <Grid.Col span={22}>
                        <Grid columns={24}>
                            <Grid.Col span={7}>
                                <Text c={`#ffffff`} className={`!pl-[30px]`} fz="md" fw={700}>Task Title</Text>
                            </Grid.Col>
                            <Grid.Col span={2.5}>
                                <Text c={`#ffffff`} className={`!pl-[0px]`} fz="md" fw={700}>Assigned</Text>
                            </Grid.Col>
                            <Grid.Col span={2.5}>
                                <Text c={`#ffffff`} ta="center" fz="md" fw={700}>Following</Text>
                            </Grid.Col>
                            <Grid.Col span={2.5}>
                                <Text c={`#ffffff`} ta="center" fz="md" fw={700}>Due Date</Text>
                            </Grid.Col>
                            <Grid.Col span={2.5}>
                                <Text c={`#ffffff`} ta="center" fz="md" fw={700}>Priority</Text>
                            </Grid.Col>
                            <Grid.Col span={7} className="!pl-10">
                                <Text c={`#ffffff`} fz="md" fw={700}>Tags</Text>
                            </Grid.Col>
                        </Grid>

                    </Grid.Col>
                </Grid>

            </div>
            <ScrollArea scrollbars={`y`} className="h-[calc(100vh-300px)] pb-[1px] !pr-1" scrollbarSize={4}>
                <LoadingOverlay
                    visible={isLoading}
                    zIndex={1000}
                    overlayProps={{ radius: 'sm', blur: 4 }}
                />
                <div className="relative w-full pt-4">
                    <TaskList/>
                </div>
            </ScrollArea>
        </Fragment>
    );
}

export default ProjectDetailsList;
