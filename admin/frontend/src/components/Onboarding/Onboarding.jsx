import React, { useState, useEffect, Fragment, useRef } from 'react';
import {
    ActionIcon,
    Button,
    Input,
    Menu,
    rem,
    ScrollArea,
    Textarea,
    TextInput,
    Title,
    Text,
    Card, Group, Divider, Flex
} from '@mantine/core';
import { useSelector, useDispatch } from 'react-redux';
import { IconDeviceFloppy, IconEdit } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import OnboardingForm from "./OnboardingForm";
import welcome from "../../img/welcome.png"

const Onboarding = () => {

    const dispatch = useDispatch();
    const [showNextComponent, setShowNextComponent] = useState(false);

    const handleGetStarted = () => {
        setShowNextComponent(true);
    };

    return (
        <>
            {showNextComponent ? (
                <OnboardingForm />
            ) : (
                <Flex
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        // height: '90vh',
                    }}
                >
                    <Card shadow="sm" padding="lg" radius="lg" withBorder style={{
                        width: '684px', height: '419px', backgroundColor: '#285364', color: '#fff',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <img
                            src={welcome}
                            alt="Welcome to LazyTasks"
                            style={{
                                width: '100px',
                                height: 'auto',
                                marginBottom: '1rem',
                            }}
                        />
                        <Title order={2} align="center" mb="md" style={{ color: '#fff'}}>
                            Welcome to LazyTasks
                        </Title>
                        <Text align="center" c="white" mb="md" size='md'>
                            You’ve successfully installed the LazyTasks project management tool. We're excited to help you stay organized and boost your productivity!
                        </Text>
                        <Group position="center">
                            <Button className={`font-semibold`} variant="filled" color="#ED7D31" radius="sm" size='md'
                                style={{ width: '250px' }} fullWidth onClick={handleGetStarted}>
                                Get Started
                            </Button>
                        </Group>
                    </Card>
                </Flex>
            )}
        </>
    );
};

export default Onboarding;
