const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

jest.mock('../../models/User');

describe('AuthController - login', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and tokens when credentials are valid', async () => {
    const mockUser = {
      _id: 'mockUserId',
      username: 'john_doe',
      tokenVersion: 0,
      comparePassword: jest.fn().mockResolvedValue(true),
    };

    User.findOne.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ username: 'john_doe', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('should return 401 if the user is not found', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ username: 'john_doe', password: 'wrong_password' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid credentials' });
  });

  it('should return 401 if the password is wrong', async () => {
    const mockUser = {
      _id: 'mockUserId',
      username: 'john_doe',
      tokenVersion: 0,
      comparePassword: jest.fn().mockResolvedValue(false),
    };

    User.findOne.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ username: 'john_doe', password: 'wrong_password' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid credentials' });
  });

  it('should return 500 if there is a database error', async () => {
    User.findOne.mockRejectedValue(new Error('Database Error'));

    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ username: 'john_doe', password: 'password123' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message');
  });

});
