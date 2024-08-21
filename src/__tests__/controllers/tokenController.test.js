const jwt = require('jsonwebtoken');
const tokenController = require('../../controllers/tokenController');
const httpMocks = require('node-mocks-http');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../models/User');


describe('token controller', () => {

    let mockUser, req, res;

    beforeEach(() => {

        req = httpMocks.createRequest();
        res = httpMocks.createResponse();

        mockUser = {
            _id: 'user_id123',
            username: 'test_user',
            tokenVersion: 1,
            save: jest.fn().mockResolvedValue(true),
        };

        req.user = mockUser;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('create access token', () => {
        it('should return a signed JWT for access token', () => {
            // Mocking the jwt.sign function for creating an access token
            jwt.sign.mockImplementation((payload, secret, options) => {
                expect(payload).toEqual({
                    id: mockUser._id,
                    username: mockUser.username,
                    tokenVersion: mockUser.tokenVersion,
                    token_type: 'access'
                });
                expect(secret).toBe(process.env.ACCESS_TOKEN_SECRET);
                expect(options).toEqual({ expiresIn: '15m' });

                return 'mockAccessToken';
            });

            const token = tokenController.createAccessToken(mockUser);
            expect(token).toBe('mockAccessToken');
        });

        it('should throw an error if signing fails', () => {
            jwt.sign.mockImplementation(() => { throw new Error('Failed to create access token') });

            expect(() => tokenController.createAccessToken(mockUser)).toThrow('Failed to create access token');
        });   
    });

    describe('create Refresh Token', () => {
        it('should return a signed JWT for refresh token', () => {
            // Mocking the jwt.sign function for creating a refresh token
            jwt.sign.mockImplementation((payload, secret, options) => {
                expect(payload).toEqual({
                    id: mockUser._id,
                    username: mockUser.username,
                    tokenVersion: mockUser.tokenVersion,
                    token_type: 'refresh'
                });
                expect(secret).toBe(process.env.REFRESH_TOKEN_SECRET);
                expect(options).toEqual({ expiresIn: '7d' });

                return 'mockRefreshToken';
            });

            const token = tokenController.createRefreshToken(mockUser);
            expect(token).toBe('mockRefreshToken');
        });

        it('should throw an error if signing fails', () => {
            jwt.sign.mockImplementation(() => { throw new Error('Failed to create refresh token') });

            expect(() => tokenController.createRefreshToken(mockUser)).toThrow('Failed to create refresh token');
        });
    });

    describe('Issue tokens', () => {

        it('should return 200 with access and refresh tokens on successful validation', async () => {
            
            jwt.sign.mockReturnValueOnce('newAccessToken')
            .mockReturnValueOnce('newRefreshToken');

            await tokenController.issueTokens(req, res);
    
            expect(mockUser.tokenVersion).toBe(2);
            expect(mockUser.save).toHaveBeenCalled();

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                accessToken: 'newAccessToken',
                newRefreshToken: 'newRefreshToken',
            });
        });

        it('should return 500 if an error occurs while issuing tokens', async () => {
            mockUser.save.mockRejectedValueOnce(new Error('Failed to save user'));

            await tokenController.issueTokens(req, res);

            expect(mockUser.tokenVersion).toBe(2); // Increment happens before the save method.
            expect(mockUser.save).toHaveBeenCalled();

            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toEqual({
                message: 'Failed to issue tokens',
                error: 'Failed to save user'
            });
        });
    });

    describe('revokeTokens', () => {
        it('should return 200 with success message when tokens are revoked successfully', async () => {
            await tokenController.revokeTokens(req, res);

            expect(mockUser.tokenVersion).toBe(2);
            expect(mockUser.save).toHaveBeenCalled();

            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({
                message: 'Tokens revoked successfully. Please log in again to generate new tokens.'
            });
        });

        it('should return 500 if an error occurs while revoking tokens', async () => {
            mockUser.save.mockRejectedValueOnce(new Error('Failed to save user'));

            await tokenController.revokeTokens(req, res);

            expect(mockUser.tokenVersion).toBe(2); // Increment happens before the save method.
            expect(mockUser.save).toHaveBeenCalled();

            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toEqual({
                message: 'Failed to revoke tokens',
                error: 'Failed to save user'
            });
        });
    });

});