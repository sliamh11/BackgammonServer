const express = require('express');
const UserModel = require('../models/userModel');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // returns all the usernames in the database.
        await UserModel.find((err, users) => {
            if(err){
                throw err;
            }
            let allUsers = users.map((user) => {
                return user.username;
            })
            return res.send(allUsers);
        });
    } catch (error) {
        res.status(400).send("Couldn't get users list.");
    }

});

module.exports = router;