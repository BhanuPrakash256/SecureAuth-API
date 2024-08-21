const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

// Mocking the dependencies
jest.mock('../../models/User');

describe('VerifyController', ()=> {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    describe('User Email verification', () => {
    
        it('should return 200 and succesfully verify email if the given code is correct', async () => {
    
            //Arrange
            const mockUser = {
                username: 'John Smith',
                emailVerificationCode: '231562',
                emailVerified: false,
                save: jest.fn().mockResolvedValue(true),
            };
    
            User.findOne.mockResolvedValue(mockUser);
    
            //Act
            const res = await request(app)
            .post('/api/users/verify-email/John Smith')
            .send({username: 'John Smith', code: '231562'});
    
            //Assertions
            expect(res.status).toBe(200);
            expect(res.body).toEqual({message: 'Email verified successfully'});
            expect(mockUser.emailVerified).toBe(true);
            expect(mockUser.emailVerificationCode).toBeUndefined();
            expect(mockUser.save).toHaveBeenCalled();
    
        });
    
        it('should return 404 if the given code is Incorrect', async () => {
    
            //Arrange
            const mockUser = {
                username: 'John Smith',
                emailVerificationCode: '231562',
                emailVerified: false,
                save: jest.fn().mockResolvedValue(true),
            };
    
            User.findOne.mockResolvedValue(mockUser);
    
            //Act
            const res = await request(app)
            .post('/api/users/verify-email/John Smith')
            .send({username: 'John Smith', code: '000000'});
    
            //Assertions
            expect(res.status).toBe(404);
            expect(res.body).toEqual({message: 'Invalid verification code'});
            expect(mockUser.save).not.toHaveBeenCalled();
    
        });
    
    
        it('should return 500 if there is an error', async () => {
            // Arrange
            User.findOne.mockRejectedValue(new Error('Database Error'));
    
            // Act
            const res = await request(app)
                .post('/api/users/verify-email/john_doe')
                .send({ username: 'john_doe', code: '123456' });
    
            // Assert
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: 'Error verifying email' });
        });
    
    });
    
    describe('User Phone number verification', () => {
    
        it('should return 200 and successfully verify phone number if the given code is Correct', async () => {
    
            //Arrange
            const mockUser = {
                username: 'John Wick',
                phoneVerificationCode: '23156',
                phoneVerified: false,
                save: jest.fn().mockResolvedValue(true)
            };
    
            User.findOne.mockResolvedValue(mockUser);
    
            //Act
            const res = await request(app)
            .post('/api/users/verify-phone/John Wick')
            .send({username: 'John Wick', code: '23156'});
    
            //Assertions
    
            expect(res.status).toBe(200);
            expect(res.body).toEqual({message: 'Phone number verified successfully'});
            expect(mockUser.phoneVerified).toBe(true);
            expect(mockUser.phoneVerificationCode).toBeUndefined();
            expect(mockUser.save).toHaveBeenCalled();
    
        });
    
        it('should return 400 if the given code is Incorrect', async () => {
    
            //Arrange
            const mockUser = {
                username: 'John Wick',
                phoneVerificationCode: '23156',
                phoneVerified: false,
                save: jest.fn().mockResolvedValue(true)
            };
    
            User.findOne.mockResolvedValue(null);
    
            //Act
            const res = await request(app)
            .post('/api/users/verify-phone/John Wick')
            .send({username: 'John Wick', code: '000000'});
    
            //Assertions
    
            expect(res.status).toBe(400);
            expect(res.body).toEqual({message: 'Invalid code'});
            expect(mockUser.save).not.toHaveBeenCalled();
        });
    
        it('should return 500 if there is an error', async () => {
            // Arrange
            User.findOne.mockRejectedValue(new Error('Database Error'));
    
            // Act
            const res = await request(app)
                .post('/api/users/verify-phone/john_doe')
                .send({ username: 'John Wick', code: '123456' });
    
            // Assert
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: 'Error verifying phone number' });
        });
    
    });
    
    describe('Update verification status', () => {
    
        it('should return 200 and update verification status if both email and phone are verified', async () => {
            // Arrange
            const mockUser = {
                username: 'john_doe',
                emailVerified: true,
                phoneVerified: true,
                verificationStatus: 'unverified',
                save: jest.fn().mockResolvedValue(true),
            };
    
            User.findOne.mockResolvedValue(mockUser);
    
            // Act
            const res = await request(app)
                .get('/api/users/verify-status/john_doe')
                .send();
    
            // Assert
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'User verified successfully. Now, Login with your credentials' });
            expect(mockUser.verificationStatus).toBe('verified');
            expect(mockUser.save).toHaveBeenCalled();
        });
    
        it('should return 404 if the user is not found', async () => {
            // Arrange
            User.findOne.mockResolvedValue(null); // No user found
    
            // Act
            const res = await request(app)
                .get('/api/users/verify-status/john_doe')
                .send();
    
            // Assert
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ message: 'User not found' });
        });
    
        it('should return 400 if email or phone number is not verified', async () => {
            // Arrange
            const mockUser = {
                username: 'john_doe',
                emailVerified: false,
                phoneVerified: true,
                save: jest.fn(),
            };
    
            User.findOne.mockResolvedValue(mockUser);
    
            // Act
            const res = await request(app)
                .get('/api/users/verify-status/john_doe')
                .send();
    
            // Assert
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ message: 'Email and phone number verification required' });
            expect(mockUser.save).not.toHaveBeenCalled();
        });
    
        it('should return 500 if there is an error', async () => {
            // Arrange
            User.findOne.mockRejectedValue(new Error('Database Error'));
    
            // Act
            const res = await request(app)
                .get('/api/users/verify-status/john_doe')
                .send();
    
            // Assert
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ message: 'Error updating verification status', error: {} });
        });
    });

});


