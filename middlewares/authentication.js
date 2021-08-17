const jwt = require("jsonwebtoken");
const config = require('../config');
const UserModel = require('../models/userModel');

const verifyToken = async (req, res, next) => {
    try {
        // Look for the 'access-token' in request.
        const token = req.body.token || req.query.token || req.headers["access-token"];
        if (!token) {
            return next();
        }
        // Decode token, extract the user_id and search for the user.
        const decoded = jwt.verify(token, config.TOKEN_KEY);
        const user = await UserModel.findOne({ _id: decoded.user_id });

        // Add the user's username to an anonymous property - req.user
        req.user = user.username;
        return next();
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
};

module.exports = verifyToken;