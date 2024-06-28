const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { validateToken } = require('../middlewares/auth');
const yup = require('yup');

// gets profile info 
router.get("/", validateToken, async (req, res) => {
    let userId = req.user.id;
    let user = await User.findByPk(userId, {
        attributes: ["id", "name", "email", "phoneNumber", "dob", "role", "createdAt", "updatedAt"]
    });

    if (!user) {
        res.sendStatus(404);
        return;
    }
    res.json(user);
});

// updates profile info
router.put("/", validateToken, async (req, res) => {
    let userId = req.user.id;
    let data = req.body;

    let validationSchema = yup.object({
        name: yup.string().trim()
        .min(3)
        .max(100)
        .required(),
        email: yup.string().trim()
        .email()
        .required(),
        phoneNumber: yup.string().trim()
        .matches(/^\d{8}$/, "Phone number must be 8 digits"),
        dob: yup.date()
        .nullable()
    });

    try {
        data = await validationSchema.validate(data, { abortEarly: false });

        let num = await User.update(data, {
            where: { id: userId }
        });

        if (num == 1) {
            res.json({
                message: "Profile was updated successfully."
            });
        } else {
            res.status(400).json({
                message: `Cannot update profile with id ${userId}.`
            });
        }
    } catch (err) {
        res.status(400).json({ errors: err.errors });
    }
});


// deletes profile 
router.delete("/", validateToken, async (req, res) => {
    let userId = req.user.id;

    let num = await User.destroy({
        where: { id: userId }
    });

    if (num == 1) {
        res.json({
            message: "User account was deleted successfully."
        });
    } else {
        res.status(400).json({
            message: `Cannot delete user account with id ${userId}.`
        });
    }
});

module.exports = router;
