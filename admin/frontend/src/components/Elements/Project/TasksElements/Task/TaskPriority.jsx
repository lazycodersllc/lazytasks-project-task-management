import {IconCheck, IconChevronDown, IconDeviceFloppy, IconEdit, IconMinus, IconTrash} from '@tabler/icons-react';
import React, {useState, useRef, useEffect, Fragment} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {
  createProjectPriority,
  deleteProjectPriority,
  editTask,
  removeSuccessMessage
} from "../../../../Settings/store/taskSlice";
import {useParams} from "react-router-dom";
import {hasPermission} from "../../../../ui/permissions";
import {
  ActionIcon,
  Box,
  Button,
  ColorInput,
  Grid,
  Popover,
  Text,
  TextInput,
  Title, Tooltip,
  useMantineTheme
} from "@mantine/core";
import {modals} from "@mantine/modals";
import {notifications} from "@mantine/notifications";

const TaskPriority = ({ taskId, priority }) => {
  const dispatch = useDispatch();
  const theme = useMantineTheme();
  const id = useParams();
  const projectId = id.id;
  const {loggedUserId} = useSelector((state) => state.auth.user)
  const {loggedInUser} = useSelector((state) => state.auth.session)

  const {projectPriorities} = useSelector((state) => state.settings.task);

  const [newPriority, setNewPriority] = useState('');
  const [newPriorityColor, setNewPriorityColor] = useState('#346A80');
  const [selectedPriority, setSelectedPriority] = useState(priority ? priority.id : '');
  const [selectedPriorityName, setSelectedPriorityName] = useState(priority ? priority.name : '');
  const [selectedPriorityColor, setSelectedPriorityColor] = useState(priority && priority.color_code ? priority.color_code : '#000000');
  const [showPriorityList, setShowPriorityList] = useState(false);
  const [showPriorityAddInput, setShowPriorityAddInput] = useState(false);
  const [showPriorityEditInput, setShowPriorityEditInput] = useState(false);
  const selectPriorityRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectPriorityRef.current && !selectPriorityRef.current.contains(event.target)) {
        setShowPriorityList(false);
        setShowPriorityAddInput(false);
        setShowPriorityEditInput(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSelectedPriority(priority ? priority.id : '');
    setSelectedPriorityName(priority ? priority.name : '');
    setSelectedPriorityColor(priority && priority.color_code ? priority.color_code : '#000000')
  }, [priority]);

  const handleInputChange = (e) => {
    setNewPriority(e.target.value);
  };

  const handleColorInputChange = (e) => {
    setNewPriorityColor(e.target.value);
  };

  const handlePriorityListShow = () => {
    setShowPriorityList(true);
  };

  const handleAddPriority = () => {
    if (newPriority.trim() !== '' && newPriority !== 'Type name here') {
      const submitData = {
        name: newPriority,
        project_id: projectId,
        color_code: newPriorityColor,
        created_by:loggedUserId
      }
      dispatch(createProjectPriority(submitData))
      setNewPriority('');
    }
    setShowPriorityAddInput(false);
  };

  const handleCreatePriority = () => {
    setShowPriorityAddInput(true);
  };

  const [ priorityId, setPriorityId ] = useState(null);
  // priorityEditHandler
    const priorityEditHandler = ( priority ) => {
      if ( priority && priority.id ) {
        setNewPriority(priority.name);
        setNewPriorityColor(priority.color_code);
        setShowPriorityEditInput(true);
        setPriorityId(priority.id);
      }

    }

  const handleUpdatePriority = () => {
    if (newPriority.trim() !== '' && newPriority !== 'Type name here') {
      const submitData = {
        id: priorityId,
        name: newPriority,
        project_id: projectId,
        color_code: newPriorityColor,
        created_by:loggedUserId
      }
      dispatch(createProjectPriority(submitData)).then((response) => {

        if( response.payload && response.payload.data ){
          const newPriorities = response.payload.data;
          // map through the priorities and update the selected priority
            const priority = newPriorities.find( priority => priority.id === selectedPriority );

          setSelectedPriority(priority ? priority.id : '');
          setSelectedPriorityName(priority ? priority.name : '');
          setSelectedPriorityColor(priority && priority.color_code ? priority.color_code : '#000000');
          setNewPriority('');
          setShowPriorityEditInput(false);

          notifications.show({
            color: theme.primaryColor,
            title: response.payload.message,
            icon: <IconCheck />,
            autoClose: 5000,
            // withCloseButton: true,
          });
          const timer = setTimeout(() => {
            dispatch(removeSuccessMessage());
          }, 5000); // Clear notification after 3 seconds

          return () => clearTimeout(timer);

        }

      })
    }
  };

  const handleSelectPriority = (priority) => {
    if(taskId && taskId !== 'undefined' && priority){
      dispatch(editTask({id: taskId, data: {priority: priority, 'updated_by': loggedUserId}}))
    }
    setSelectedPriority(priority ? priority.id : '');
    setSelectedPriorityName(priority ? priority.name : '');
    setSelectedPriorityColor(priority && priority.color_code ? priority.color_code : '#000000');
    setShowPriorityAddInput(false);
    setShowPriorityList(false);
  };

  const priorityDeleteHandler = () => modals.openConfirmModal({
    title: (
        <Title order={5}>Are you sure this priority delete?</Title>
    ),
    size: 'sm',
    radius: 'md',
    withCloseButton: false,
    children: (
        <Text size="sm">
          This action is so important that you are required to confirm it with a modal. Please click
          one of these buttons to proceed.
        </Text>
    ),
    labels: { confirm: 'Confirm', cancel: 'Cancel' },
    onCancel: () => console.log('Cancel'),
    onConfirm: () => {
      if( priorityId && projectId ){

        dispatch(deleteProjectPriority({ data : {id: priorityId, taskId: taskId, project_id: projectId}})).then((response) => {

          if( response.payload && response.payload.status === 200 ){

            // setSelectedPriority
            const newPriorities = response.payload.data;

            // map through the priorities and update the selected priority
            const priority = newPriorities.find( priority => priority.id === selectedPriority );

            setSelectedPriority(priority ? priority.id : '');

            notifications.show({
              color: theme.primaryColor,
              title: response.payload.message,
              icon: <IconCheck />,
              autoClose: 5000,
              // withCloseButton: true,
            });
            const timer = setTimeout(() => {
              dispatch(removeSuccessMessage());
            }, 3000); // Clear notification after 3 seconds

            return () => clearTimeout(timer);

          }else{
            modals.open({
              withCloseButton: false,
              centered: true,
              children: (
                  <Fragment>
                    <Text size="sm">
                      {response.payload.message}
                    </Text>
                    <div className="!grid w-full !justify-items-center">
                      <Button justify="center" onClick={() => modals.closeAll()} mt="md">
                        Ok
                      </Button>
                    </div>
                  </Fragment>
              ),
            });

          }
        });

      }
    },
  });



  return (
    <Fragment>
      <div className="priority-wrapper">
        <div className="priority-btn cursor-pointer" onClick={handlePriorityListShow}>
          <Tooltip label={`Priority`} position="top" withArrow>
            {!selectedPriority ? (
                <div className="min-w-25 px-1 py-1 items-center gap-2 inline-flex">
                  <IconMinus color="#4d4d4d" size="18" />
                  <IconChevronDown color="#4d4d4d" size="18" />
                </div>
            ) : (
                <div style={{ backgroundColor: selectedPriorityColor, height:'25px' }} className="flex px-2 py-0 rounded-[25px] items-center gap-0 inline-flex">
                  <Text className={`min-w-14 max-w-14 !pl-1.5`} lineClamp={1} c="white" size="sm" fw={400} title={selectedPriorityName}>{selectedPriorityName}</Text>
                  {/*<div className="text-white text-[14px]"></div>*/}
                  <IconChevronDown color="#ffffff" size="18"/>
                </div>
            )}
          </Tooltip>
        </div>

        {showPriorityList && hasPermission(loggedInUser && loggedInUser.llc_permissions, ['superadmin', 'admin', 'director', 'manager', 'line_manager', 'employee', 'task-edit']) && (
          <div ref={selectPriorityRef} className="selectpriority-list border rounded-lg bg-white shadow px-2 py-3 absolute z-10 min-w-[250px] max-w-[250px]">
            {projectPriorities && projectPriorities.length>0 &&  projectPriorities.map((priority, index) => (
                <Grid columns={12} className={`hover:bg-[#ebf1f4]`}>
                  <Grid.Col span={10} className={`!py-1`}>
                    <div
                        className={`flex items-center gap-2 w-full cursor-pointer text-[12px] p-1`}
                        key={index}
                        onClick={() => handleSelectPriority(priority)}
                    >
                      {selectedPriority === priority.id ? <IconCheck size="14" /> : null}
                      <Text lineClamp={1} c="black" size="xs" fw={400}>{ priority.name}</Text>
                    </div>
                  </Grid.Col>
                  <Grid.Col span={1} className={`flex items-center !py-1`}>
                    {  hasPermission(loggedInUser && loggedInUser.llc_permissions, [ 'superadmin', 'admin', 'director' ] ) &&
                        <ActionIcon onClick={()=> priorityEditHandler(priority)} variant="transparent" aria-label="Edit">
                          <IconEdit size={16} stroke={1} color="#ED7D31"/>
                        </ActionIcon>
                    }
                  </Grid.Col>
                </Grid>

            ))}

            {hasPermission(loggedInUser && loggedInUser.llc_permissions, ['superadmin', 'admin', 'director']) &&
              <Box className={`border-t border-t-[#C8C8C8] pt-1.5 mt-2`}>
                {showPriorityAddInput ? (
                    <div className="flex items-center gap-1 py-1">
                      <input
                          className="w-[30px] h-[30px] rounded-sm text-[12px]"
                          type="color"
                          value={newPriorityColor}
                          onChange={handleColorInputChange}
                          placeholder="Color"
                      />
                      <TextInput
                          size="xs"
                          className="text-[12px]"
                          defaultValue={newPriority}
                          onChange={handleInputChange}
                          placeholder={'Type name here'}
                          rightSection={
                            <ActionIcon onClick={handleAddPriority} size={24} radius="xl" color="#ED7D31" variant="filled">
                              <IconDeviceFloppy style={{width: '18px', height: '18px'}} stroke={1.5}/>
                            </ActionIcon>
                          }
                      />

                    </div>
                ) : (
                    !showPriorityEditInput && (
                        <span className="block cursor-pointer text-[12px] p-1 text-[#ED7D31]" onClick={handleCreatePriority}>+ Create Priority</span>
                    )
                )}

                { showPriorityEditInput &&
                    <div className="flex items-center gap-1 py-1">
                      <input
                          className="w-[30px] h-[30px] rounded-sm text-[12px]"
                          type="color"
                          value={newPriorityColor}
                          onChange={handleColorInputChange}
                          placeholder="Color"
                      />
                      <TextInput
                          size="xs"
                          className="w-full text-[12px]"
                          value={newPriority}
                          onChange={handleInputChange}
                          placeholder={'Type name here'}
                          rightSection={
                            <ActionIcon onClick={handleUpdatePriority} size={24} radius="xl" color="#ED7D31" variant="filled">
                              <IconDeviceFloppy style={{width: '18px', height: '18px'}} stroke={1.5}/>
                            </ActionIcon>
                          }
                      />

                      <ActionIcon onClick={priorityDeleteHandler} size={24} radius="xl" variant="transparent">
                        <IconTrash size="24" stroke={1.5} color={`red`}/>
                      </ActionIcon>
                      {/*<button className={`border rounded-md w-[35px] h-[30px]`} onClick={handleAddPriority}><IconCheck color="#4d4d4d" size="22" /></button>*/}
                    </div>
                }
              </Box>
            }


          </div>
        )}
      </div>
    </Fragment>
  );
};

export default TaskPriority;
