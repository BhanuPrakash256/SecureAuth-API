# Project Name: SecureAuth API

## Overview

**SecureAuth API** is a robust authentication and user management system that provides secure user registration, login, and token-based authentication using JWT (JSON Web Token). It includes features like email and SMS verification, password reset functionality, and secure storage of user credentials.

## Features
- JWT-based authentication (Access and Refresh tokens).
- User registration with email and phone number verification.
- Token expiration and refresh mechanism.
- Secure password hashing and storage.
- Detailed logging for security and auditing purposes.
- Error handling with custom error classes.
- Scalable and maintainable architecture.

## Technologies Used

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for building the API.
- **MongoDB**: NoSQL database for storing user data.
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB and Node.js.
- **JWT (JSON Web Token)**: For secure user authentication.
- **Bcrypt**: For hashing passwords.
- **Winston**: For logging.
- **Twilio**: For sending SMS verifications.
- **Nodemailer**: For sending email verifications.
- **Joi**: For data validation.
- **dotenv**: For managing environment variables.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/secureauth-api.git
   cd secureauth-api
   ```
2. **Install dependencies:**

   ```bash
   npm install
   ```
3. **Start the server:**

   ```bash
   npm run start
   ```
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`ACCESS_TOKEN_SECRET=your_access_token_secret`   
`REFRESH_TOKEN_SECRET=your_refresh_token_secret`   
`TWILIO_ACCOUNT_SID=your_twilio_account_sid`   
`TWILIO_AUTH_TOKEN=your_twilio_auth_token`  
`TWILIO_PHONE_NUMBER=your_twilio_phone_number`  
`MONGO_URI=your_mongodb_connection_string`  

## API Endpoints

### User Endpoints

1. #### Register User
```http
  POST /api/users   
```

2. #### Get User's info
```http
  GET /api/users/{username}
  Authorization: 'Bearer ACCESS_TOKEN'
```

3. #### Update User's info
```http
  PUT /api/users/{username}   
  Authorization: 'Bearer ACCESS_TOKEN'
```

4. #### Delete User
```http
  DEL /api/users/{username}
  Authorization: 'Bearer ACCESS_TOKEN'
```
### Verification Endpoints
1. #### Verify User's email
```http
  POST /api/users/verify-email/{username}   
```
2. #### Verify User's phone number
```http
  POST /api/users/verify-phone/{username}   
```
3. #### Get User's verification status
```http
  GET /api/users/verify-status/{username}
```
### Auth Endpoints
1. #### User's Log in
```http
  POST /api/users/login   
```
2. #### User's log out
```http
  POST /api/users/logout
  Authorization: 'Bearer REFRESH_TOKEN'
```
3. #### Forgot password
```http
  POST /api/users/forgot-password   
```

4. #### Reset password
```http
  POST /api/users/reset-password/RESET_PASSWORD_TOKEN
```

### Token Endpoints
1. #### Issue new Access and Refresh tokens
```http
  POST /api/users/issue-tokens
  Authorization: 'Bearer REFRESH_TOKEN'
```

2. #### Revoke new Access and Refresh tokens
```http
  POST /api/users/revoke-tokens
  Authorization: 'Bearer REFRESH_TOKEN'
```

