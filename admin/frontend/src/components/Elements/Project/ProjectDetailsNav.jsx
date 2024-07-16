import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {Avatar, Button, Dialog, Group, Popover, ScrollArea, Text, Title, Tooltip} from '@mantine/core';
import {useLocation, NavLink, Link, useParams} from 'react-router-dom';
import {IconFilter, IconPlus, IconX} from '@tabler/icons-react';
import UsersAvatarGroup from "../../ui/UsersAvatarGroup";
import {editProject} from "../../Settings/store/projectSlice";
import {updateBoardMembers} from "../../Settings/store/taskSlice";
const ProjectDetailsNav = () => {
    const location = useLocation();
    const usersData = useSelector((state) => state.users);
    const {boardMembers, projectInfo } = useSelector((state) => state.settings.task);

    const dispatch = useDispatch();
    const {id} = useParams();

    const listPagePathName = `/project/task/list/${id}`;
    const boardPagePathName = `/project/task/board/${id}`;

    const [selectedMembers, setSelectedMembers] = useState(boardMembers || []);

    const handleAssignButtonClick = (member) => {
        // Toggle between assigning and removing a member
        var updatedMembers = [];
        const index = selectedMembers.findIndex((selectedMember) => parseInt(selectedMember.id) === parseInt(member.id));
        if (index === -1) {
            const assignAfterMembers = [...selectedMembers, member];
            updatedMembers = assignAfterMembers;

            setSelectedMembers(assignAfterMembers);
        } else {
            const deletedAfterMembers = selectedMembers.filter((selectedMember) => parseInt(selectedMember.id) !== parseInt(member.id));
            updatedMembers = deletedAfterMembers;

            setSelectedMembers(deletedAfterMembers);
        }

        if (id && id !== 'undefined' && updatedMembers) {
            dispatch(editProject({id: id, data: {'members': updatedMembers}}));
            dispatch(updateBoardMembers(updatedMembers));
        }
    };

    useEffect(() => {
        setSelectedMembers(boardMembers || []);
    }, [projectInfo]);

    return (
        <>
            <div className="relative flex justify-between items-center">
                {/*<h2 className="text-2xl font-semibold">
                    {projectInfo && projectInfo.name}
                </h2>*/}
                <div className='mt-2 mb-3'>
                    <Title order={4}>
                        {projectInfo && projectInfo.name}
                    </Title>
                </div>
                <Link to="/project" className="text-gray-600 hover:text-gray-800 focus:shadow-none">
                    <IconX size={24} color="#202020"/>
                </Link>
            </div>

            <div className="relative flex justify-between items-center">
                <div className="relative flex mb-3 space-x-3">
                    <NavLink to={`/project/task/list/${id}`} className="nav-link" activeClassName="active-link">
                        <Button 
                            size="sm"
                            color={location.pathname === listPagePathName ? "#39758D" : "#EBF1F4"}
                            styles={{
                                label: {
                                    color: location.pathname === listPagePathName ? "#fff" : "#000"
                                }
                            }}
                        >
                            List
                        </Button>
                    </NavLink>
                    <NavLink to={`/project/task/board/${id}`} className="nav-link" activeClassName="active-link">
                        <Button 
                            size="sm"
                            color={location.pathname === boardPagePathName ? "#39758D" : "#EBF1F4"}
                            styles={{
                                label: {
                                    color: location.pathname === boardPagePathName ? "#fff" : "#000"
                                }
                            }}
                        >
                            Board
                        </Button>
                    </NavLink>
                    <NavLink to="" className="nav-link" activeClassName="active-link">
                        <Button size="sm" color={"#EBF1F4"} styles={{label: { color: "#c2c2c2" } }} disabled>
                            Calender
                        </Button>
                    </NavLink>
                    <NavLink to="" className="nav-link" activeClassName="active-link">
                        <Button size="sm" color={"#EBF1F4"} styles={{label: { color: "#c2c2c2" } }} disabled>
                            Gantt chart
                        </Button>
                    </NavLink>
                    <NavLink to="" className="nav-link" activeClassName="active-link">
                        <Button size="sm" color={"#EBF1F4"} styles={{label: { color: "#c2c2c2" } }} disabled>
                            Swimlane
                        </Button>
                    </NavLink>
                </div>

                <div className="relative filterandusers flex items-center gap-4 mb-3">
                    <Button 
                        variant="filled" 
                        color="#39758D"
                        style={{
                            width: '40px',
                            padding: '5px', 
                        }}
                        >
                        <IconFilter />
                    </Button>
                    <div className="flex gap-1">
                        <UsersAvatarGroup users={boardMembers} size={40} maxCount={50} />
                        <Popover height={150}  position="bottom" withArrow shadow="md">
                            <Popover.Target>
                                <Tooltip label="Add Member">
                                    <Avatar
                                        // onClick={onAddMember}
                                        size={40}
                                        bg="#ED7D31"
                                        color="#fff"
                                    >
                                        <IconPlus className=' hover:scale-110' size={20}/>
                                    </Avatar>
                                </Tooltip>
                            </Popover.Target>
                            <Popover.Dropdown>

                                <ScrollArea className="h-[290px]" scrollbarSize={5}>
                                    <div className="p-0">
                                        <Text size="sm" fw={700} c="#202020">{projectInfo.parent && projectInfo.parent.members && projectInfo.parent.members.length>0 ? projectInfo.parent.members.length: 0 } people available</Text>
                                        <div className="mt-3">
                                            {projectInfo.parent && projectInfo.parent.members && projectInfo.parent.members.length > 0 && projectInfo.parent.members.map((member) => (
                                                <div key={member.id} className="ml-single flex items-center border-b border-solid border-[#C2D4DC] py-1 justify-between">
                                                    <Avatar src={member.avatar} size={40} radius={32} />
                                                    <div className="mls-ne ml-3 w-[115px]">
                                                        <Text size="sm" fw={700} c="#202020">{member.name}</Text>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAssignButtonClick(member)}
                                                        className={`rounded-[25px] h-[32px] px-2 py-0 w-[70px] ml-3 ${selectedMembers.some((selectedMember) => parseInt(selectedMember.id) === parseInt(member.id)) ? 'bg-[#f00]' : 'bg-[#39758D]'}`}
                                                    >
                                                        <Text size="sm" fw={400} c="#fff">
                                                            {selectedMembers.some((selectedMember) => parseInt(selectedMember.id) === parseInt(member.id) ) ? 'Remove' : 'Assign'}
                                                        </Text>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </ScrollArea>

                            </Popover.Dropdown>
                        </Popover>
                    </div>

                </div>
            </div>
            
        </>
        
    );
}

export default ProjectDetailsNav;
