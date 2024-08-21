const passwordController = require('../../controllers/passwordController');
const httpMocks = require('node-mocks-http');
const User = require('../../models/User');
const crypto = require('crypto');

jest.mock('../../models/User');
jest.mock('crypto');
const { mock } = require('nodemailer');


describe('Password controller', () => {
    
    let mockUser, req, res;
    
    beforeEach(() => {
        
        req = httpMocks.createRequest();
        res = httpMocks.createResponse();

        mockUser = {
            email: 'test@example.com',
            resetPasswordToken: 'sometoken',
            resetPasswordExpires: Date.now() + 3600000, // 1 hour from now
            save: jest.fn().mockResolvedValue(true),
        };

        User.findOne.mockResolvedValue(mockUser);
        crypto.randomBytes.mockReturnValue(Buffer.from('sometoken'));

    });

    afterEach(() => {
        jest.clearAllMocks();
        mock.reset();
    });

    describe('Forgot Password', () => {
        it('should return 200 and send email when the user is found', async () => {

            req.body = {email : 'test@example.com'};
    
            await passwordController.forgotPassword(req, res);
    
            expect(mockUser.save).toHaveBeenCalled();
    
            const sentMail = mock.getSentMail();
    
            expect(sentMail.length).toBe(1);
            expect(sentMail[0].to).toBe('test@example.com');
            expect(sentMail[0].subject).toBe('[Games🎮] Please reset your password');
            expect(sentMail[0].text).toContain('http://localhost:3000/api/users/reset-password/');
      
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({ message: 'Password reset email sent' });
    
        });
    
    
        it('should return 400 if user is not found', async () => {
            User.findOne.mockResolvedValue(null);
      
            req.body = { email: 'nonexistent@example.com' };
            await passwordController.forgotPassword(req, res);
      
            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ message: 'User not found' });
          });
    
    
          it('should return 500 if an error occurs', async () => {
            User.findOne.mockRejectedValue(new Error('Database error'));
      
            req.body = { email: 'test@example.com' };
            await passwordController.forgotPassword(req, res);
      
            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toEqual({ message: 'Server error' });
          });
    });

    describe('Reset Password', () => {

        it('should return 400 if token is invalid or expired', async () => {
            User.findOne.mockResolvedValue(null);
      
            req.params = { token: 'invalidtoken' };
            req.body = { newPassword: 'newpassword123' };
            await passwordController.resetPassword(req, res);
      
            expect(res.statusCode).toBe(400);
            expect(res._getJSONData()).toEqual({ message: 'Password reset token is invalid or has expired' });
          });
      
          it('should return 200 and reset the password when token is valid', async () => {
            req.params = { token: 'sometoken' };
            req.body = { newPassword: 'newpassword123' };
            await passwordController.resetPassword(req, res);
      
            expect(mockUser.password).toBe('newpassword123');
            expect(mockUser.resetPasswordToken).toBeUndefined();
            expect(mockUser.resetPasswordExpires).toBeUndefined();
            expect(mockUser.save).toHaveBeenCalled();
            expect(res.statusCode).toBe(200);
            expect(res._getJSONData()).toEqual({ message: 'Password has been reset' });
          });
      
          it('should return 500 if an error occurs', async () => {
            User.findOne.mockRejectedValue(new Error('Database error'));
      
            req.params = { token: 'sometoken' };
            req.body = { newPassword: 'newpassword123' };
            await passwordController.resetPassword(req, res);
      
            expect(res.statusCode).toBe(500);
            expect(res._getJSONData()).toEqual({ message: 'Server error' });
          });
      
        
    });

});

