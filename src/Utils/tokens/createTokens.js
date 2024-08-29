const jwt = require('jsonwebtoken');
const ServerError = require('../errors/ServerError');

function createAccessToken(user) {
    try {
        return jwt.sign(
            { 
                id: user._id, 
                username: user.username,
                tokenVersion: user.tokenVersion,
                token_type: 'access', 
            }, 
            process.env.ACCESS_TOKEN_SECRET, 
            { expiresIn: '15m' }
        );
    } catch (error) {
        throw new ServerError('Internal Server Error - Failed to create access token!');
    }
}

function createRefreshToken(user) {
    try {
        return jwt.sign(
            { 
                id: user._id, 
                username: user.username,
                tokenVersion: user.tokenVersion,
                token_type: 'refresh', 
            }, 
            process.env.REFRESH_TOKEN_SECRET, 
            { expiresIn: '7d' }
        );
    } catch (error) {
        throw new ServerError('Internal Server Error - Failed to create refresh token');
    }
}

module.exports = {
    createAccessToken,
    createRefreshToken
};
