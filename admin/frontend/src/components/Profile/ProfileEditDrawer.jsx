import React, { useEffect, useState } from 'react';
import {
    TextInput,
    Text,
    Paper,
    Group,
    PaperProps,
    Button,
    Avatar,
    FileInput,
    Divider,
    Box,
    Select, LoadingOverlay
} from '@mantine/core';
import { IconPhoto, IconDeviceFloppy } from '@tabler/icons-react';
import { useDispatch, useSelector } from "react-redux";
import {Link, useNavigate} from 'react-router-dom';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { fetchAllRoles } from "../../store/auth/roleSlice";
import { createUser, editUser, fetchUser, uploadProfilePhoto } from "../../store/auth/userSlice";
import { useForm } from '@mantine/form';
import { hasPermission } from "../ui/permissions";
import { showNotification } from "@mantine/notifications";
const ProfileEditDrawer = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const { user } = useSelector((state) => state.auth.user);
    const { loggedInUser } = useSelector((state) => state.auth.session);
    const icon = <IconPhoto style={{ width: "32px", height: "32px" }} stroke={1.5} />;

    const id = loggedInUser?.loggedUserId;

    // console.log(id);
    // return;

    useEffect(() => {
        dispatch(fetchAllRoles());
        dispatch(fetchUser(id)).then((response) => {
            if (response.payload && response.payload.status && response.payload.status === 200) {
                setTimeout(() => {
                    setLoading(false);
                }, 500);
            }
        });
    }, [dispatch, id, refreshKey]);
    const { roles } = useSelector((state) => state.auth.role);
    const [file, setFile] = useState(null);
    const handleFileUpload = (file) => {
        setFile(file);
    };

    const form = useForm({
        name: user && user.id ? user.id : id,
        initialValues: {
            firstName: user && user.firstName ? user.firstName : '',
            lastName: user && user.lastName ? user.lastName : '',
            email: user && user.email ? user.email : '',
            phoneNumber: user && user.phoneNumber ? user.phoneNumber : '',
            roles: user && user.llc_roles && user.llc_roles.length > 0 ? [{ id: user.llc_roles[0].id, name: user.llc_roles[0].name }] : [],
        },
        enableReinitialize: true,
        validate: {
            firstName: (value) => (value.length < 2 ? 'First name is required' : null),
            email: (value) => (value.length < 1 ? 'Email is required' : (/^\S+@\S+$/.test(value) ? null : 'Invalid email')),
            phoneNumber: (value) => (value && !isValidPhoneNumber(value) ? 'Invalid phone number' : null),
        },

    });

    const handleSubmit = (values) => {
        const formData = new FormData();

        formData.append('firstName', values.firstName);
        formData.append('lastName', values.lastName);
        formData.append('email', values.email);
        formData.append('phoneNumber', values.phoneNumber);
        formData.append('roles', JSON.stringify(values.roles));
        formData.append('file', file);

        dispatch(editUser({ id: id, data: formData })).then((response) => {
            if (response.payload && response.payload.status && response.payload.status === 200) {
                showNotification({
                    id: 'load-data',
                    loading: true,
                    title: 'User',
                    message: response.payload && response.payload.message && response.payload.message,
                    autoClose: 2000,
                    disallowClose: true,
                    color: 'green',
                });

                setRefreshKey((prevKey) => prevKey + 1);
                navigate('/dashboard');
                setFile(null);

                // if (hasPermission(loggedInUser && loggedInUser.llc_permissions, ['superadmin', 'admin'])) {
                //     navigate('/users');
                // } else {
                //     navigate('/dashboard');
                // }
            }
            if (response.payload && response.payload.status && response.payload.status !== 200) {
                showNotification({
                    id: 'load-data',
                    loading: true,
                    title: 'User',
                    message: response.payload && response.payload.message && response.payload.message,
                    autoClose: 2000,
                    disallowClose: true,
                    color: 'red',
                });
            }
        }
        );
    };

    useEffect(() => {
        if (user) {
            form.setFieldValue('firstName', user.firstName);
            form.setFieldValue('lastName', user.lastName);
            form.setFieldValue('email', user.email);
            form.setFieldValue('phoneNumber', user.phoneNumber);
            form.setFieldValue('roles', user && user.llc_roles && user.llc_roles.length > 0 ? [{ id: user.llc_roles[0].id, name: user.llc_roles[0].name }] : []);
        }
    }, [user]);

    const onUserRoleChangeHandler = (e) => {
        if (e) {
            form.setFieldValue('roles', [{ id: e.value, name: e.label }]);
        } else {
            form.setFieldValue('roles', []);
        }
    };

    return (
        <>
            <LoadingOverlay
                visible={loading}
                zIndex={1000}
                overlayProps={{ radius: 'sm', blur: 4 }}
            />
            {!loading && (
                <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
                    <Paper radius="md" p="lg" withBorder maw={500}>

                        <Group justify="space-between" mb="sm">
                            <Text size="lg" fw={500}>
                                Edit Profile
                            </Text>
                            {user && user.avatar &&
                                <Avatar src={user?.avatar} alt={user?.name} radius="xl" size={40} />
                            }
                            
                        </Group>

                        <FileInput
                            className={`!w-full`}
                            size="md"
                            mb="xs"
                            accept="image/png,image/jpeg,image/jpg"
                            clearable
                            placeholder="Upload Profile Picture"
                            leftSection={icon}
                            leftSectionPointerEvents="none"
                            onChange={handleFileUpload}
                        />

                        <Box mb="md" mt="md">
                            <Group grow>
                                <TextInput
                                    size="sm"
                                    label="First Name"
                                    placeholder="First name"
                                    {...form.getInputProps('firstName')}
                                />
                                <TextInput
                                    size="sm"
                                    label="Last Name"
                                    placeholder="Last name"
                                    {...form.getInputProps('lastName')}
                                />
                            </Group>

                            {hasPermission(loggedInUser && loggedInUser.llc_permissions, ['superadmin']) &&
                                <div className="mb-2 mt-2">
                                    <Select
                                        label="Select Role"
                                        size="sm"
                                        placeholder="Select Role"
                                        data={roles && roles.length > 0 && roles.map((role) => ({
                                            value: role.id,
                                            label: role.name
                                        }))}
                                        defaultValue={user && user.llc_roles && user.llc_roles.length > 0 ? user.llc_roles[0].id.toString() : null}
                                        searchable
                                        allowDeselect={false}
                                        onChange={(e, option) => {
                                            onUserRoleChangeHandler(option);
                                        }}
                                    />
                                </div>
                            }

                            <div className="mt-4">
                                <Text size="sm" fw={500}>
                                    Phone
                                </Text>
                                <PhoneInput
                                    international
                                    defaultCountry="BD"
                                    className="w-full"
                                    numberInputProps={{
                                        className: "border !border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 h-[40px]"
                                    }}
                                    countrySelectProps={{
                                        className: "border !border-gray-300 rounded-l-md focus:outline-none focus:ring focus:border-blue-300 h-[40px]"
                                    }}
                                    placeholder="+12 344 678 98"
                                    label="Phone"
                                    {...form.getInputProps('phoneNumber')}
                                />
                                {form.errors.phoneNumber && (
                                    <Text c="red" mt={2}>
                                        {form.errors.phoneNumber}
                                    </Text>
                                )}

                            </div>

                            <TextInput
                                label="Email"
                                placeholder="Your email"
                                mt="sm"
                                {...form.getInputProps('email')}
                            />
                        </Box>

                        <Button
                            type="submit"
                            leftIcon={<IconDeviceFloppy size="1rem" />}
                            fullWidth
                            color="#ED7D31"
                        >
                            Save Changes
                        </Button>
                    </Paper>
                </form>
            )}
        </>
    );

}

export default ProfileEditDrawer;