import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import http from '../http';
import { useFormik } from 'formik';
import * as yup from 'yup';

function EditUser() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        dob: ""
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        http.get(`/user/${id}`).then((res) => {
            setUser(res.data);
            setLoading(false);
        });
    }, [id]);

    const formik = useFormik({
        initialValues: user,
        enableReinitialize: true,
        validationSchema: yup.object({
            name: yup.string().trim()
                .min(3, 'Name must be at least 3 characters')
                .max(100, 'Name must be at most 100 characters')
                .required('Name is required'),
            email: yup.string().trim()
                .email('Invalid email address')
                .required('Email is required'),
            phoneNumber: yup.string().trim()
                .required('Phone number is required'),
            dob: yup.date()
                .required('Date of birth is required')
        }),

        onSubmit: (data) => {
            http.put(`/user/${id}`, data)
                .then((res) => {
                    toast.success("User updated successfully!");
                    console.log(res.data)
                    navigate("/profile");
                })
                .catch((err) => {
                    toast.error("Failed to update user.");
                });
        }
    });


    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                Edit User
            </Typography>
            {
                !loading && (
                    <Box component="form" onSubmit={formik.handleSubmit}>
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
                            label="Phone Number"
                            name="phoneNumber"
                            value={formik.values.phoneNumber}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                            helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                        />
                        <TextField
                            fullWidth margin="dense" autoComplete="off"
                            label="Date of Birth"
                            name="dob"
                            type="date"
                            value={formik.values.dob}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.dob && Boolean(formik.errors.dob)}
                            helperText={formik.touched.dob && formik.errors.dob}
                            InputLabelProps={{ shrink: true }}
                        />
                        <Box sx={{ mt: 2 }}>
                            <Button variant="contained" type="submit">
                                Update
                            </Button>
                        </Box>
                    </Box>
                )
            }
            <ToastContainer />
        </Box>
    );
}

export default EditUser;
