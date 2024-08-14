const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
        throw new Error('Failed to create access token');
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
        throw new Error('Failed to create refresh token');
    }
}

const checkRefreshToken = async (refreshToken) => {
    
    if (!refreshToken)  return { valid: false, message: 'Refresh token is required' };
    

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id);

        if (!user)  return { valid: false, message: 'User not found' };

        if (decoded.tokenVersion !== user.tokenVersion) {
            return { valid: false, message: 'Invalid token version' };
        }

        return { valid: true, user };

    } catch (error) {
        return { valid: false, message: error.message === 'jwt expired' ? 'Refresh token expired' : 'Invalid refresh token' };
    }
}

const issueTokens = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header is required' });
        }

        const refreshToken = authHeader.split(' ')[1];
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token is missing' });
        }

        const { valid, user, message } = await checkRefreshToken(refreshToken);

        if (!valid) {
            return res.status(401).json({ message });
        }

        user.tokenVersion += 1;
        await user.save();

        const accessToken = createAccessToken(user);
        const newRefreshToken = createRefreshToken(user);

        return res.status(200).json({ accessToken, newRefreshToken });

    } catch (error) {
        return res.status(500).json({ message: 'Failed to issue tokens', error: error.message });
    }
}

const revokeTokens = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header is required' });
        }

        const refreshToken = authHeader.split(' ')[1];
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token is missing' });
        }

        const { valid, user, message } = await checkRefreshToken(refreshToken);

        if (!valid) {
            return res.status(401).json({ message });
        }

        user.tokenVersion += 1;
        await user.save();

        return res.status(200).json({ message: 'Tokens revoked successfully. Please log in again to generate new tokens.' });

    } catch (error) {
        return res.status(500).json({ message: 'Failed to revoke tokens', error: error.message });
    }
}

module.exports = {
    createAccessToken,
    createRefreshToken,
    issueTokens,
    revokeTokens
};
