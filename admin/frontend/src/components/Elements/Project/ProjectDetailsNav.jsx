import React, {Fragment, useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    ActionIcon,
    Avatar,
    Breadcrumbs,
    Button, Card,
    Dialog,
    Flex, Grid,
    Group, List, Pill,
    Popover,
    ScrollArea,
    Text, TextInput,
    Title,
    Tooltip
} from '@mantine/core';
import { useLocation, NavLink, Link, useParams, useNavigate } from 'react-router-dom';
import {
    IconArrowLeft, IconCaretDownFilled, IconCheck,
    IconChevronDown,
    IconChevronRight,
    IconChevronsRight,
    IconFilter,
    IconPlus, IconRefresh, IconSearch,
    IconX
} from '@tabler/icons-react';
import UsersAvatarGroup from "../../ui/UsersAvatarGroup";
import { editProject } from "../../Settings/store/projectSlice";
import { fetchTasksByProject, updateBoardMembers, updateIsLoading } from "../../Settings/store/taskSlice";
import { hasPermission } from "../../ui/permissions";
import {createUser, fetchAllMembers} from "../../../store/auth/userSlice";
import UserAvatarSingle from "../../ui/UserAvatarSingle";
import {modals} from "@mantine/modals";
import {editLazytasksConfig} from "../../Settings/store/settingSlice";
import {showNotification} from "@mantine/notifications";
const ProjectDetailsNav = () => {
    const location = useLocation();
    const navigate = useNavigate()

    const { loggedUserId } = useSelector((state) => state.auth.user);
    const { loggedInUser } = useSelector((state) => state.auth.session)

    const usersData = useSelector((state) => state.users);
    const { boardMembers, projectInfo } = useSelector((state) => state.settings.task);
    const {tasks} = useSelector((state) => state.settings.task)

    const [ isOpenedMemberPopover, setIsOpenedMemberPopover ] = useState(false);

    useEffect(() => {
        //isOpenedMemberPopover is true
        if ( isOpenedMemberPopover ) {
            console.log('ok')
            dispatch(fetchTasksByProject({ id: id } ))
            dispatch(fetchAllMembers())
        }
    }, [isOpenedMemberPopover]);

    const [isEmailValid, setIsEmailValid] = useState(false);

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const {allMembers} = useSelector((state) => state.auth.user);
    const [searchValue, setSearchValue] = useState('');

    const [ filteredMembers, setFilteredMembers ] = useState([]);

    useEffect(() => {
        if (allMembers && allMembers.length > 0) {
            const filtered = allMembers.filter(
                (member) =>
                    member.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                    member.email.toLowerCase().includes(searchValue.toLowerCase())
            );
            setFilteredMembers(filtered);
        } else {
            setFilteredMembers([]);
        }
    }, [allMembers, searchValue]);
    const handleSearchInputChange = (e) => {
        const inputValue = e.target.value;
        setSearchValue(inputValue);
        setIsEmailValid(validateEmail(inputValue));
    };
    const dispatch = useDispatch();
    const { id } = useParams();

    const listPagePathName = `/project/task/list/${id}`;
    const boardPagePathName = `/project/task/board/${id}`;
    const calendarPagePathName = `/project/task/calendar/${id}`;

    const [selectedMembers, setSelectedMembers] = useState(boardMembers || []);

    const [addedMembers, setAddedMembers] = useState(boardMembers && boardMembers.length>0 ? boardMembers.map((member) => member.id):[]);


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
            dispatch(editProject({ id: id, data: { 'members': updatedMembers, 'updated_by': loggedUserId } })).then((response) => {

                if (response.payload.status === 200) {
                    console.log(response.payload.data.members)
                    dispatch(updateBoardMembers( response.payload.data.members||[] ));
                    setSelectedMembers( response.payload.data.members||[] );
                    setAddedMembers( response.payload.data.members && response.payload.data.members.length > 0 ? response.payload.data.members.map((member) => member.id):[] );

                }

            });
        }
    };
    const handleRemoveButtonClick = (member) => {

        const isMemberAssignedToTask = tasks && tasks.allTasks && Object.values(tasks.allTasks).length>0 && Object.values(tasks.allTasks).some((task) => task.assignedTo_id === member.id.toString());
        const isMemberAssignedToSubTask = tasks && tasks.allTasks && Object.values(tasks.allTasks).length>0 && Object.values(tasks.allTasks).some((task) => task.children && task.children.length>0 && task.children.some((subtask) => subtask.assignedTo_id === member.id.toString()));
        if(isMemberAssignedToTask || isMemberAssignedToSubTask){
            modals.open({
                withCloseButton: false,
                centered: true,
                children: (
                    <Fragment>
                        <Text size="sm">
                            This member is assigned to a task. Please reassign the task before removing the member.
                        </Text>

                        <div className="!grid w-full !justify-items-center">
                            <Button justify="center" onClick={() => {
                                setIsOpenedMemberPopover(true)
                                modals.closeAll()
                            }} mt="md">
                                Ok
                            </Button>
                        </div>
                    </Fragment>
                ),
            });

            return false;

        }

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
            dispatch(editProject({ id: id, data: { 'members': updatedMembers, 'updated_by': loggedUserId } })).then((response) => {

                if (response.payload.status === 200) {
                    console.log(response.payload.data.members)
                    dispatch(updateBoardMembers( response.payload.data.members||[] ));
                    setSelectedMembers( response.payload.data.members||[] );
                    setAddedMembers( response.payload.data.members && response.payload.data.members.length > 0 ? response.payload.data.members.map((member) => member.id):[] );

                }

            });
        }
    };

    useEffect(() => {
        setSelectedMembers(boardMembers || []);
        setAddedMembers( boardMembers && boardMembers.length>0 ? boardMembers.map((member) => member.id):[]);
    }, [projectInfo]);

    const goToTasksList = (id) => {
        // dispatch(fetchTasksByProject({ id: id }))
        navigate(`/project/task/list/${id}`)
    }
    //searchHandler
    const searchHandler = (e) => {

        const searchValue = e.target.value;
        // searchValue length is greater than 2
        dispatch(fetchTasksByProject({ id: id, data: { search: searchValue } }))

    }

    const handleRefresh = () => {
        dispatch(updateIsLoading(true))
    }
    const handleSendInvite = (email) => {

        const values= {
            email: email,
            loggedInUserId : loggedInUser ? loggedInUser.id : loggedUserId
        }
        dispatch(createUser(values)).then((response) => {
            if(response.payload && response.payload.status && response.payload.status === 200){
                const members = [...selectedMembers, response.payload.data]
                dispatch(editProject({id: projectInfo ? projectInfo.id : id, data: {'members': members, 'updated_by': loggedInUser ? loggedInUser.id : loggedUserId}})).then((res) => {
                    if(res.payload && res.payload.status && res.payload.status === 200){
                        dispatch(updateBoardMembers( res.payload.data.members||[] ));
                        setIsOpenedMemberPopover(false)
                        setSearchValue('')
                    }
                });


                showNotification({
                    id: 'load-data',
                    loading: true,
                    title: 'User',
                    message: response.payload && response.payload.message && response.payload.message,
                    autoClose: 2000,
                    disallowClose: true,
                    color: 'green',
                });
            }
        });
    }

    const projectCount = projectInfo?.parent?.projects?.length || 0;
    const cardHeight = 80;
    const maxVisibleCards = 3;

    const scrollAreaHeight = projectCount > maxVisibleCards
    ? cardHeight * maxVisibleCards
    : 'auto';


    return (
        <>
            <Grid className='mt-2 mb-3'>
                <Grid.Col span={10}>
                    <Breadcrumbs separator={<IconChevronRight size={20} stroke={1.25} />} separatorMargin="xs">
                        <Title order={4}>
                            {projectInfo && projectInfo.parent && projectInfo.parent.name}
                        </Title>
                        <Popover width={300} position="bottom-start" withArrow shadow="md" zIndex={1000}>
                            <Popover.Target>
                                <Flex className={`min-w-[200px] !justify-between border px-2 py-1 rounded-md cursor-pointer`}
                                    gap="md"
                                    justify={"space-between"}
                                    align="center">
                                    <Title order={4}>
                                        {projectInfo && projectInfo.name}

                                    </Title>
                                    <IconCaretDownFilled size={20} />
                                </Flex>
                            </Popover.Target>
                            <Popover.Dropdown>
                                <ScrollArea h={scrollAreaHeight} offsetScrollbars scrollbarSize={6}>

                                    {projectInfo && projectInfo.parent && projectInfo.parent.projects && projectInfo.parent.projects.length > 0 && projectInfo.parent.projects.map((project, index) => (

                                        <Card key={`${project.id}-${index}`} className='mb-2 mt-0 cursor-pointer' shadow="sm" radius="sm"
                                            withBorder
                                            bg={location && (location.pathname === '/project/task/list/' + project.id ||
                                                location.pathname === '/project/task/board/' + project.id ||
                                                location.pathname === '/project/task/calendar/' + project.id) ? '#F5F9FB' : 'white'}
                                            onClick={() => goToTasksList(project.id)}
                                            style={{ borderColor: '#39758d' }}
                                        >
                                            <div className="flex justify-between items-center -mt-1">
                                                <Text size="sm" weight={700}>{project.name}</Text>
                                                <Avatar.Group>
                                                    {/* <Avatar src="image.png" size={30}/> */}
                                                </Avatar.Group>
                                                <UsersAvatarGroup users={project.members} size={30} maxCount={2} />
                                            </div>

                                            <Group position="apart">
                                                <Flex align="center" gap="4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                        <circle cx="4" cy="4" r="4" fill="#F1975A" />
                                                    </svg>
                                                    <Text size="xs">{project.members && project.members.length} users engaged</Text>
                                                </Flex>
                                                <Flex align="center" gap="4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                        <circle cx="4" cy="4" r="4" fill="#39758D" />
                                                    </svg>
                                                    <Text size="xs">{project.total_tasks} task</Text>
                                                </Flex>
                                            </Group>
                                        </Card>


                                    ))}

                                </ScrollArea>

                            </Popover.Dropdown>
                        </Popover>

                    </Breadcrumbs>
                </Grid.Col>
                <Grid.Col span={2}>
                    <TextInput
                        rightSectionPointerEvents="none"
                        rightSection={<IconSearch size={24} />}
                        onChange={(e) => { searchHandler(e) }}
                        placeholder="Search..." />
                </Grid.Col>
            </Grid>


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
                    <NavLink to={`/project/task/calendar/${id}`} className="nav-link" activeClassName="active-link">
                        <Button
                            size="sm"
                            color={location.pathname === calendarPagePathName ? "#39758D" : "#EBF1F4"}
                            styles={{
                                label: {
                                    color: location.pathname === calendarPagePathName ? "#fff" : "#000"
                                }
                            }}
                        >
                            Calendar
                        </Button>
                    </NavLink>
                    <NavLink to="" className="nav-link" activeClassName="active-link">
                        <Tooltip className="!py-0 !text-[10px] !z-30" label="Coming soon" opened position="top" offset={-8} color={"#ED7D31"} size="xs">
                            <Button className="!text-sm" size="sm" color={"#EBF1F4"} styles={{ label: { color: "#c2c2c2" } }} disabled>
                                Gantt chart
                            </Button>
                        </Tooltip>

                    </NavLink>
                    <NavLink to="" className="nav-link" activeClassName="active-link">
                        <Tooltip className="!py-0 !text-[10px] !z-30" label="Coming soon" opened position="top" offset={-8} color={"#ED7D31"} size="xs">
                            <Button className="!text-sm" size="sm" color={"#EBF1F4"} styles={{ label: { color: "#c2c2c2" } }} disabled>
                                Swimlane
                            </Button>
                        </Tooltip>
                    </NavLink>
                </div>

                <div className="relative filterandusers flex items-center gap-4 mb-3">
                    <ActionIcon onClick={() => handleRefresh()} variant="white" color="yellow" radius="xs" aria-label="Refresh">
                        <IconRefresh size={24} stroke={1.5} />
                        {/*<IconAdjustments style={{ width: '70%', height: '70%' }} stroke={1.5} />*/}
                    </ActionIcon>
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
                        {hasPermission(loggedInUser && loggedInUser.llc_permissions, ['superadmin', 'admin', 'director', 'manager']) &&
                            <Popover height={150} position="bottom" withArrow shadow="md" opened={isOpenedMemberPopover} onChange={setIsOpenedMemberPopover}>
                                <Popover.Target>
                                    <Tooltip label="Add Member" position="top" withArrow>
                                        <Avatar
                                            onClick={ () => setIsOpenedMemberPopover( !isOpenedMemberPopover ) }
                                            // onClick={onAddMember}
                                            size={40}
                                            bg="#ED7D31"
                                            color="#fff"
                                            className={`cursor-pointer`}
                                        >
                                            <IconPlus className=' hover:scale-110' size={20} />
                                        </Avatar>
                                    </Tooltip>
                                </Popover.Target>
                                <Popover.Dropdown>
                                    <TextInput
                                        leftSection={<IconSearch size={16} />}
                                        placeholder="Quick search member"
                                        mb="sm"
                                        className="!mb-2"
                                        value={searchValue}
                                        onChange={handleSearchInputChange}
                                    />
                                    <Text className={`!mb-2`} size="sm" fw={700} c="#202020">{ filteredMembers && filteredMembers.length> 0 ? filteredMembers.length : 0} people available</Text>

                                    <ScrollArea className="h-[290px] min-w-[380px] max-w-[380px] !pr-1.5" scrollbarSize={5}>
                                        <div className="p-0">

                                            <div className="mt-2">
                                                { filteredMembers && filteredMembers.length > 0 && filteredMembers.map((member) => (
                                                    <div key={member.id} className="ml-single flex items-center border-b border-solid border-[#ffffff] py-1.5 justify-between gap-1">
                                                        {/*<Avatar src={member.avatar} size={40} radius={32} />*/}
                                                        <UserAvatarSingle user={member} size={32} />
                                                        <div className="mls-ne ml-2 w-full">
                                                            <Text lineClamp={1} size="sm" fw={700} c="#202020">{member.name}</Text>
                                                            <Text lineClamp={1} size="sm" fw={100} c="#202020">{member.email}</Text>
                                                        </div>

                                                        <Button
                                                            radius="sm"
                                                            height={24}
                                                            style={{
                                                                backgroundColor: addedMembers.includes(member.id) ? "#f00f00" : "#39758D", // Conditional background color
                                                                color: "#fff",
                                                                fontWeight: 400,
                                                                padding: "5px 0px",
                                                                width: "100px",
                                                            }}
                                                            // disabled={addedMembers.includes(member.id)}
                                                            size="sm"
                                                            marginLeft={2}
                                                            onClick={ () =>
                                                                ( addedMembers.includes(member.id) ? handleRemoveButtonClick : handleAssignButtonClick )(member)
                                                            }
                                                        >
                                                            {addedMembers.includes(member.id) ? 'Remove' : 'Add'}
                                                        </Button>

                                                    </div>
                                                ))}
                                                { filteredMembers && filteredMembers.length === 0 && isEmailValid &&
                                                    <div className="ml-single flex items-center border-b border-solid border-[#C2D4DC] py-3 justify-between">
                                                        <Avatar size={32} radius={32} />
                                                        <div className="mls-ne ml-2 w-full">
                                                            <Text lineClamp={1} size="sm" fw={100} c="#202020">{searchValue}</Text>
                                                        </div>
                                                        <Button
                                                            radius="sm"
                                                            height={24}
                                                            style={{
                                                                backgroundColor: "#39758D", // Conditional background color
                                                                color: "#fff",
                                                                fontWeight: 400,
                                                                padding: "5px",
                                                                minWidth: "110px",
                                                            }}
                                                            size="sm"
                                                            marginLeft={2}
                                                            onClick={() => handleSendInvite(searchValue)}
                                                        >
                                                            Send Invite
                                                        </Button>

                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </ScrollArea>

                                </Popover.Dropdown>
                            </Popover>
                        }
                    </div>

                </div>
            </div>

        </>

    );
}

export default ProjectDetailsNav;
