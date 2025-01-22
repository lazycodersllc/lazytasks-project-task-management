import React, {useState, useEffect, Fragment, useRef} from 'react';
import {
    ActionIcon,
    Button, Card, Group,
    Input,
    Menu,
    rem,
    ScrollArea, Table,
    Textarea,
    TextInput,
    Title,
    useMantineTheme
} from '@mantine/core';
import { useSelector, useDispatch } from 'react-redux';
import {BarChart} from "@mantine/charts";

const DashboardBarChart = ({slug, header}) => {
    const {userProjects} = useSelector((state) => state.settings.myTask);
    return (
        <Card withBorder radius="sm">
            <Card.Section withBorder inheritPadding py="xs" className="bg-[#FDFDFD]">
                <Group>
                    {/*<IconGripVertical size="20" />*/}
                    <Title order={6}>Project Summery Chart</Title>
                </Group>
            </Card.Section>

            <Card.Section px="xs" pt="xs">
                <BarChart
                    h={252}
                    data={userProjects}
                    dataKey="name"
                    type="stacked"
                    withLegend
                    legendProps={{ verticalAlign: 'bottom', height: 50 }}
                    fillOpacity={1}
                    series={[
                        // { name: 'TOTAL', color: 'violet.6' },
                        { name: 'ACTIVE', color: '#ED7D31' },
                        { name: 'COMPLETED', color: '#39758D' },
                    ]}
                />
            </Card.Section>
        </Card>
  );
};

export default DashboardBarChart;
