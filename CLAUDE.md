# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Start dev server with nodemon (hot-reload) on port 3000
npm test         # Run full Jest test suite with coverage
```

Run a single test file:
```bash
npm test -- src/__tests__/controllers/authController.test.js
```

Run a specific test by name:
```bash
npm test -- src/__tests__/controllers/authController.test.js -t "should return 200"
```

No build or lint step — this is a plain Node.js project with no TypeScript or ESLint.

## Architecture

Express REST API for identity verification. Users register with personal identity info, verify via email + SMS codes, then authenticate with JWT access/refresh tokens.

**Request flow:**
```
Request → Express Routes → Controllers → Services/Utils → MongoDB (Mongoose)
                ↓
          Middleware (JWT auth, global error handler)
```

**Entry points:**
- `src/server.js` — starts Express on port 3000, connects to MongoDB
- `src/app.js` — registers middleware stack and mounts all routes under `/api/users`

### Route → Controller mapping

All routes are under `/api/users/`:

| File | Routes | Controller |
|---|---|---|
| `routes/users.js` | `POST /`, `GET/:username`, `PUT/:username`, `DELETE/:username` | `userController.js` |
| `routes/authentication.js` | `POST /login`, `POST /logout` | `authController.js` |
| `routes/verification.js` | `POST /verify-email/:username`, `POST /verify-phone/:username`, `GET /verify-status/:username` | `verifyController.js` |
| `routes/password.js` | `POST /forgot-password`, `POST /reset-password/:token` | `passwordController.js` |
| `routes/tokens.js` | `POST /issue-tokens`, `POST /revoke-tokens` | `tokenController.js` |

### Token invalidation strategy

`User.tokenVersion` is an integer counter stored in MongoDB. Both access and refresh JWTs carry the `tokenVersion` at the time of issue. On every authenticated request, `middleware/authenticateToken.js` validates the JWT signature, checks expiry, then queries the DB to confirm the token's `tokenVersion` still matches the user's current value. Logout and token refresh both increment `tokenVersion`, which invalidates all previously issued tokens without a token blacklist.

- Access tokens expire in 15 minutes; refresh tokens in 7 days.
- Token creation: `src/Utils/tokens/createTokens.js`
- Token verification: `src/Utils/tokens/verifyToken.js`
- User/version validation: `src/Utils/users/validateUser.js`
- `authenticateToken` is a higher-order function — it takes a `tokenType` argument (`'access'` or `'refresh'`) and returns the middleware function.

### Error handling

Custom error classes live in `src/Utils/errors/`. All controllers throw these; the global handler in `src/middleware/error.js` catches them and returns `{ statusCode, message }` JSON. Hierarchy:

- `CustomError` (base, flexible statusCode)
  - `AuthenticationError` → 401
    - `TokenExpiredError` → 401
  - `BadRequestError` → 400
    - `VerificationError` → 400
  - `NotFoundError` → 404
  - `ServerError` → 500

### User model

`src/models/User.js` — Mongoose schema. Key fields:
- Identity: `firstName`, `lastName`, `dateOfBirth`, `address`, `governmentID`
- Auth: `username` (unique), `password` (bcrypt, 10 rounds, hashed in pre-save hook), `email`, `phoneNumber`
- Verification: `emailVerified`, `emailVerificationCode`, `phoneVerified`, `phoneVerificationCode`, `verificationStatus` (`pending`/`verified`/`rejected`)
- Token management: `tokenVersion`, `resetPasswordToken`, `resetPasswordExpires`
- Methods: `comparePassword()`, `updateInformation()`

### Verification services

`src/verifications/email.js` — generates a 6-digit code, sends via Nodemailer (Ethereal SMTP — test-only, not production-ready).  
`src/verifications/sms.js` — generates a 6-digit code, sends via Twilio.

### Tests

- Framework: Jest + `supertest` (HTTP integration) + `node-mocks-http` (unit)
- Tests are in `src/__tests__/` mirroring the `controllers/` and `middlewares/` layout
- Nodemailer is auto-mocked via `src/__mocks__/nodemailer.js`
- Mongoose models and external services are mocked with `jest.mock()`
- Coverage output goes to `./coverage/` (HTML report at `./coverage/lcov-report/index.html`)

## Environment

Requires a `.env` file at the project root with:
- `MONGO_URI` — MongoDB connection string
- `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` — JWT signing secrets
- Ethereal SMTP credentials (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`)
- Twilio credentials (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`)
