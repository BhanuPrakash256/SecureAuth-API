const jwt = require('jsonwebtoken');
const createTokens = require('../../Utils/tokens/createTokens');
const tokenController = require('../../controllers/tokenController');
const httpMocks = require('node-mocks-http');

jest.mock('jsonwebtoken');
jest.mock('../../models/User');

describe('token controller', () => {

  let mockUser, req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();

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

  describe('createAccessToken', () => {

    it('should return a signed JWT for access token', () => {
      jwt.sign.mockImplementation((payload, secret, options) => {
        expect(payload).toEqual({
          id: mockUser._id,
          username: mockUser.username,
          tokenVersion: mockUser.tokenVersion,
          token_type: 'access',
        });
        expect(secret).toBe(process.env.ACCESS_TOKEN_SECRET);
        expect(options).toEqual({ expiresIn: '15m' });
        return 'mockAccessToken';
      });

      const token = createTokens.createAccessToken(mockUser);
      expect(token).toBe('mockAccessToken');
    });

    it('should throw an error if signing fails', () => {
      jwt.sign.mockImplementation(() => { throw new Error('Failed to create access token'); });
      expect(() => createTokens.createAccessToken(mockUser)).toThrow('Failed to create access token');
    });

  });

  describe('createRefreshToken', () => {

    it('should return a signed JWT for refresh token', () => {
      jwt.sign.mockImplementation((payload, secret, options) => {
        expect(payload).toEqual({
          id: mockUser._id,
          username: mockUser.username,
          tokenVersion: mockUser.tokenVersion,
          token_type: 'refresh',
        });
        expect(secret).toBe(process.env.REFRESH_TOKEN_SECRET);
        expect(options).toEqual({ expiresIn: '7d' });
        return 'mockRefreshToken';
      });

      const token = createTokens.createRefreshToken(mockUser);
      expect(token).toBe('mockRefreshToken');
    });

    it('should throw an error if signing fails', () => {
      jwt.sign.mockImplementation(() => { throw new Error('Failed to create refresh token'); });
      expect(() => createTokens.createRefreshToken(mockUser)).toThrow('Failed to create refresh token');
    });

  });

  describe('issueTokens', () => {

    it('should return 200 with new tokens on success', async () => {
      jwt.sign
        .mockReturnValueOnce('newAccessToken')
        .mockReturnValueOnce('newRefreshToken');

      await tokenController.issueTokens(req, res, next);

      expect(mockUser.tokenVersion).toBe(2);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        accessToken: 'newAccessToken',
        newRefreshToken: 'newRefreshToken',
      });
    });

    it('should call next with an error if saving fails', async () => {
      mockUser.save.mockRejectedValueOnce(new Error('Failed to save user'));

      await tokenController.issueTokens(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

  });

  describe('revokeTokens', () => {

    it('should return 200 with success message when tokens are revoked', async () => {
      await tokenController.revokeTokens(req, res, next);

      expect(mockUser.tokenVersion).toBe(2);
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        message: 'Tokens revoked successfully. Please log in again to generate new tokens.',
      });
    });

    it('should call next with an error if saving fails', async () => {
      mockUser.save.mockRejectedValueOnce(new Error('Failed to save user'));

      await tokenController.revokeTokens(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

  });

});
