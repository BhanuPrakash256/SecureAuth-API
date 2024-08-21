const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

// Mocking the dependencies
jest.mock('../../models/User');

describe('AuthController - login', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and tokens when credentials are valid', async () => {
    // Arrange
    const mockUser = {
      _id: 'mockUserId',
      username: 'john_doe',
      password: 'hashed_password',
      comparePassword: jest.fn().mockResolvedValue(true),
    };

    User.findOne.mockResolvedValue(mockUser);

    const loginData = {
      username: 'john_doe',
      password: 'password123',
    };

    // Act
    const res = await request(app)
      .post('/api/users/login')
      .send(loginData);

    // Assert
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    
  });

  it('should return 401 if credentials are invalid', async () => {
    // Arrange
    User.findOne.mockResolvedValue(null); // No user found

    const loginData = {
      username: 'john_doe',
      password: 'wrong_password',
    };

    // Act
    const res = await request(app)
      .post('/api/users/login')
      .send(loginData);

    // Assert
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid email or password!' });
  });

  it('should return 500 if there is an error during login', async () => {
    // Arrange
    User.findOne.mockRejectedValue(new Error('Database Error'));

    const loginData = {
      username: 'john_doe',
      password: 'password123',
    };

    // Act
    const res = await request(app)
      .post('/api/users/login')
      .send(loginData);

    // Assert
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: 'Error logging in', error: 'Database Error' });
  });
});
