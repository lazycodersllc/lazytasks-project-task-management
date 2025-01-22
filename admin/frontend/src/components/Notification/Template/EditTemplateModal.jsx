import React, {Fragment, useCallback, useEffect, useState} from 'react';
import {Modal, Select, Tabs, Textarea, TextInput, Title} from '@mantine/core';
import { useSelector, useDispatch } from 'react-redux';
import { updateNotificationTemplate} from "../store/notificationTemplateSlice";
import {showNotification} from "@mantine/notifications";

const EditTemplateModal = ({modalOpened, closeModal }) => {
    const dispatch = useDispatch();
    const {loggedUserId} = useSelector((state) => state.auth.user);
    const {notificationChannels, notificationTemplate, notificationActions } = useSelector((state) => state.notifications.notificationTemplate);
    const [title, setTitle] = useState( notificationTemplate && notificationTemplate.title ? notificationTemplate.title : 'Type title here');
    const [description, setDescription] = useState( notificationTemplate && notificationTemplate.description ? notificationTemplate.description : '');
    const [content, setContent] = useState( notificationTemplate && notificationTemplate.content ? notificationTemplate.content : {});
    const [notificationAction, setNotificationAction] = useState(notificationTemplate && notificationTemplate.notification_action_name ? notificationTemplate.notification_action_name : '');
    const [emailSubject, setEmailSubject] = useState( notificationTemplate && notificationTemplate.email_subject ? notificationTemplate.email_subject : '');
    const [mobileNotificationTitle, setMobileNotificationTitle] = useState(notificationTemplate && notificationTemplate.mobile_notification_title ? notificationTemplate.mobile_notification_title : '');

    useEffect(() => {
        setTitle(notificationTemplate && notificationTemplate.title ? notificationTemplate.title : 'Type title here');
        setDescription(notificationTemplate && notificationTemplate.description ? notificationTemplate.description : '');
        setContent(notificationTemplate && notificationTemplate.content ? notificationTemplate.content : {});
        setNotificationAction(notificationTemplate && notificationTemplate.notification_action_name ? notificationTemplate.notification_action_name : '');
        setEmailSubject(notificationTemplate && notificationTemplate.email_subject ? notificationTemplate.email_subject : '')
        setMobileNotificationTitle(notificationTemplate && notificationTemplate.mobile_notification_title ? notificationTemplate.mobile_notification_title : '');
    }, [notificationTemplate]);

    const handleTemplateUpdate = () => {
        const newTemplateData = {
            title: title,
            created_by: loggedUserId,
            description: description,
            content: content,
            notification_action_name: notificationAction,
            email_subject: emailSubject,
            mobile_notification_title: mobileNotificationTitle
        };

        if(newTemplateData.title!=='' && newTemplateData.title!=='Type title here'){
            dispatch(updateNotificationTemplate({id: notificationTemplate.id, data: newTemplateData})).then((response) => {
                if (response.payload && response.payload.status && response.payload.status === 200) {
                    showNotification({
                        id: 'load-data',
                        loading: true,
                        title: 'Notification Template',
                        message: response.payload && response.payload.message && response.payload.message,
                        autoClose: 2000,
                        disallowClose: true,
                        color: 'green',
                    });
                }
            }
            );
            setTitle('Type title here');
            setDescription('');
            setContent([]);
            setEmailSubject('');
            setMobileNotificationTitle('');
        }
    };

    return (
        <Fragment>
            <Modal.Root
                opened={modalOpened}
                onClose={() => {
                    closeModal()
                    handleTemplateUpdate()
                }
            }
                centered
                size="100%"
            >
                <Modal.Overlay />
                <Modal.Content radius={15}>
                    <Modal.Header px={20} py={10}>
                        <Title order={5}>Update Template</Title>
                        <Modal.CloseButton />
                    </Modal.Header>
                    <Modal.Body>
                        <div className="create-form-box">

                            <div className="mb-4">
                                <TextInput
                                    label="Do action title"
                                    placeholder="Enter your title"
                                    radius="md"
                                    size="md"
                                    styles={{
                                        borderColor: "gray.3",
                                        backgroundColor: "white",
                                        focus: {
                                            borderColor: "blue.5",
                                        },
                                    }}
                                    onChange={(e) => setTitle(e.target.value)}
                                    value={title}
                                />
                            </div>

                            <div className="mb-4">
                                {/*<Select
                                    placeholder="Select Action"
                                    data={notificationActions && Object.keys(notificationActions).map((action) => ({
                                        value: action,
                                        label: notificationActions[action]
                                    }))}
                                    clearable
                                    onChange={(e) => setNotificationAction(e)}
                                    value={notificationAction}
                                />*/}
                                <TextInput
                                    label="Do action (hook)"
                                    placeholder="Enter action name"
                                    radius="md"
                                    size="md"
                                    styles={{
                                        borderColor: "gray.3",
                                        backgroundColor: "white",
                                        focus: {
                                            borderColor: "blue.5",
                                        },
                                    }}
                                    onChange={(e) => setNotificationAction(e.target.value)}
                                    value={notificationAction}
                                />
                            </div>

                            <div className="mb-4">
                                {notificationChannels && notificationChannels.length > 0 &&
                                    <Tabs color="orange" defaultValue={notificationChannels[0].slug}>
                                        <Tabs.List>
                                            {notificationChannels.map((channel) => (
                                                    <Tabs.Tab value={channel.slug} key={channel.id}>
                                                        {channel.name}
                                                    </Tabs.Tab>
                                                )
                                            )}
                                        </Tabs.List>

                                        {notificationChannels.map((channel) => (
                                                <Tabs.Panel value={channel.slug} key={channel.id}>
                                                    {channel.slug === 'email' &&
                                                        <div className="mt-2">
                                                            <TextInput
                                                                label="Email subject"
                                                                placeholder="Enter email subject"
                                                                radius="md"
                                                                size="md"
                                                                styles={{
                                                                    borderColor: "gray.3",
                                                                    backgroundColor: "white",
                                                                    focus: {
                                                                        borderColor: "blue.5",
                                                                    },
                                                                }}
                                                                onChange={(e) => setEmailSubject(e.target.value)}
                                                                value={emailSubject}
                                                            />
                                                        </div>
                                                    }
                                                    {channel.slug === 'mobile' &&
                                                        <div className="mt-2">
                                                            <TextInput
                                                                label="Notification title"
                                                                placeholder="Enter notification title"
                                                                radius="md"
                                                                size="md"
                                                                styles={{
                                                                    borderColor: "gray.3",
                                                                    backgroundColor: "white",
                                                                    focus: {
                                                                        borderColor: "blue.5",
                                                                    },
                                                                }}
                                                                onChange={(e) => setMobileNotificationTitle(e.target.value)}
                                                                value={mobileNotificationTitle}
                                                            />
                                                        </div>
                                                    }


                                                    <div className="mt-2">
                                                        <Textarea
                                                            rows={10}
                                                            label="Message body"
                                                            resize="vertical"
                                                            name={channel.slug}
                                                            placeholder={`Enter ${channel.name} content here`}
                                                            radius="md"
                                                            size="md"
                                                            onChange={(e) => {
                                                                setContent({
                                                                    ...content,
                                                                    [channel.slug]: e.target.value
                                                                });
                                                            }}
                                                            value={content && content[channel.slug] ? content[channel.slug] : ''}
                                                        />
                                                    </div>
                                                </Tabs.Panel>
                                            )
                                        )}
                                    </Tabs>
                                }

                            </div>

                        </div>
                    </Modal.Body>
                </Modal.Content>
            </Modal.Root>
        </Fragment>
    );
}

export default EditTemplateModal;