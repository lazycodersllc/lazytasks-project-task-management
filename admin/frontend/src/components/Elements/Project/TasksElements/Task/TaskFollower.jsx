import { IconUsers } from '@tabler/icons-react';
import React, { useState, useRef, useEffect } from 'react'; 
import { Avatar, ScrollArea, Text, Tooltip } from '@mantine/core';
import {useDispatch, useSelector} from 'react-redux';
import UsersAvatarGroup from "../../../../ui/UsersAvatarGroup";
import {editTask} from "../../../../Settings/store/taskSlice";
const TaskFollower = ({taskId, followers, editHandler=[]}) => {
    const dispatch = useDispatch();
    const {boardMembers} = useSelector((state) => state.settings.task);
    const [showMembersList, setShowMembersList] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState(followers || []);
    const membersListRef = useRef(null);
    const {loggedUserId} = useSelector((state) => state.auth.user)


    // console.log(followers); 
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (membersListRef.current && !membersListRef.current.contains(event.target)) {
                setShowMembersList(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [membersListRef]);

    const handleAssignedToButtonClick = () => {
        setShowMembersList(true);
    };

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
        editHandler(updatedMembers);
        if (taskId && taskId !== 'undefined' && updatedMembers) {
            dispatch(editTask({id: taskId, data: {members: updatedMembers, 'updated_by': loggedUserId}}))
        }
    };


    // const handleRemoveButtonClick = (selectedMember) => {
    //     setSelectedMembers(selectedMembers.filter((member) => member.id !== selectedMember.id));
    // };


    const remainingMembersTooltip = selectedMembers.slice(4).map((member) => member.name).join(', ');

    return (
        <> 
            <div onClick={handleAssignedToButtonClick} className="assignto-btn cursor-pointer inline-block">
                {selectedMembers && selectedMembers.length > 0 ? (
                    <div className="flex items-center">
                        <UsersAvatarGroup users={selectedMembers} size={40} maxCount={3} />
                    </div>
                ) : ( 
                    <div className="h-[32px] w-[32px] border border-dashed border-[#4d4d4d] rounded-full p-1">
                        <IconUsers color="#4d4d4d" size="22" />
                    </div>
                )} 
            </div>
            

            {showMembersList && (
                <div ref={membersListRef} className="z-[9] members-lists absolute w-[272px] bg-white mt-3 border border-solid border-[#6191A4] rounded-lg">
                    <ScrollArea h={272}>
                        <div className="p-3">
                            <Text size="sm" fw={700} c="#202020">{boardMembers && boardMembers.length>0 ? boardMembers.length: 0 } people available</Text>
                            <div className="mt-3">  
                                {boardMembers && boardMembers.length>0 && boardMembers.map((member) => (
                                    <div key={member.id} className="ml-single flex items-center border-b border-solid border-[#C2D4DC] py-1 justify-between">
                                        <Avatar src={member.avatar} size={32} radius={32} />
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
                </div>


                
            )}
        </>
    );
};

export default TaskFollower;
