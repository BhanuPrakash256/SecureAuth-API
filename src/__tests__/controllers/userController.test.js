jest.mock('../../verifications/sms', () => ({
  sendVerificationSMS: jest.fn().mockResolvedValue(),
}));

const userController = require('../../controllers/userController');
const User = require('../../models/User');
const send_email = require('../../verifications/email');
const send_sms = require('../../verifications/sms');

jest.mock('../../models/User');
jest.mock('../../verifications/email');

describe('User controller', () => {

  describe('createUser', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        body: {
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: '1990-01-01',
          address: '123 Main St',
          governmentID: '123456789',
          username: 'johndoe',
          password: 'password123',
          email: 'johndoe@example.com',
          phoneNumber: '+14155551234',
        },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();

      User.findOne.mockResolvedValue(null);
    });

    it('should create a new user and send verification email and sms', async () => {
      User.prototype.save = jest.fn().mockResolvedValueOnce();

      await userController.createUser(req, res, next);

      expect(User.prototype.save).toHaveBeenCalled();
      expect(send_email.sendVerificationEmail).toHaveBeenCalledWith(expect.any(Object));
      expect(send_sms.sendVerificationSMS).toHaveBeenCalledWith(expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User created successfully. Verification email sent. Verification code sent.',
      });
    });

    it('should call next with 409 error if username already exists', async () => {
      User.findOne.mockResolvedValue({ username: 'johndoe' }); // username taken

      await userController.createUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 409 }));
    });

    it('should call next with an error if saving fails', async () => {
      User.prototype.save = jest.fn().mockRejectedValueOnce(new Error('DB error'));

      await userController.createUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

  });

  describe('getUserByUsername', () => {
    let req, res, next;

    beforeEach(() => {
      req = { params: { username: 'johndoe' } };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should return the user data if the user exists', async () => {
      User.findOne.mockResolvedValueOnce({ username: 'johndoe' });

      await userController.getUserByUsername(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ username: 'johndoe' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User information retrieved successfully ✔️',
        user: expect.any(Object),
      });
    });

    it('should call next with 404 error if the user is not found', async () => {
      User.findOne.mockResolvedValueOnce(null);

      await userController.getUserByUsername(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it('should call next with an error if there is a database error', async () => {
      User.findOne.mockRejectedValueOnce(new Error('DB error'));

      await userController.getUserByUsername(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

  });

  describe('updateUser', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        params: { username: 'johndoe' },
        body: { firstName: 'John', lastName: 'Doe Updated' },
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should update the user information', async () => {
      User.findOne.mockResolvedValueOnce({
        updateInformation: jest.fn().mockResolvedValueOnce(),
      });

      await userController.updateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User info updated successfully ✔️',
        user: expect.any(Object),
      });
    });

    it('should call next with 404 error if the user is not found', async () => {
      User.findOne.mockResolvedValueOnce(null);

      await userController.updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it('should call next with an error if there is a database error', async () => {
      User.findOne.mockRejectedValueOnce(new Error('DB error'));

      await userController.updateUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

  });

  describe('deleteUser', () => {
    let req, res, next;

    beforeEach(() => {
      req = { params: { username: 'johndoe' } };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      next = jest.fn();
    });

    it('should delete the user if the user exists', async () => {
      User.findOneAndDelete.mockResolvedValueOnce({ username: 'johndoe' });

      await userController.deleteUser(req, res, next);

      expect(User.findOneAndDelete).toHaveBeenCalledWith({ username: 'johndoe' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
    });

    it('should call next with 404 error if the user is not found', async () => {
      User.findOneAndDelete.mockResolvedValueOnce(null);

      await userController.deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 404 }));
    });

    it('should call next with an error if there is a database error', async () => {
      User.findOneAndDelete.mockRejectedValueOnce(new Error('DB error'));

      await userController.deleteUser(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

  });

});
