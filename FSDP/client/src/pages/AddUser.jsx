import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, IconButton, InputAdornment } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import InputMask from 'react-input-mask';
import dayjs from 'dayjs';

function AddUser() {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            phoneNumber: "",
            dob: "",
        },
        validationSchema: yup.object({
            name: yup.string().trim()
                .min(3, 'Name must be at least 3 characters')
                .max(50, 'Name must be at most 50 characters')
                .required('Name is required')
                .matches(/^[a-zA-Z '-,.]+$/, "Name only allow letters, spaces and characters: ' - , ."),
            email: yup.string().trim()
                .email('Enter a valid email')
                .max(50, 'Email must be at most 50 characters')
                .required('Email is required'),
            password: yup.string().trim()
                .min(8, 'Password must be at least 8 characters')
                .max(50, 'Password must be at most 50 characters')
                .required('Password is required')
                .matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/, "Password must contain at least 1 letter and 1 number"),
            confirmPassword: yup.string().trim()
                .required('Confirm password is required')
                .oneOf([yup.ref('password')], 'Passwords must match'),
            phoneNumber: yup.string().trim()
                .required()
                .matches(/^\d{8}$/, "Phone number must be 8 digits"),
            dob: yup.string().trim()
                .required("Date of birth is required")
                .matches(/^(0[1-9]|[1-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4}$/, 'Invalid date format (dd/mm/yyyy)'),
        }),
        onSubmit: async (values) => {
            try {
                const data = {
                    name: values.name.trim(),
                    email: values.email.trim().toLowerCase(),
                    password: values.password.trim(),
                    phoneNumber: values.phoneNumber.replace(/\s/g, ''),
                    dob: dayjs(values.dob, 'DD/MM/YYYY').toISOString(),
                    role: selectedRole,
                };
                const response = await http.post("/user", data);
                toast.success(response.data.message);
                console.log(response.data);
                navigate("/profile"); 
            } catch (err) {
                toast.error(err.response.data.message || 'Failed to add user');
            }
        }
    });

    const handleRoleChange = (event) => {
        setSelectedRole(event.target.value);
    };

    const handlePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    return (
        <Box sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <Typography variant="h5" sx={{ my: 2 }}>
                Add New User
            </Typography>

            <Box component="form" sx={{ maxWidth: '500px' }} onSubmit={formik.handleSubmit}>
                <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="Name"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                />

                <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="Email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                />

                <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="Password"
                    name="password" type={showPassword ? 'text' : 'password'}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={handlePasswordVisibility} edge="end">
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                            </InputAdornment>
                        )
                    }}
                />

                <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="Confirm Password"
                    name="confirmPassword" type="password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                />

                <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="Phone Number"
                    name="phoneNumber"
                    value={formik.values.phoneNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                    helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                />

                <InputMask
                    mask="99/99/9999"
                    value={formik.values.dob}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                >
                    {() => (
                        <TextField
                            fullWidth margin="dense" autoComplete="off"
                            label="Date of Birth (dd/mm/yyyy)"
                            name="dob"
                            error={formik.touched.dob && Boolean(formik.errors.dob)}
                            helperText={formik.touched.dob && formik.errors.dob}
                        />
                    )}
                </InputMask>

                <FormControl fullWidth sx={{ my: 1 }}>
                    <InputLabel id="role-label">Role</InputLabel>
                    <Select
                        labelId="role-label"
                        id="role"
                        value={selectedRole}
                        onChange={handleRoleChange}
                        label="Role"
                    >
                        <MenuItem value="">Select role</MenuItem>
                        <MenuItem value="volunteer">Volunteer</MenuItem>
                        <MenuItem value="organization">Organization</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem> 
                    </Select>
                </FormControl>

                <Button fullWidth variant="contained" sx={{ mt: 2 }} type="submit">
                    Add User
                </Button>
            </Box>
            <ToastContainer />
        </Box>
    );
}

export default AddUser;
