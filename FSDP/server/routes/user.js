const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const { User } = require('../models');
const { sign } = require('jsonwebtoken');
const { validateToken } = require('../middlewares/auth');
require('dotenv').config();

const yup = require("yup");

// check if admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// register user acc
router.post("/register", async (req, res) => {
    let data = req.body;

    // Validate request body
    let validationSchema = yup.object({
        name: yup.string().trim()
            .min(3).max(50)
            .required()
            .matches(/^[a-zA-Z '-,.]+$/, "Name only allows letters, spaces and characters: ' - , ."),
        email: yup.string().trim()
            .lowercase()
            .email()
            .max(50)
            .required(),
        password: yup.string().trim()
            .min(8)
            .max(50)
            .required()
            .matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/, "Password must contain at least 1 letter and 1 number"),
        role: yup.string().trim()
            .oneOf(['volunteer', 'organization'])
            .required(),
        phoneNumber: yup.string().trim()
            .required()
            .matches(/^\d{8}$/, "Phone number must be 8 digits"),
        dob: yup.date()
            .nullable()
            .required("Date of birth is required")
            .typeError("Invalid Date."),
    });

    try {
        data = await validationSchema.validate(data, { abortEarly: false });

        if (data.role === 'admin') {
            res.status(403).json({ message: "Admin registration not allowed." });
            return;
        }

        data.password = await bcrypt.hash(data.password, 10);

        let result = await User.create(data);
        res.status(201).json({
            message: `User registered successfully.`,
            user: result
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ errors: err.errors });
    }
});


// login to user acc
router.post("/login", async (req, res) => {
    let data = req.body;
    let errorMsg = "Email or password is not correct.";
    let user = await User.findOne({
        where: { email: data.email }
    });
    if (!user) {
        res.status(400).json({ message: errorMsg });
        return;
    }
    let match = await bcrypt.compare(data.password, user.password);
    if (!match) {
        res.status(400).json({ message: errorMsg });
        return;
    }

    let userInfo = {
        id: user.id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        dob: user.dob,
        role: user.role,
    };
    let accessToken = sign(userInfo, process.env.APP_SECRET,
        { expiresIn: process.env.TOKEN_EXPIRES_IN });
    res.json({
        accessToken: accessToken,
        user: userInfo
    });
});

//add user from admin acc
router.post('/', validateToken, isAdmin, async (req, res) => {
    try {
        const { name, email, password, phoneNumber, dob, role } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            dob,
            role
        });

        await newUser.save();
        res.status(201).json({ message: 'user added!!!!!!!!!!!!!!!' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user', error });
    }
});
  

router.get("/auth", validateToken, (req, res) => {
    let userInfo = {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        phoneNumber: req.user.phoneNumber,
        dob: req.user.dob,
        role: req.user.role
    };
    res.json({
        user: userInfo
    });
});

// list users in admin acc
router.get("/", validateToken, isAdmin, async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// delete in admin acc
router.delete('/:userId', validateToken, isAdmin, async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.destroy();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// get user info for update in admin acc
router.get('/:userId', validateToken, isAdmin, async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// editing user info in admin acc
router.put('/:userId', validateToken, isAdmin, async (req, res) => {
    const userId = req.params.userId;
    const updatedUserData = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user data
        await user.update(updatedUserData);

        res.json({ message: 'User updated successfully', user: user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

module.exports = router;
