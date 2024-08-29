const {createAccessToken, createRefreshToken} = require('../Utils/tokens/createTokens');

const issueTokens = async (req, res, next) => {
    try {

        let user = req.user;

        user.tokenVersion += 1;
        await user.save();

        const accessToken = createAccessToken(user);
        const newRefreshToken = createRefreshToken(user);
        
        return res.status(200).json({ accessToken, newRefreshToken });

    } catch (error) {
        next(error);
    }
}

const revokeTokens = async (req, res, next) => {
    try {
        let user = req.user;

        user.tokenVersion += 1;
        await user.save();

        return res.status(200).json({ message: 'Tokens revoked successfully. Please log in again to generate new tokens.' });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    issueTokens,
    revokeTokens,
};
