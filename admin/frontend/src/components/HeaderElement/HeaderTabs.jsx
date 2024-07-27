import cx from 'clsx'; 
import { Link } from 'react-router-dom';
import React, { useState } from 'react';  
import { IconPaperclip } from '@tabler/icons-react';   

import {
    Container,
    Avatar,
    UnstyledButton,
    Group,
    Text,
    Menu,
    Burger,
    rem,
    Button,
    useMantineTheme,
    Drawer, Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconLogout, 
  IconEdit, 
  IconSettings, 
  IconChevronDown, 

} from '@tabler/icons-react'; 
import '@mantinex/mantine-logo/styles.css';
import classes from './HeaderTabs.module.css';  
import WorkspaceLists from '../Elements/Workspace/WorkspaceLists';
import {useSelector} from "react-redux";
import useAuth from "../../utils/useAuth";

const dashboardMainMenuData = [
    {
      label: 'Dashboard',
      url: '#/dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <g clip-path="url(#clip0_555_477)">
            <path d="M5 12H3L12 3L21 12H19" stroke="#202020" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M5 12V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V12" stroke="#202020" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 21V15C9 14.4696 9.21071 13.9609 9.58579 13.5858C9.96086 13.2107 10.4696 13 11 13H13C13.5304 13 14.0391 13.2107 14.4142 13.5858C14.7893 13.9609 15 14.4696 15 15V21" stroke="#202020" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <defs>
            <clipPath id="clip0_555_477">
                <rect width="24" height="24" fill="white"/>
            </clipPath>
            </defs>
        </svg>
      ),
    },
    {
      label: 'Daily Zen',
      url: '',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <g clip-path="url(#clip0_555_468)">
            <path d="M4 7C4 6.46957 4.21071 5.96086 4.58579 5.58579C4.96086 5.21071 5.46957 5 6 5H18C18.5304 5 19.0391 5.21071 19.4142 5.58579C19.7893 5.96086 20 6.46957 20 7V19C20 19.5304 19.7893 20.0391 19.4142 20.4142C19.0391 20.7893 18.5304 21 18 21H6C5.46957 21 4.96086 20.7893 4.58579 20.4142C4.21071 20.0391 4 19.5304 4 19V7Z" stroke="#202020" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 3V7" stroke="#202020" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 3V7" stroke="#202020" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4 11H20" stroke="#202020" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 15H10V17H8V15Z" stroke="#202020" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <defs>
            <clipPath id="clip0_555_468">
                <rect width="24" height="24" fill="white"/>
            </clipPath>
            </defs>
        </svg>
      ),
    },
    {
      label: 'My Task',
      url: '#/my-task',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <g clip-path="url(#clip0_555_461)">
            <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H10M19 12V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15" stroke="#202020" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13 17V16C13 15.7348 13.1054 15.4804 13.2929 15.2929C13.4804 15.1054 13.7348 15 14 15H15M18 15H19C19.2652 15 19.5196 15.1054 19.7071 15.2929C19.8946 15.4804 20 15.7348 20 16V17M20 20V21C20 21.2652 19.8946 21.5196 19.7071 21.7071C19.5196 21.8946 19.2652 22 19 22H18M15 22H14C13.7348 22 13.4804 21.8946 13.2929 21.7071C13.1054 21.5196 13 21.2652 13 21V20" stroke="#202020" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5C15 5.53043 14.7893 6.03914 14.4142 6.41421C14.0391 6.78929 13.5304 7 13 7H11C10.4696 7 9.96086 6.78929 9.58579 6.41421C9.21071 6.03914 9 5.53043 9 5Z" stroke="#202020" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </g>
            <defs>
            <clipPath id="clip0_555_461">
                <rect width="24" height="24" fill="white"/>
            </clipPath>
            </defs>
        </svg>
      ),
    },
  ];

  const DashboardMenu = ({ label, url, icon }) => (
    <a href={url} key={label} className="flex items-center">
      <div className='mr-1'>{icon}</div>
      <span>{label}</span>
    </a>
  );

export function HeaderTabs() {
  const theme = useMantineTheme();
  // const [opened, { toggle }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const { loggedInUser } = useSelector((state) => state.auth.session)

  const [isVisible, setIsVisible] = useState(false);
  const handleProjectCreateSlide = () => {
      setIsVisible(!isVisible);
    };
    const {loggedUserId} = useSelector((state) => state.auth.user)
    const icon = <IconPaperclip style={{ width: rem(18), height: rem(18) }} stroke={1.5} />;
    const [opened, { open, close, toggle }] = useDisclosure(false);
    const { signOut } = useAuth();

  return (
    <div className={`relative ${classes.header}`}>
     

      <Container className="py-1" size="full">
        <Group justify="space-between">
            {/* <MantineLogo size={28} /> */} 
            <div className='flex space-x-4'>
              {dashboardMainMenuData.map((menuItem) => (
                <DashboardMenu {...menuItem} />
              ))}
            </div> 

            <div className='flex items-center gap-4'>
                {/* <ButtonMenu /> */}
                <Button onClick={open}  color="#ED7D31">Workspace</Button>

                <Burger opened={opened} onClick={toggle} hiddenFrom="xs" size="sm" /> 
                <Menu
                    width={260}
                    position="bottom-end"
                    transitionProps={{ transition: 'pop-top-right' }}
                    onClose={() => setUserMenuOpened(false)}
                    onOpen={() => setUserMenuOpened(true)}
                    withinPortal
                >
                    <Menu.Target>
                    <UnstyledButton
                        className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
                    >
                        <Group gap={7}>
                        <Avatar src={loggedInUser?.avatar} alt={loggedInUser?.name} radius="xl" size={32} />
                        <Text fw={500} size="sm" lh={1} mr={3}>
                            {loggedInUser ? loggedInUser.name : ''}
                        </Text>
                        <IconChevronDown style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
                        </Group>
                    </UnstyledButton>
                    </Menu.Target>
                    <Menu.Dropdown> 
                     
                    
                    <Link to={`/profile/${loggedUserId}`}>
                      <Menu.Item 
                          leftSection={
                          <IconEdit
                              style={{ width: rem(16), height: rem(16) }}
                              color={theme.colors.yellow[6]}
                              stroke={1.5}
                          />
                          }
                      > 
                      Profile
                      </Menu.Item>   
                    </Link> 

                    <Link to="/settings">
                      <Menu.Item
                          leftSection={
                          <IconSettings style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                          }
                      >
                          settings
                      </Menu.Item>  
                    </Link> 
                    
                    <Menu.Item
                        onClick={signOut}
                        leftSection={
                        <IconLogout style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                        }
                    >
                        Logout
                    </Menu.Item>
                    
                    </Menu.Dropdown>
                </Menu>
            </div>
        </Group>
      </Container>
      
 
        <div className="drawer mt-[16]"> 
          <Drawer opened={opened} onClose={close} 
          position="right" 
          withCloseButton={false} 
          size="md"
          overlayProps={{ backgroundOpacity: 0, blur: 0 }}
          >
              <Drawer.Body>

                  <div className='workspace-create-card'>
                      <div className="relative flex justify-between mb-4">
                          <Title order={4}>
                              Workspace
                          </Title>
                          <Drawer.CloseButton />
                      </div>
                      <WorkspaceLists />
                  </div>
              </Drawer.Body>
           
          </Drawer>
        </div>
 

 
    </div>
  );
}