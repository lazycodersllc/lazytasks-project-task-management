import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, Text, Paper } from '@mantine/core';
import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import EditWorkspaceModal from './Modal/Workspace/EditWorkspaceModal'; 
import CreateProjectModal from './Modal/Project/CreateProjectModal'; 
import DeleteWorkspaceModal from './Modal/Workspace/DeleteWorkspace';
import { setUsers } from '../../reducers/usersSlice';
import UsersJson from '../Data/usersData.json';
import {fetchAllMembers} from "../../store/auth/userSlice";
import UsersAvatarGroup from "../ui/UsersAvatarGroup";

const WorkspaceCard = (props) => {
    const {
        id,
        name,
        projects,
        members
    } = props;

    return (
        <Paper radius="md" withBorder p="10px" bg="var(--mantine-color-body)" style={{ border: '1px solid #A4C0CB', width: '100%', height:'100%' }}>
            
            <Text ta="left" fz="md" fw={500} c="#202020">
                {name}
            </Text>
            
            <div className="relative flex justify-between mt-1 mb-4">
                <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <circle cx="4" cy="4" r="4" fill="#F1975A"/>
                    </svg>
                    <Text ta="left" c="#4D4D4D" fz="xs">{members &&  members.length>0 ? members.length:0} users</Text>
                </div> 
                <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <circle cx="4" cy="4" r="4" fill="#39758D"/>
                    </svg> 
                    <Text ta="left" c="#4D4D4D" fz="xs">{projects && projects.length} projects</Text>
                </div>
            </div> 

            <UsersAvatarGroup users={members} size={40} maxCount={4} />

            <div className="flex justify-end gap-3 mt-4">
                <CreateProjectModal buttonStyle="b" companyId={id} companyName={name} members={members}/>
                {/* <EditWorkspaceModal workspaceid={id} /> */}
                <EditWorkspaceModal workspaceData={{ id, name, members }} />
                <DeleteWorkspaceModal id={id} />
            </div>
        </Paper>
    );
}

export default WorkspaceCard;