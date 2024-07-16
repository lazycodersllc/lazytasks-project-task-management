import { IconTrash } from '@tabler/icons-react';
import React from 'react'; 
const ProjectDeleteButton = ({ onClick }) => {  
    return (
        <> 
            <button className="text-center" onClick={onClick}>
                <IconTrash size={20} color="#ED7D31" />
            </button>
        </>
        
    );
}

export default ProjectDeleteButton;