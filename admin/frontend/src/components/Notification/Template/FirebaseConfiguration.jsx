import React, {Fragment, useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    Checkbox,
    Container,
    Divider, Fieldset,
    Grid,
    Group, NumberInput,
    Paper, PasswordInput,
    ScrollArea,
    Tabs, Textarea,
    TextInput,
    Title
} from '@mantine/core';
import {useForm} from "@mantine/form";
import {editSetting, fetchSettings} from "../../Settings/store/settingSlice";
import {showNotification} from "@mantine/notifications";
const FirebaseConfiguration = () => {
    // const users = useSelector((state) => state.users);
    const { loggedInUser } = useSelector((state) => state.auth.session)
    const { settings } = useSelector((state) => state.settings.setting)

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchSettings());
    }, [dispatch]);

    const [firebaseClientEmail, setFirebaseClientEmail] = useState('');
    const [firebasePrivateKey, setFirebasePrivateKey] = useState('');

    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
            firebase_client_email: firebaseClientEmail || '',
            firebase_private_key: firebasePrivateKey || '',
        },

        validate: {
            firebase_client_email: (value) => (value.length < 1 ? 'Email is required' : null),
            firebase_private_key: (value) => (value.length < 1 ? 'Private key is required' : null),
        },
    });

    useEffect(() => {
        if(settings && settings.firebase_configuration) {
            try {
                // Parse the JSON string
                const parsedData = JSON.parse(settings.firebase_configuration);

                // Check if the parsedData is defined and contains the sms_api_secret_key key
                if (parsedData && parsedData.firebase_client_email) {
                    setFirebaseClientEmail(parsedData.firebase_client_email);
                    form.setFieldValue('firebase_client_email', parsedData.firebase_client_email);
                }
                if (parsedData && parsedData.firebase_private_key) {
                    setFirebasePrivateKey(parsedData.firebase_private_key);
                    form.setFieldValue('firebase_private_key', parsedData.firebase_private_key);
                }

            } catch (error) {
                console.error("JSON parsing error:", error.message);
            }
        }
    }, [settings]);

    const handlerFirebaseConfigurationSubmit = (values) => {
        const formData = new FormData();
        formData.append('settings', JSON.stringify({...settings, firebase_configuration: values , type:'firebase'}));
        dispatch(editSetting({ data: formData })).then((response) => {
            if(response.payload && response.payload.status && response.payload.status===200){
                showNotification({
                    id: 'load-data',
                    loading: true,
                    title: 'Firebase Settings',
                    message: response.payload && response.payload.message && response.payload.message,
                    autoClose: 2000,
                    disallowClose: true,
                    color: 'green',
                });
            }
            if(response.payload && response.payload.status && response.payload.status !== 200){
                showNotification({
                    id: 'load-data',
                    loading: true,
                    title: 'Firebase Settings',
                    message: response.payload && response.payload.message && response.payload.message,
                    autoClose: 2000,
                    disallowClose: true,
                    color: 'red',
                });
            }
        });
        // dispatch(editSetting({ data: {...settings, firebase_configuration: values , type:'sms'} }));
    };

  return (
    <Fragment>
        <Paper>
            <form onSubmit={form.onSubmit((values) => handlerFirebaseConfigurationSubmit(values))}>
                <Fieldset legend=" Firebase Information ">
                    <div className="mb-4">
                        <Grid>
                            <Grid.Col span={{md: 12, lg: 12}}>
                                <TextInput
                                    size="md"
                                    withAsterisk
                                    label="Client Email"
                                    placeholder="Enter client email"
                                    key={form.key('firebase_client_email')}
                                    {...form.getInputProps('firebase_client_email')}
                                    defaultValue={firebaseClientEmail}
                                />
                            </Grid.Col>
                            <Grid.Col span={{md: 12, lg: 12}}>
                                <Textarea
                                    resize="vertical"
                                    size="lg"
                                    rows={10}
                                    withAsterisk
                                    label="Private Key"
                                    placeholder="Enter private key"
                                    key={form.key('firebase_private_key')}
                                    {...form.getInputProps('firebase_private_key')}
                                    defaultValue={firebasePrivateKey}
                                />
                            </Grid.Col>

                        </Grid>

                    </div>
                </Fieldset>


                <Group justify="flex-start" mt="md">
                    <Button variant="filled" color="#ED7D31" type="submit">Submit</Button>
                </Group>
            </form>
        </Paper>

    </Fragment>
  );
};

export default FirebaseConfiguration;
