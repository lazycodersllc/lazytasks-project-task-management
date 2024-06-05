import React from 'react';
import {Avatar, Text, Paper, Menu, rem} from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import {Link} from "react-router-dom";

const UserCard = (props) => {
    const {
        id,
        avatar,
        name,
        email,
        phoneNumber,
        // onEditClick = () => console.log('Edit clicked'), // Default edit functionality
        // onDeleteClick = () => console.log('Delete clicked'), // Default delete functionality
    } = props;

    return (
        <Paper radius="md" withBorder p="10px" bg="var(--mantine-color-body)" style={{ border: '1px solid #A4C0CB', width: '100%', height:'100%' }}>
            <Avatar src={avatar} size={80} radius={80} mx="auto" />
            <Text title={name} lineClamp={1} ta="center" fz="lg" fw={500} mt="md" mb="md" c="#39758D">
                {name}
            </Text>

            <Text title={email} lineClamp={1} ta="center" fz="sm" fw={500} c="#202020">
                {email}
            </Text>

            <Text ta="center" c="#4D4D4D" fz="sm">
                {phoneNumber}
            </Text>

            <div className="flex justify-center gap-3 mt-4">

                <button className="text-center"
                        // onClick={onEditClick}
                >
                    <Link to={`/profile/${id}`}>
                        <IconEdit size={20} />
                    </Link>
                </button>
                <button className="text-center"
                        // onClick={onDeleteClick}
                >
                    <IconTrash size={20} />
                </button>
            </div>
        </Paper>
    );
}

export default UserCard;
