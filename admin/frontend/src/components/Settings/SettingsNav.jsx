import React from 'react';
import {Button, Title} from '@mantine/core';
import { useLocation, NavLink, Link } from 'react-router-dom';
import { IconX } from '@tabler/icons-react';
const SettingsNav = () => {
    const location = useLocation();
    return (
        <>
           <div className="relative flex justify-between mb-3">
               <Title order={4}>
                   Settings
               </Title>
                <Link to="/dashboard" className="text-gray-600 hover:text-gray-800 focus:shadow-none">
                    <IconX size={24} color="#202020" /> 
                </Link> 
            </div> 
            <div className="relative flex mb-5 space-x-3">
                <NavLink to="/settings" className="nav-link" activeClassName="active-link">
                    <Button 
                        size="sm"
                        color={location.pathname === '/settings' ? "#39758D" : "#EBF1F4"}
                        styles={{
                            label: {
                                color: location.pathname === '/settings' ? "#fff" : "#000"
                            }
                        }}
                    >
                        User
                    </Button>
                </NavLink>
                <NavLink to="/workspace" className="nav-link" activeClassName="active-link">
                    <Button 
                        size="sm"
                        color={location.pathname === '/workspace' ? "#39758D" : "#EBF1F4"}
                        styles={{
                            label: {
                                color: location.pathname === '/workspace' ? "#fff" : "#000"
                            }
                        }}
                    >
                        Workspace
                    </Button>
                </NavLink>
                <NavLink to="/project" className="nav-link" activeClassName="active-link">
                    <Button 
                        size="sm"
                        color={location.pathname === '/project' ? "#39758D" : "#EBF1F4"}
                        styles={{
                            label: {
                                color: location.pathname === '/project' ? "#fff" : "#000"
                            }
                        }}
                    >
                        Project
                    </Button>
                </NavLink>
            </div>
        </>
        
    );
}

export default SettingsNav;
