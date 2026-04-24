jest.mock('../../utils/mailer', () => ({
  sendEmail: jest.fn().mockResolvedValue(),
}));

const passwordController = require('../../controllers/passwordController');
const httpMocks = require('node-mocks-http');
const User = require('../../models/User');
const crypto = require('crypto');
const { sendEmail } = require('../../utils/mailer');

jest.mock('../../models/User');
jest.mock('crypto');

describe('Password controller', () => {

  let mockUser, req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();

    process.env.BASE_URL = 'http://localhost:3000';

    mockUser = {
      email: 'test@example.com',
      resetPasswordToken: 'sometoken',
      resetPasswordExpires: Date.now() + 3600000,
      save: jest.fn().mockResolvedValue(true),
    };

    User.findOne.mockResolvedValue(mockUser);
    crypto.randomBytes.mockReturnValue(Buffer.from('sometoken'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Forgot Password', () => {

    it('should return 200 and send email when the user is found', async () => {
      req.body = { email: 'test@example.com' };

      await passwordController.forgotPassword(req, res, next);

      expect(mockUser.save).toHaveBeenCalled();
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'test@example.com',
        subject: '[Games] Please reset your password',
        text: expect.stringContaining('/api/v1/users/reset-password/'),
      }));
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ message: 'Password reset email sent' });
    });

    it('should call next with NotFoundError if user is not found', async () => {
      User.findOne.mockResolvedValue(null);
      req.body = { email: 'nonexistent@example.com' };

      await passwordController.forgotPassword(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it('should call next with an error if a database error occurs', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));
      req.body = { email: 'test@example.com' };

      await passwordController.forgotPassword(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

  });

  describe('Reset Password', () => {

    it('should return 200 and reset the password when token is valid', async () => {
      req.params = { token: 'sometoken' };
      req.body = { newPassword: 'newpassword123' };

      await passwordController.resetPassword(req, res, next);

      expect(mockUser.password).toBe('newpassword123');
      expect(mockUser.resetPasswordToken).toBeUndefined();
      expect(mockUser.resetPasswordExpires).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ message: 'Password has been reset' });
    });

    it('should call next with BadRequestError if token is invalid or expired', async () => {
      User.findOne.mockResolvedValue(null);
      req.params = { token: 'invalidtoken' };
      req.body = { newPassword: 'newpassword123' };

      await passwordController.resetPassword(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 400 }));
    });

    it('should call next with an error if a database error occurs', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));
      req.params = { token: 'sometoken' };
      req.body = { newPassword: 'newpassword123' };

      await passwordController.resetPassword(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

  });

});
