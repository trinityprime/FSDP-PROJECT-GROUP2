const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');
const { sign } = require('jsonwebtoken');
require('dotenv').config();

// login to admin acc 
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email, role: 'admin' } });

    if (!user) {
        return res.status(400).json({ message: 'Email or password is incorrect' });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        return res.status(400).json({ message: 'Email or password is incorrect' });
    }

    const token = sign({ id: user.id, email: user.email, role: user.role }, process.env.APP_SECRET, { expiresIn: '1h' });

    res.json({ token });
});

module.exports = router;
