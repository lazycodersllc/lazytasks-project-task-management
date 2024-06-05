import { Button, Group, Modal, Text } from '@mantine/core'; 
import { useDisclosure } from '@mantine/hooks';   
import { IconAlertTriangleFilled } from '@tabler/icons-react';
import WorkspaceDeleteButton from '../../Button/WorkspaceDeleteButton';
import {useDispatch} from "react-redux";
import {deleteCompany, fetchAllCompanies} from "../../../Settings/store/companySlice";
const DeleteWorkspaceModal = ({id}) => {
    const dispatch = useDispatch();

    const [WorkspaceDeleteModalOpen, { open: deleteWorkspaceModal, close: closeWorkspaceDeleteModal }] = useDisclosure(false);
    const deleteHandler = () => {
        if(id === undefined || id === null || id === ''){
            return;
        }
        dispatch(deleteCompany(id))
    }

    return (
        <>
            <WorkspaceDeleteButton onClick={deleteWorkspaceModal} />
            
            <Modal 
            opened={WorkspaceDeleteModalOpen}
            onClose={closeWorkspaceDeleteModal}
            centered size={475}
            padding="0px" 
            withCloseButton={false} 
            radius="15px"
            >
                <div className="dm-head flex justify-center items-center gap-2 p-6 border-b border-gray-300">
                
                    <IconAlertTriangleFilled style={{ color: 'orange' }} />
                    <Text ta="center" fz="xl" fw={500} c="#202020">
                        Delete Workspace
                    </Text>
                  
                </div>
                <div className="delete-c-box p-10"> 
                
                    <Text ta="center" fz="lg" fw={500} c="#202020" mb="xl">
                        You are going to delete “Right Brain Solution Ltd”.
                        Are you sure?
                    </Text>

                    <Group mt="xl" grow wrap="nowrap"  ta="center">
                        <Button onClick={closeWorkspaceDeleteModal} style={{ '--button-bg': '#EBF1F4', color: '#4D4D4D' }}>No, Keep It.</Button> 
                        <Button onClick={() => {
                            deleteHandler();
                            closeWorkspaceDeleteModal()
                        }} color="orange">Yes, Delete !</Button>
                    </Group>
                </div>
            </Modal>
            </>
    );
}
 
export default DeleteWorkspaceModal;