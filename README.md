# Identity Verification API

A production-grade REST API for user identity verification built with Node.js and Express. Demonstrates service-oriented architecture, JWT-based authentication, idempotency, rate limiting, API versioning, and end-to-end SaaS integration (Twilio SMS + Resend email).

---

## Features

| Capability | Implementation |
|---|---|
| **API Versioning** | URI-based (`/api/v1/`), `X-API-Version` response header |
| **Rate Limiting** | Layered — global (100/15min), auth (10/15min), sensitive ops (5/hr); RFC 6585 `RateLimit-*` headers |
| **Idempotency** | `Idempotency-Key` header on mutating POSTs; `X-Idempotent-Replayed: true` on replays |
| **JWT Auth** | Dual-token (access 15min / refresh 7d) with `tokenVersion` revocation — no blacklist needed |
| **Input Validation** | `express-validator` with E.164 phone, ISO 8601 date, email, password length checks |
| **External SaaS** | Resend (email), Twilio (SMS) — end-to-end verification flow |
| **Security headers** | `helmet` + configurable CORS |
| **Structured logging** | Winston — silent in test, colorized in dev, JSON in prod |
| **Health check** | `GET /health` — DB connection state + uptime |

---

## Architecture

```
Request → Express Routes (/api/v1/users/...)
               ↓
    Middleware chain:
      helmet · cors · morgan · globalLimiter
      versionMiddleware (sets X-API-Version)
      authLimiter | sensitiveLimiter (per-route)
      idempotency (Idempotency-Key dedup)
      express-validator · handleValidation
      authenticateToken (JWT + tokenVersion check)
               ↓
         Controllers
               ↓
    Services / Utils
      Resend (email)   Twilio (SMS)
               ↓
         MongoDB (Mongoose)
               ↓
    Error middleware → { message } JSON
```

**Token invalidation without a blacklist:** every JWT carries `tokenVersion`. On logout or token refresh, `user.tokenVersion` is incremented in the DB. The auth middleware validates the token's version against the DB value on every request — stale tokens are rejected instantly.

---

## Quick Start

```bash
git clone https://github.com/BhanuPrakash256/identity-verification-api.git
cd identity-verification-api
npm install
cp .env.example .env   # fill in your credentials
npm run dev            # nodemon on port 3000
```

```bash
npm test               # full suite (49 tests)
npm start              # production (node, no nodemon)
```

---

## Environment Variables

See `.env.example` for the full list. Key variables:

```env
DB_CONNECTION_STRING=mongodb+srv://...
ACCESS_TOKEN_SECRET=          # node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
REFRESH_TOKEN_SECRET=
RESEND_API_KEY=re_...
EMAIL_FROM=verify@yourdomain.com
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=+1...
BASE_URL=https://your-deployed-url.com
```

---

## API Reference

Base URL: `/api/v1/users`

### Auth

| Method | Endpoint | Auth | Rate limit | Idempotent |
|--------|----------|------|------------|------------|
| `POST` | `/login` | — | Auth (10/15min) | — |
| `POST` | `/logout` | Refresh token | — | — |

### Users

| Method | Endpoint | Auth | Rate limit | Idempotent |
|--------|----------|------|------------|------------|
| `POST` | `/` | — | Auth (10/15min) | ✓ |
| `GET` | `/:username` | Access token | Global | — |
| `PUT` | `/:username` | Access token | Global | — |
| `DELETE` | `/:username` | Access token | Global | — |

### Verification

| Method | Endpoint | Rate limit |
|--------|----------|------------|
| `POST` | `/verify-email/:username` | Sensitive (5/hr) |
| `POST` | `/verify-phone/:username` | Sensitive (5/hr) |
| `GET` | `/verify-status/:username` | Global |

### Tokens

| Method | Endpoint | Auth | Idempotent |
|--------|----------|------|------------|
| `POST` | `/issue-tokens` | Refresh token | ✓ |
| `POST` | `/revoke-tokens` | Refresh token | — |

### Password Reset

| Method | Endpoint | Rate limit | Idempotent |
|--------|----------|------------|------------|
| `POST` | `/forgot-password` | Sensitive (5/hr) | ✓ |
| `POST` | `/reset-password/:token` | Global | — |

### Health

```
GET /health
```
```json
{ "status": "ok", "version": "1.0.0", "uptime": 3600, "database": "connected" }
```

---

## Idempotency

Send `Idempotency-Key: <uuid>` on any supported POST. Replaying the same key returns the cached response without re-executing side effects (no duplicate users, emails, or tokens).

```bash
curl -X POST /api/v1/users \
  -H "Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{ ... }'

# Repeat: returns cached 201 + X-Idempotent-Replayed: true, no new DB record
```

---

## Rate Limiting

All rate limit responses return `429` with `RateLimit-Limit`, `RateLimit-Remaining`, and `RateLimit-Reset` headers (RFC 6585).

```bash
# Hit the auth limiter (10 requests / 15 min)
for i in $(seq 1 11); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST /api/v1/users/login \
    -H "Content-Type: application/json" \
    -d '{"username":"x","password":"y"}'
done
# First 10 → 401, 11th → 429
```

---

## User Verification Flow

```
POST /api/v1/users          → creates account, sends email code + SMS code
POST /verify-email/:username → validates 6-digit code (expires in 10 min)
POST /verify-phone/:username → validates 6-digit code (expires in 10 min)
GET  /verify-status/:username → marks account as verified once both pass
POST /login                  → issues access token (15min) + refresh token (7d)
```

---

## Stack

- **Runtime:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (`jsonwebtoken`), bcrypt
- **Email:** Resend
- **SMS:** Twilio
- **Validation:** express-validator
- **Rate limiting:** express-rate-limit
- **Security:** helmet, cors
- **Logging:** Winston
- **Testing:** Jest, Supertest (49 tests)
