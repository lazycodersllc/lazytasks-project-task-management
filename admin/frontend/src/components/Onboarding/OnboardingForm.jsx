import React, { useState, useEffect, Fragment, useRef } from 'react';
import {
    ActionIcon,
    Button, Box,
    Input,
    Menu,
    rem,
    ScrollArea,
    Textarea,
    TextInput,
    Title,
    Text,
    Card, Group, Divider, Stepper, Avatar, Select
} from '@mantine/core';
import axios from "axios";
import {useDispatch, useSelector} from "react-redux";
import {createCompany} from "../Settings/store/companySlice";
import {showNotification} from "@mantine/notifications";
import {createProject, editProject, fetchAllProjects, fetchProjectTaskSections} from "../Settings/store/projectSlice";
import {editLazytasksConfig} from "../Settings/store/settingSlice";
import {fetchAllMembers} from "../../store/auth/userSlice";
import {IconPlus, IconSearch, IconTrash, IconX} from "@tabler/icons-react";
import {createTask, createTaskSection} from "../Settings/store/taskSlice";
import UserAvatarSingle from "../ui/UserAvatarSingle";
import {useNavigate} from "react-router-dom";
const OnboardingForm = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const {loggedUserId} = useSelector((state) => state.auth.user)
    const [active, setActive] = useState(0);
    const [workspaceName, setWorkspaceName] = useState('');
    const [workspaceError, setWorkspaceError] = useState(false);
    const [projectName, setProjectName] = useState('');
    const [projectError, setProjectError] = useState(false);
    const [ companyId, setCompanyId ] = useState(null);
    const [ projectId, setProjectId ] = useState(null);
    //setTaskName
    const [ taskName, setTaskName ] = useState('');
    const [ taskNameError, setTaskNameError ] = useState('')
    const [ taskSectionId, setTaskSectionId ] = useState(null);
    const [ taskSectionError, setTaskSectionError ] = useState( '' );

    const [ projectSections, setProjectSections ] = useState([]);

    useEffect(() => {
        dispatch(fetchAllMembers())
    }, []);

    const {allMembers} = useSelector((state) => state.auth.user);
    const [searchValue, setSearchValue] = useState('');

    const filteredMembers = allMembers && allMembers.length>0 && allMembers.filter(
        (member) =>
            member.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            member.email.toLowerCase().includes(searchValue.toLowerCase())
    );
    const handleSearchInputChange = (e) => {
        const inputValue = e.target.value;
        setSearchValue(inputValue);
    };
    const [addedMembers, setAddedMembers] = useState([]);
    const [currentMemberData, setCurrentMemberData] = useState([]);
    const handleDeleteCurrentMember = (id) => {

        const updatedCurrentMembers = currentMemberData.filter((member) => member.id !== id);

        setCurrentMemberData(updatedCurrentMembers);

        setAddedMembers((prevMembers) => prevMembers.filter((memberId) => memberId !== id));

    };
    const handleButtonClick = (clickedMember) => {
        // Check if the member is not already in the current list
        if (!addedMembers.includes(clickedMember.id)) {
            // Add the clickedMember to the currentMemberData state with updated status
            const updatedClickedMember = { ...clickedMember, status: 'Added' };
            setCurrentMemberData((prevData) => [...prevData, updatedClickedMember]);
            // Update the state to indicate that the member has been added
            setAddedMembers((prevMembers) => [...prevMembers, clickedMember.id]);
        }
    };

    const handleWorkspaceName = (e) => {
        setWorkspaceName(e.currentTarget.value);
        if(e.currentTarget.value === '') {
            setWorkspaceError(true);
        }else{
            setWorkspaceError(false);
        }
    }

    const handleProjectName = (e) => {
        setProjectName(e.currentTarget.value);
        if( e.currentTarget.value === '' ) {
            setProjectError(true);
        }else{
            setProjectError(false);
        }
    }

    //third step start


    const [sections, setSections] = useState(["", "", ""]); // Initial state with 3 empty inputs

    // Handle input blur
    const handleBlurSectionInput = (index, value) => {
        const newSections = [...sections];
        newSections[index] = value;

        setSections(newSections);

        // check if the section already exists
        const sectionExists = sections.some((section) => section === value);
        if ( !sectionExists && value !== '' ) {
            const newSection = {
                name: value,
                project_id: projectId,
                sort_order: index + 1,
                created_by: loggedUserId
            }
            dispatch(createTaskSection(newSection)).then((response) => {

                if ( response.payload && response.payload.status && response.payload.status === 200 ){
                    dispatch(fetchProjectTaskSections(projectId)).then( (response) => {
                        if ( response.payload && response.payload.status && response.payload.status === 200 )
                        {
                            setProjectSections(response.payload.data)
                        }
                    });

                }

            });
        }
    };

    // Add new input field
    const addSection = () => {
        setSections([...sections, ""]);
    };

    // Remove an input field (but keep at least one)
    const removeSection = (index) => {
        if (sections.length > 1) {
            setSections(sections.filter((_, i) => i !== index));
        }
    };
    //third step end
    //last step start
    const onSectionChange = (e) => {
        if(e && e.value && e.value!==''){
            setTaskSectionError(false);
            setTaskSectionId(e.value);
        }else {
            setTaskSectionError(true);
            setTaskSectionId(null);
        }
    };

    //last step end


    const nextStep = () => {

        if (0 === active){
            submitFirstStep();
        }
        if (1 === active){
            handleStepSecond();
        }
        if ( 2 === active ){
            handleStepThird();
        }
        if ( 3 === active ){
            handleStepFourth();

        }
    }

    const submitFirstStep = () => {
        if(workspaceName === ''){
            setWorkspaceError(true);
            return;
        }
        if(projectName === ''){
            setProjectError(true);
            return;
        }
        if( workspaceName && projectName){
            const newWorkspace = {
                name: workspaceName,
                created_by: loggedUserId
            };
            dispatch(createCompany(newWorkspace)).then((response) => {
                    if(response.payload && response.payload.status && response.payload.status === 200){
                        const workspaceId = response.payload.data?.id;
                        const workspaceName = response.payload.data ?.name;

                        setCompanyId( workspaceId );
                        setCompanyId( workspaceName )

                        const newProject = {
                            name: projectName,
                            company_id: workspaceId,
                            created_by: loggedUserId,
                        };
                        dispatch(createProject(newProject)).then((response) => {
                            if(response.payload && response.payload.status && response.payload.status === 200){

                                const projectId = response.payload.data?.id;
                                const projectName = response.payload.data ?.name;

                                setProjectId( projectId );
                                setProjectName( projectName );

                                dispatch(editLazytasksConfig({ data: { 'step_completed': 1 } } ) ).then((response) => {

                                    setActive(1);

                                });
                            }
                        });
                    }
                }
            );

        }
    }

    const handleStepSecond = () => {

        if ( currentMemberData && currentMemberData.length === 0 ){
            //show error notify
            showNotification({
                title: 'Error',
                message: 'User is required.',
                color: 'red',
                autoClose: 5000,
            })
        }

        if ( currentMemberData && currentMemberData.length > 0 ) {
            dispatch(editProject({id: projectId, data: {'members': currentMemberData, 'updated_by': loggedUserId}})).then((response) => {
                if(response.payload && response.payload.status && response.payload.status === 200){
                    setProjectName( response.payload.data?.name )

                    dispatch(editLazytasksConfig({ data: { 'step_completed': 2 } } ) ).then((response) => {

                        setActive(2)

                    });
                }
            });

        }

    }

    const handleStepThird = () => {

        //how to check sections value all empty
        const areAllSectionsEmpty = sections.every(section => section.trim() === '');

        if (areAllSectionsEmpty) {
            showNotification({
                title: 'Error',
                message: 'All sections are empty. Please add at least one section.',
                color: 'red',
                autoClose: 5000,
            });
        } else {
            dispatch(editLazytasksConfig({ data: { 'step_completed': 3 } } ) ).then((response) => {

                setActive( 3 );

            });
        }



    }

    const handleTaskName = (e) => {
        setTaskName(e.currentTarget.value);
        if( e.currentTarget.value === '' ) {
            setTaskNameError(true);
        }else{
            setTaskNameError(false);
        }
    }

    const handleStepFourth = () => {

        if(taskName === ''){
            setTaskNameError(true);
            return false;
        }
        if ( !taskSectionId ){
            setTaskSectionError( true )
            return false;
        }

        const newTaskData = {
            name: taskName,
            project_id: projectId,
            task_section_id: taskSectionId,
            created_by: loggedUserId,
            type:'task',
            status: 'ACTIVE',
        };
        if( newTaskData.name!=='' ){
            dispatch(createTask(newTaskData)).then( (response) => {
                if(response.payload && response.payload.status && response.payload.status === 200){


                    dispatch(editLazytasksConfig({ data: { 'step_completed': 4, 'lazytasks_basic_info_guide_modal':false } } ) ).then((response) => {

                        navigate(`/project/task/list/${projectId}`)

                        showNotification({
                            title: 'Congratulations',
                            message: 'You have successfully completed the onboarding process.',
                            color: 'green',
                            autoClose: 7000,
                        });

                    });

                }
            })

        }

    }

    const stepTitles = [
        'Create Your Workspace',
        'Add Users to '+ projectName,
        'Create Section',
        'Create Task',
    ];
    return (
        <>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    // height: '90vh',
                    fontFamily: 'Inter, sans-serif',
                }}
            >
                <Card shadow="sm" padding="lg" radius="lg" withBorder style={{
                    width: '684px',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'height 0.3s ease'
                }}>
                    <Title order={3} align="center" mt="md" mb="lg">
                        {stepTitles[active]}
                    </Title>

                    <Stepper active={active} onStepClick={setActive} breakpoint="sm" color="#ED7D31"
                    >
                        <Stepper.Step allowStepSelect={false} label="Step 1" >
                            <Card mt="lg" p="md" withBorder radius="md" style={{ backgroundColor: '#f4f7f9', marginBottom: '25px' }}>
                                <TextInput
                                    withAsterisk
                                    label="Workspace name"
                                    placeholder="Workspace name"
                                    mb="md"
                                    radius="md"
                                    size="md"
                                    onChange={(e) => handleWorkspaceName(e)}
                                    styles={{
                                        label: { marginBottom: '8px', fontSize: '15px' },
                                    }}
                                    error={workspaceError}
                                />
                                <TextInput
                                    withAsterisk
                                    label="Project name"
                                    placeholder="Project name"
                                    mb="md"
                                    radius="md"
                                    size="md"
                                    onChange={(e) => handleProjectName(e)}
                                    styles={{
                                        label: { marginBottom: '8px', fontSize: '15px' },
                                    }}
                                    error={projectError}
                                />
                            </Card>
                        </Stepper.Step>
                        <Stepper.Step allowStepSelect={false} label="Step 2" >
                            <Card withBorder padding="md" mt="sm">
                                <div className="flex flex-wrap gap-4 mb-4">
                                    { currentMemberData && currentMemberData.length > 0 && currentMemberData.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between gap-2"
                                            style={{ backgroundColor: '#EBF1F4', padding: '5px 10px', borderRadius: '5px' }}
                                        >
                                            {/*<Avatar src={member.name} size={28} radius={22} />*/}
                                             <UserAvatarSingle user={member} size={32} />
                                            <Text size="sm" fw={100} c="#202020">
                                                {member.name}
                                            </Text>
                                            <button onClick={() => handleDeleteCurrentMember(member.id)}>
                                                <IconX size={16} color="#202020" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Search Input */}
                                <TextInput
                                    leftSection={<IconSearch size={16} />}
                                    placeholder="Quick search member"
                                    mt="md"
                                    value={searchValue}
                                    onChange={handleSearchInputChange}
                                />

                                <Text size="lg" c="#000" mt={10} fw={600} ta="center">
                                    Wordpress Users
                                </Text>

                                <ScrollArea h={120} scrollbarSize={6}>
                                    {/* User List */}
                                    { filteredMembers && filteredMembers.length > 0 && filteredMembers.map((user) => (
                                        <div key={user.id}
                                             className="ml-single flex items-center border-b border-solid border-[#C2D4DC] py-3 justify-between">
                                            {/*<Avatar src={user.name} size={32} radius={32} />*/}
                                             <UserAvatarSingle user={user} size={32} />
                                            <div className="mls-ne ml-2 w-full">
                                                <Text size="sm" fw={700} c="#202020">{user.name}</Text>
                                                <Text size="sm" fw={100} c="#202020">{user.email}</Text>
                                            </div>
                                            {/*<Button
                                                radius="sm"
                                                height={24}
                                                style={{
                                                    backgroundColor: user.status === 'added' ? "#A85923" : "#39758D",
                                                    color: "#fff",
                                                    fontWeight: 400,
                                                    padding: "5px 0px",
                                                    width: "100px",
                                                }}
                                                size="sm"
                                                marginLeft={2}
                                            >
                                                {user.status === 'added' ? "Remove" : "Add"}
                                            </Button>*/}
                                            <Button
                                                radius="sm"
                                                height={24}
                                                style={{
                                                    backgroundColor: addedMembers.includes(user.id) ? "#EBF1F4" : "#39758D", // Conditional background color
                                                    color: addedMembers.includes(user.id) ? "#000" : "#fff",
                                                    fontWeight: 400,
                                                    padding: "5px 0px",
                                                    width: "100px",
                                                }}
                                                disabled={addedMembers.includes(user.id)}
                                                size="sm"
                                                marginLeft={2}
                                                onClick={() => handleButtonClick(user)}
                                            >
                                                {addedMembers.includes(user.id) ? 'Added' : 'Add'}
                                            </Button>

                                        </div>
                                    ))}
                                </ScrollArea>
                            </Card>
                        </Stepper.Step>
                        <Stepper.Step allowStepSelect={false} label="Step 3" >
                            <Card p="md" withBorder radius="md" style={{ backgroundColor: '#f4f7f9' }}>

                                <ScrollArea style={{ height: '200px' }} scrollbarSize={6} type="hover">
                                    {sections.map((section, index) => (
                                        <Group key={index} mb="xs" spacing="xs">
                                            <TextInput
                                                label={index === 0 ? "Section name" : undefined}
                                                placeholder="Section name"
                                                radius="md"
                                                size="md"
                                                onBlur={(e) => handleBlurSectionInput(index, e.target.value)}
                                                style={{ width: '100%' }}
                                                rightSection={
                                                    sections.length > 1 && (
                                                        <ActionIcon
                                                            variant="subtle"
                                                            size="md"
                                                            onClick={() => removeSection(index)}
                                                            aria-label="Remove input"
                                                        >
                                                            <IconTrash size={16} color='#6A6A6A' />
                                                        </ActionIcon>
                                                    )
                                                }
                                            />
                                        </Group>
                                    ))}
                                </ScrollArea>

                                {/* Add new section button */}
                                <Button
                                    variant="light"
                                    size="sm"
                                    onClick={addSection}
                                    mt="xs"
                                    style={{ alignSelf: 'flex-start', color: '#39758D' }}
                                >
                                    <IconPlus size={18} color='#39758D' /> Add Section
                                </Button>
                            </Card>
                        </Stepper.Step>
                        <Stepper.Step allowStepSelect={false} label="Step 4" >
                            <Card mt="lg" p="md" withBorder radius="md" style={{ backgroundColor: '#f4f7f9' }}>
                                <TextInput
                                    label="Task name*"
                                    placeholder="Task name"
                                    mb="md"
                                    radius="md"
                                    size="md"
                                    styles={{
                                        label: { marginBottom: '8px', fontSize: '15px' },
                                    }}
                                    onChange={(e) => handleTaskName(e)}
                                    error={taskNameError}

                                />
                                <Select
                                    searchable
                                    clearable
                                    label="Section*"
                                    size="md"
                                    radius="md"
                                    placeholder="Select Section"
                                    data={ projectSections && projectSections.length > 0 && projectSections.map((section) => ({
                                        value: section.id,
                                        label: section.name
                                    }))}
                                    // defaultValue="React"
                                    allowDeselect
                                    onChange={(e, option) => {
                                        onSectionChange(option);
                                    }}
                                    error={taskSectionError}
                                />
                            </Card>
                        </Stepper.Step>
                    </Stepper>

                    <div style={{
                        marginTop: '1.5rem',
                        marginBottom: '1.5rem',
                        borderTop: '1px solid #C2D4DC',
                        width: 'calc(100% + 4rem)',
                        marginLeft: '-2rem',
                    }}
                    ></div>


                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '1rem', gap: '8px' }}>
                        {/*{active > 1 && (
                            <Button className={`font-semibold`} variant="default" radius="sm" size='md'
                                onClick={prevStep} styles={{
                                    root: {
                                        color: '#39758D',
                                        borderColor: '#39758D',
                                    },
                                }}>
                                Back
                            </Button>
                        )}*/}

                        <Button className={`font-semibold`} variant="filled" color="#ED7D31" radius="sm" size='md'
                            onClick={nextStep}>
                            {active === 3 ? 'Finish' : 'Next step'}
                        </Button>

                    </div>

                </Card>
            </div>
        </>
    );

};

export default OnboardingForm;