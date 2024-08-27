// src/__tests__/middlewares/authenticateToken.test.js

const jwt = require('jsonwebtoken');
const authenticateToken = require('../../middleware/authenticateToken');
const User = require('../../models/User');

jest.mock('jsonwebtoken');
jest.mock('../../models/User');

describe('authenticateToken Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 401 if no authorization header is provided', async () => {
    await authenticateToken('access')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized - No token provided!' });
  });

  it('should return 401 if no token is provided in authorization header', async () => {
    req.headers.authorization = 'Bearer ';
    await authenticateToken('access')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access token is required' });
  });

  it('should return 401 if token is invalid', async () => {
    req.headers.authorization = 'Bearer invalidtoken';
    jwt.verify.mockImplementation(() => { throw new Error(); });

    await authenticateToken('access')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token is Invalid.' });
  });

  it('should return 401 if token has expired', async () => {
    req.headers.authorization = 'Bearer expiredtoken';
    jwt.verify.mockImplementation(() => { throw { name: 'TokenExpiredError' }; });

    await authenticateToken('access')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token has expired!' });
  });

  it('should return 401 if user is not found', async () => {
    req.headers.authorization = 'Bearer validtoken';
    jwt.verify.mockReturnValue({ id: 'userId' });
    User.findById.mockResolvedValue(null);

    await authenticateToken('access')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found.' });
  });

  it('should return 403 if token type is invalid', async () => {
    req.headers.authorization = 'Bearer validtoken';
    jwt.verify.mockReturnValue({ id: 'userId', token_type: 'refresh' });
    User.findById.mockResolvedValue({ id: 'userId' });

    await authenticateToken('access')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token type' });
  });

  it('should return 401 if token version does not match', async () => {
    req.headers.authorization = 'Bearer validtoken';
    jwt.verify.mockReturnValue({ id: 'userId', token_type: 'access', tokenVersion: 1 });
    User.findById.mockResolvedValue({ id: 'userId', tokenVersion: 2 });

    await authenticateToken('access')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Token is no longer valid.' });
  });

  it('should call next if token is valid', async () => {
    req.headers.authorization = 'Bearer validtoken';
    jwt.verify.mockReturnValue({ id: 'userId', token_type: 'access', tokenVersion: 1 });
    const mockUser = { id: 'userId', tokenVersion: 1 };
    User.findById.mockResolvedValue(mockUser);

    await authenticateToken('access')(req, res, next);

    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
  });
});
