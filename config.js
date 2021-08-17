// Holds environment data.
const config = {
    PORT: process.env.API_PORT || 5000,
    MONGO_URI: process.env.MONGO_URI,
    TOKEN_KEY: "abcdefg"
};

module.exports = config;