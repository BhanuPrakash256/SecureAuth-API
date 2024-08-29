class BadRequestError extends Error {
    constructor(message) {
      super(message);
      this.name = "BadRequestError";
      this.statusCode = 400;
    }
  }


class VerificationError extends BadRequestError {
    constructor(message) {
      super(message);
      this.name = "VerificationError";
    }
}


module.exports = { BadRequestError, VerificationError }