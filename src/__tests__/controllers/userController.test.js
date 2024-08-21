jest.mock('../../verifications/sms', () => ({
    sendVerificationSMS: jest.fn().mockResolvedValue(),
  }));  

const userController = require('../../controllers/userController');
const User = require('../../models/User');
const send_email = require('../../verifications/email');
const send_sms = require('../../verifications/sms');

// Mock the necessary modules
jest.mock('../../models/User');
jest.mock('../../verifications/email');


describe('User controller', () => {

    describe('create User', () => {
        let req, res;
    
        beforeEach(() => {
            
            req = {
                body : {
                    firstName: 'John',
                    lastName: 'Doe',
                    dateOfBirth: '1990-01-01',
                    address: '123 Main St',
                    governmentID: '123456789',
                    username: 'johndoe',
                    password: 'password123',
                    email: 'johndoe@example.com',
                    phoneNumber: '1234567890',  
                }
            };
            
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            }
        });

        it('should create a new User and send verification email and sms', async () => {
                        
            User.prototype.save = jest.fn().mockResolvedValueOnce();
            
            await userController.createUser(req, res);
            
            expect(User.prototype.save).toHaveBeenCalled();
            
            expect(send_email.sendVerificationEmail).toHaveBeenCalledWith(expect.any(Object));
            expect(send_sms.sendVerificationSMS).toHaveBeenCalledWith(expect.any(Object));
            
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
              message: 'User created successfully. Verification email sent. Verification code sent.',
            });
         
        });

        it('should handle duplicate username error', async () => {
            User.prototype.save = jest.fn().mockRejectedValueOnce({ code: 11000, name: 'MongoError' });
      
            await userController.createUser(req, res);
      
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: 'Username already exists' });
        });
      
        it('should handle other errors', async () => {
            const error = new Error('Some error');
            User.prototype.save = jest.fn().mockRejectedValueOnce(error);
      
            await userController.createUser(req, res);
      
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Error creating user', error });
        });

    });

    describe('Get User by username', () => {
        let req, res;
    
        beforeEach(() => {
          req = { params: { username: 'johndoe' } };
          res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
          };
        });
    
        it('should return the user data if the user exists', async () => {
          User.findOne.mockResolvedValueOnce({ username: 'johndoe'});
    
          await userController.getUserByUsername(req, res);
    
          expect(User.findOne).toHaveBeenCalledWith({ username: 'johndoe' });
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.json).toHaveBeenCalledWith({
            message: "User information retrieved successfully ✔️",
            user: expect.any(Object),
          });
        });
    
        it('should return 404 if the user is not found', async () => {
          User.findOne.mockResolvedValueOnce(null);
    
          await userController.getUserByUsername(req, res);
    
          expect(res.status).toHaveBeenCalledWith(404);
          expect(res.json).toHaveBeenCalledWith({ message: 'User not found ' });
        });
    
        it('should return 500 if there is an error', async () => {
          const error = new Error('Error finding user');
          User.findOne.mockRejectedValueOnce(error);
    
          await userController.getUserByUsername(req, res);
    
          expect(res.status).toHaveBeenCalledWith(500);
          expect(res.json).toHaveBeenCalledWith({ message: 'Error retrieving user information.' });
        });
    });

    describe('update User', () => {
        let req, res;
    
        beforeEach(() => {
          req = {
            params: { username: 'johndoe' },
            body: { firstName: 'John', lastName: 'Doe Updated' },
          };
          res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
          };
        });
    
        it('should update the user information', async () => {
          User.findOne.mockResolvedValueOnce({
            updateInformation: jest.fn().mockResolvedValueOnce(),
          });
    
          await userController.updateUser(req, res);
    
          expect(User.findOne).toHaveBeenCalledWith({ username: 'johndoe' });
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.json).toHaveBeenCalledWith({
            message: "User info updated successfully ✔️",
            user: expect.any(Object),
          });
        });
    
        it('should return 404 if the user is not found', async () => {
          User.findOne.mockResolvedValueOnce(null);
    
          await userController.updateUser(req, res);
    
          expect(res.status).toHaveBeenCalledWith(404);
          expect(res.json).toHaveBeenCalledWith({ message: '2 User not found' });
        });
    
        it('should return 500 if there is an error', async () => {
          const error = new Error('Error updating user');
          User.findOne.mockRejectedValueOnce(error);
    
          await userController.updateUser(req, res);
    
          expect(res.status).toHaveBeenCalledWith(500);
          expect(res.json).toHaveBeenCalledWith({ message: 'Error updating user information' });
        });
    });

    describe('delete User', () => {
        let req, res;
    
        beforeEach(() => {
          req = { params: { username: 'johndoe' } };
          res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
          };
        });
    
        it('should delete the user if the user exists', async () => {
          User.findOneAndDelete.mockResolvedValueOnce({ username: 'johndoe' });
    
          await userController.deleteUser(req, res);
    
          expect(User.findOneAndDelete).toHaveBeenCalledWith({ username: 'johndoe' });
          expect(res.status).toHaveBeenCalledWith(200);
          expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
        });
    
        it('should return 404 if the user is not found', async () => {
          User.findOneAndDelete.mockResolvedValueOnce(null);
    
          await userController.deleteUser(req, res);
    
          expect(res.status).toHaveBeenCalledWith(404);
          expect(res.json).toHaveBeenCalledWith({ message: '1 User not found' });
        });
    
        it('should return 500 if there is an error', async () => {
          const error = new Error('Error deleting user');
          User.findOneAndDelete.mockRejectedValueOnce(error);
    
          await userController.deleteUser(req, res);
    
          expect(res.status).toHaveBeenCalledWith(500);
          expect(res.json).toHaveBeenCalledWith({ message: 'Error deleting user' });
        });
    });

});