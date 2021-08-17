const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authentication');
const authService = require('../services/authService');

router.use('/', auth, (req, res, next) => {
    // Authentication Middleware - searchs for a token and if it exists, reads it and adds the results to req.user.
    if (req.user) {
        return res.status(200).send(req.user);
    }
    next();
});

router.post('/signup', async (req, res) => {
    try {
        const username = req.body.username.value;
        const password = req.body.password.value;
        const passwordValidation = req.body.passwordValidation.value;

        // If input is invalid.
        if (!authService.isInputValid(username, password)) {
            return res.status(400).send("All input is required.");
        }

        // Check if passwords match
        if (!authService.isPasswordsEqual(password, passwordValidation)) {
            return res.status(400).send("Passwords doesn't match.");
        }

        // Check if username already exists.
        if (await authService.findUserByName(username)) {
            return res.status(409).send("Username already exists.");
        }

        const encryptedPassword = await authService.encryptPassword(password);

        // Create a new model in db
        const user = await authService.createUser(username, encryptedPassword);

        // Create a token
        user.token = authService.createToken(user);

        return res.status(201).send(user);

    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post('/login', async (req, res) => {
    try {
        const username = req.body.username.value;
        const password = req.body.password.value;

        // Validate Input
        if (!(authService.isInputValid(username, password))) {
            return res.status(400).send("All input is required.");
        }

        // check if user exists
        const user = await authService.findUserByName(username);
        if (user && (await authService.validateEncryptedPassword(password, user))) {
            // Create token
            user.token = authService.createToken(user);
            return res.status(200).send(user);
        }

        return res.status(400).send("User not found.");
    } catch (error) {
        res.status(400).send(error.message);
    }
});

module.exports = router;