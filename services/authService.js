const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const config = require('../config');
const jwt = require('jsonwebtoken');

class AuthService {

    // Check if passwords are equal
    isPasswordsEqual = (password, passwordValidation) => {
        return password === passwordValidation;
    }

    // Check if the input sent isn't white-space / empty string.
    isInputValid = (username, password) => {
        if (!(username && username.trim() !== "")) {
            return false;
        }

        if (!(password && password.trim() !== "")) {
            return false;
        }

        return true;
    }

    // Encrypt password
    encryptPassword = async (password) => {
        return await bcrypt.hash(password, 10);
    }

    // Search for a user, by name, in DB
    findUserByName = async (username) => {
        return await UserModel.findOne({ username: username });
    }

    // Create a new user in DB of type MongoDB
    createUser = async (username, encryptedPassword) => {
        return await UserModel.create({
            username: username,
            password: encryptedPassword
        });
    }

    // Create a token to send the user on login / signup
    createToken = (user) => {
        return jwt.sign(
            { user_id: user._id },
            config.TOKEN_KEY,
            { expiresIn: "2h" }
        );
    }

    // Check if the input's password is the same as the one in the DB, when encrypted.
    validateEncryptedPassword = async (password, user) => {
        return await bcrypt.compare(password, user.password);
    }
}

module.exports = new AuthService();