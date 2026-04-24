const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

jest.mock('../../models/User');

describe('VerifyController', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Email verification', () => {

    it('should return 200 and verify email if the code is correct', async () => {
      const mockUser = {
        username: 'John Smith',
        emailVerificationCode: '231562',
        emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
        emailVerified: false,
        save: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/v1/users/verify-email/John Smith')
        .send({ code: '231562' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Email verified successfully' });
      expect(mockUser.emailVerified).toBe(true);
      expect(mockUser.emailVerificationCode).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should return 400 if the code is incorrect', async () => {
      const mockUser = {
        username: 'John Smith',
        emailVerificationCode: '231562',
        emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
        emailVerified: false,
        save: jest.fn(),
      };

      User.findOne.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/v1/users/verify-email/John Smith')
        .send({ code: '000000' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Invalid verification code' });
      expect(mockUser.save).not.toHaveBeenCalled();
    });

    it('should return 400 if the code has expired', async () => {
      const mockUser = {
        username: 'John Smith',
        emailVerificationCode: '231562',
        emailVerificationExpires: new Date(Date.now() - 1000), // expired
        emailVerified: false,
        save: jest.fn(),
      };

      User.findOne.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/v1/users/verify-email/John Smith')
        .send({ code: '231562' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Verification code has expired' });
      expect(mockUser.save).not.toHaveBeenCalled();
    });

    it('should return 500 if there is a database error', async () => {
      User.findOne.mockRejectedValue(new Error('Database Error'));

      const res = await request(app)
        .post('/api/v1/users/verify-email/john_doe')
        .send({ code: '123456' });

      expect(res.status).toBe(500);
    });

  });

  describe('User Phone number verification', () => {

    it('should return 200 and verify phone number if the code is correct', async () => {
      const mockUser = {
        username: 'John Wick',
        phoneVerificationCode: '23156',
        phoneVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
        phoneVerified: false,
        save: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);

      const res = await request(app)
        .post('/api/v1/users/verify-phone/John Wick')
        .send({ code: '23156' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Phone number verified successfully' });
      expect(mockUser.phoneVerified).toBe(true);
      expect(mockUser.phoneVerificationCode).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should return 400 if the code is incorrect', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/v1/users/verify-phone/John Wick')
        .send({ code: '000000' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Invalid verification code' });
    });

    it('should return 500 if there is a database error', async () => {
      User.findOne.mockRejectedValue(new Error('Database Error'));

      const res = await request(app)
        .post('/api/v1/users/verify-phone/john_doe')
        .send({ code: '123456' });

      expect(res.status).toBe(500);
    });

  });

  describe('Update verification status', () => {

    it('should return 200 and set status to verified when both are verified', async () => {
      const mockUser = {
        username: 'john_doe',
        emailVerified: true,
        phoneVerified: true,
        verificationStatus: 'pending',
        save: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);

      const res = await request(app)
        .get('/api/v1/users/verify-status/john_doe');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'User verified successfully. Now, Login with your credentials' });
      expect(mockUser.verificationStatus).toBe('verified');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should return 404 if the user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/users/verify-status/john_doe');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: 'User not found' });
    });

    it('should return 400 if email or phone is not verified', async () => {
      const mockUser = {
        username: 'john_doe',
        emailVerified: false,
        phoneVerified: true,
        save: jest.fn(),
      };

      User.findOne.mockResolvedValue(mockUser);

      const res = await request(app)
        .get('/api/v1/users/verify-status/john_doe');

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ message: 'Email and phone number verification required' });
      expect(mockUser.save).not.toHaveBeenCalled();
    });

    it('should return 500 if there is a database error', async () => {
      User.findOne.mockRejectedValue(new Error('Database Error'));

      const res = await request(app)
        .get('/api/v1/users/verify-status/john_doe');

      expect(res.status).toBe(500);
    });

  });

});
