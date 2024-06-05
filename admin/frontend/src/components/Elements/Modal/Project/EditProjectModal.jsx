import React, { useState, useEffect } from 'react';
import {Avatar, Button, Modal, ScrollArea, Select, Text, TextInput, Title} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { IconX } from '@tabler/icons-react';
import ProjectEditButton from '../../Button/ProjectEditButton';
import {useDispatch, useSelector} from 'react-redux';
import InlineEditForm from "../../../ui/InlineEditForm";
import {editProject} from "../../../Settings/store/projectSlice";
const EditProjectModal = ({ projectData }) =>  {
    const dispatch = useDispatch();
// console.log(projectData.parent)
    const [projectEditModalOpen, { open: openProjectEditModal, close: closeProjectEditModal }] = useDisclosure(false);
    const [showMembersList, setShowMembersList] = useState(false);
    const [editedName, setEditedName] = useState(projectData.name); // State to hold edited name


    const editProjectNameHandler = (props) => {
        const {id, input, fieldName} = props
        if(id === undefined || input === undefined || fieldName === undefined){
            return;
        }
        dispatch(editProject({id: id, data: {[fieldName]: input}}))
        setEditedName(input)
    }


    const [currentMemberData, setCurrentMemberData] = useState(projectData.members);

    const handleDeleteCurrentMember = (id) => {
        console.log(`Member with ID ${id} deleted`);
        // Remove the member with the specified ID from currentMemberData
        const updatedCurrentMembers = currentMemberData.filter((member) => parseInt(member.id) !== parseInt(id));
        setCurrentMemberData(updatedCurrentMembers);
    
        // Remove the member's ID from the addedMembers array
        setAddedMembers((prevMembers) => prevMembers.filter((memberId) => parseInt(memberId) !== parseInt(id)));

        dispatch(editProject({id: projectData.id, data: {'members': updatedCurrentMembers}}))
    };

    const [searchValue, setSearchValue] = useState('');

    const handleSearchInputChange = (e) => {
        const inputValue = e.target.value;
        setSearchValue(inputValue);

        setShowMembersList(true);
        
    };

    const filteredMembers = projectData.parent.members && projectData.parent.members.length>0 && projectData.parent.members.filter(
        (member) =>
          member.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          member.email.toLowerCase().includes(searchValue.toLowerCase())
      );

    const handleSearchInputFocus = (e) => {
        setShowMembersList(true);
    };

    const [addedMembers, setAddedMembers] = useState(projectData.members && projectData.members.length>0 ? projectData.members.map((member) => member.id):[]);


      const handleButtonClick = (clickedMember) => {
        console.log('Added');
        // Check if the member is not already in the current list
        if (!addedMembers.includes(clickedMember.id)) {
            // Add the clickedMember to the currentMemberData state with updated status
            const updatedClickedMember = { ...clickedMember, status: 'Added' };
            const updatedMembers = [...currentMemberData, updatedClickedMember];

            setCurrentMemberData((prevData) => {
                // const newData = [...prevData, updatedClickedMember];
                // console.log(newData)
                return [...prevData, updatedClickedMember];
            });
            setAddedMembers((prevMembers) => [...prevMembers, clickedMember.id]);

            dispatch(editProject({id: projectData.id, data: {'members': updatedMembers}}))

        }
    };

    useEffect(() => {
        if(projectEditModalOpen===false){
            setShowMembersList(projectEditModalOpen);
        }
    }, [projectEditModalOpen]);

    return (
        <>
            <ProjectEditButton onClick={openProjectEditModal} />
            <Modal.Root
                opened={projectEditModalOpen}
                onClose={closeProjectEditModal}
                centered
                size={475}
            >
                <Modal.Overlay />
                <Modal.Content radius={15}>
                    <Modal.Header px={20} py={10}>
                        <Title order={5}>Edit Project</Title>
                        <Modal.CloseButton />
                    </Modal.Header>
                    <Modal.Body>
                        <div className="edit-form-box">
                            <div className="mb-4">
                                {projectData.parent && projectData.parent.name && <Text
                                    style={{border: '1px solid #A4C0CB', padding: '7px 15px', borderRadius: '10px'}}
                                    title={projectData.parent.name} lineClamp={1} size="lg" fw={700}
                                    c="#202020">{projectData.parent.name}</Text>}
                            </div>
                            <div className="mb-4">
                                <InlineEditForm editHandler={(props) => {
                                    props['id'] = projectData.id;
                                    props['fieldName'] = 'name'
                                    editProjectNameHandler(props)
                                }} value={editedName}/>
                            </div>
                            <div>
                                <div
                                    className={`current-member-lists flex flex-wrap gap-4 ${currentMemberData.length > 0 ? 'mb-4' : ''}`}>
                                    {currentMemberData.map((member) => (
                                        <div key={member.id}
                                             className="single-current-member flex items-center justify-between gap-2">
                                            <Avatar src={member.avatar} size={22} radius={22}/>
                                            <Text size="sm" fw={100} c="#202020">{member.name}</Text>
                                            <button onClick={() => handleDeleteCurrentMember(member.id)}>
                                                <IconX size={16} color="#202020"/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative mb-4">
                                <TextInput
                                    leftSection={<IconSearch size={16}/>}
                                    placeholder="Quick search member"
                                    value={searchValue}
                                    onChange={handleSearchInputChange}
                                    onFocus={handleSearchInputFocus}
                                    radius="md"
                                    size="md"
                                    styles={{
                                        borderColor: "gray.3",
                                        backgroundColor: "white",
                                        paddingLeft: "40px", // Set left padding
                                        focus: {
                                            borderColor: "blue.5",
                                        },
                                    }}
                                />
                            </div>

                            {showMembersList && (
                                <div
                                    className="members-lists mt-3 border boder-solid border-[#6191A4] rounded-md p-3 pb-0">
                                    <Text size="sm" fw={700}
                                          c="#202020">{filteredMembers && filteredMembers.length > 0 && filteredMembers.length} people
                                        available</Text>
                                    <div className="members-lists mt-3">
                                        <ScrollArea h={250} scrollbarSize={4} scrollHideDelay={500}>
                                            {filteredMembers && filteredMembers.length > 0 && filteredMembers.map((member) => (
                                                <div key={member.id}
                                                     className="ml-single flex items-center border-b border-solid border-[#C2D4DC] py-3 justify-between">
                                                    <Avatar src={member.avatar} size={32} radius={32}/>
                                                    <div className="mls-ne ml-2 w-full">
                                                        <Text size="sm" fw={700} c="#202020">{member.name}</Text>
                                                        <Text size="sm" fw={100} c="#202020">{member.email}</Text>
                                                    </div>
                                                    <Button
                                                        radius="sm"
                                                        height={24}
                                                        style={{
                                                            backgroundColor: addedMembers.includes(member.id) ? "#fff" : "#39758D", // Conditional background color
                                                            color: addedMembers.includes(member.id) ? "#A85923" : "#fff",
                                                            fontWeight: 400,
                                                            padding: "5px 0px",
                                                            width: "100px",
                                                        }}
                                                        disabled={addedMembers.includes(member.id)}
                                                        size="sm"
                                                        marginLeft={2}
                                                        onClick={() => handleButtonClick(member)}
                                                    >
                                                        {addedMembers.includes(member.id) ? 'Added' : 'Add'}
                                                    </Button>

                                                </div>
                                            ))}
                                        </ScrollArea>
                                    </div>

                                </div>
                            )}


                        </div>
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>
        </>
    );
}

export default EditProjectModal;