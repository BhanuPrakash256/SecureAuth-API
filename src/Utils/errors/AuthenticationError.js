class AuthenticationError extends Error {
    constructor(message) {
      super(message);
      this.name = "AuthenticationError";
      this.statusCode = 401;
    }
  }

class TokenExpiredError extends AuthenticationError {
    constructor(message) {
        super(message);
        this.name = 'TokenExpiredError';
    }
}



module.exports = { AuthenticationError, TokenExpiredError }
