# CivicQueue

A full-stack queue management system for government and public offices — citizens book appointments and track their live queue position in real time; staff manage the queue from a live dashboard; admins get cross-department analytics.

**Stack:** MongoDB · Express · React · Node.js (MERN) + Redis (optional caching) + Socket.io (real-time) + JWT authentication.

---

## Screenshots

> _Add screenshots or a short demo GIF here before sharing this repo — a recruiter spends about 10 seconds on a README, and a visual is worth more than any paragraph._

| Citizen — Live Queue Tracking | Staff — Dashboard | Admin — Analytics |
|---|---|---|
| `./docs/screenshots/citizen-tracking.png` | `./docs/screenshots/staff-dashboard.png` | `./docs/screenshots/admin-analytics.png` |

---

## Features

**Citizens**
- Register/login, book an appointment slot for a department
- Live queue position tracking via Socket.io (no manual refresh needed)
- Appointment history, document upload, QR code for verification at the counter
- In-app notifications for status changes

**Staff**
- Live dashboard: call next, serve, skip, hold tokens
- Approve/reject appointments and review uploaded documents
- Department-scoped view — staff only see their own department's queue

**Admin / Super Admin**
- Cross-department analytics dashboard
- Department and staff account management
- Full visibility across all queues and appointments

**Platform**
- JWT authentication with refresh-token rotation and reuse detection (if a stolen refresh token is replayed after the legitimate one rotated, every session for that user is revoked)
- Role-based access control (citizen / staff / admin / super_admin)
- Account lockout after repeated failed logins
- Redis-backed caching (fully optional — the app runs correctly without Redis, it just skips caching)
- Rate limiting on all API routes, with a stricter limit on auth endpoints
- Centralized, consistent error handling and API response format
- Swagger/OpenAPI docs for every endpoint

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Redux Toolkit, React Router, Tailwind CSS, Axios, Socket.io-client |
| Backend | Node.js, Express.js, Mongoose (MongoDB) |
| Auth | JWT (short-lived access token + httpOnly-cookie refresh token) |
| Real-time | Socket.io |
| Cache | Redis (ioredis) — optional |
| Docs | Swagger / OpenAPI 3.0 |
| Logging | Winston + daily log rotation |
| Testing | Jest + Supertest + mongodb-memory-server |
| Security | Helmet, CORS whitelist, express-mongo-sanitize, xss-clean, express-rate-limit, bcrypt |

---

## Project Structure

```
civicqueue-upgraded/
├── civicqueue/                    # Backend (Express API)
│   ├── src/
│   │   ├── config/                 # DB, Redis, Swagger, env validation
│   │   ├── controllers/            # Route handlers (thin — delegate to services)
│   │   ├── middlewares/            # auth, error, validate, rate-limit, upload, audit
│   │   ├── models/                 # Mongoose schemas + indexes
│   │   ├── repositories/           # Data access layer
│   │   ├── routes/v1/              # Express routers with Swagger JSDoc
│   │   ├── services/               # Business logic
│   │   ├── sockets/                # Socket.io server + event handlers
│   │   ├── utils/                  # ApiError, ApiResponse, helpers, logger
│   │   ├── validators/             # express-validator rule sets
│   │   ├── app.js                  # Express app factory
│   │   └── server.js               # HTTP server bootstrap + graceful shutdown
│   ├── tests/                      # Jest + Supertest auth-flow tests
│   ├── .env.example
│   └── package.json
│
└── civicqueue-frontend/civicqueue-frontend/  # Frontend (React + Vite)
    └── src/
        ├── components/{layout,ui}  # Shared layout + design-system components
        ├── pages/{admin,citizen,auth,shared}
        ├── hooks/                  # useAuth, useQueueData
        ├── store/slices/           # Redux Toolkit slices
        ├── services/               # api.js (axios instance + refresh interceptor)
        └── constants/
```

---

## Installation

### Prerequisites
- Node.js 18+
- MongoDB (local install, or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)
- Redis — **optional**, the app runs fine without it

### 1. Backend

```bash
cd civicqueue
cp .env.example .env      # fill in MONGO_URI and generate real JWT secrets (see below)
npm install
npm run dev                # http://localhost:5000
```

### 2. Frontend

```bash
cd civicqueue-frontend/civicqueue-frontend
cp .env.example .env
npm install
npm run dev                # http://localhost:5173
```

### 3. Run tests (backend)

```bash
cd civicqueue
npm test
```

---

## Environment Variables

Full reference lives in [`civicqueue/.env.example`](./civicqueue/.env.example) and [`civicqueue-frontend/civicqueue-frontend/.env.example`](./civicqueue-frontend/civicqueue-frontend/.env.example). The important ones:

| Variable | Required | Notes |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Yes | Generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` — never reuse the same value for both, never commit real values |
| `FRONTEND_URL` | Recommended | Comma-separated list of allowed origins for CORS. No wildcard fallback in production. |
| `REDIS_ENABLED` | No | `false` disables Redis entirely; app falls back to an in-memory cache |
| `RATE_LIMIT_MAX` / `AUTH_RATE_LIMIT_MAX` | No | Requests per 15-minute window — general API vs. auth-specific |
| `LOG_LEVEL` | No | `debug` for local dev, `info` or `warn` in production |

The server refuses to start if a required variable is missing, and refuses to start **in production** if the JWT secrets are still left as obvious placeholder values (see `src/config/validateEnv.js`).

---

## Deployment Steps

This is sized for a placement-ready deploy (Render/Railway + Vercel/Netlify), not a full enterprise setup (no Docker/Kubernetes/CI here by design).

**Backend (Render or Railway):**
1. Push this repo to GitHub.
2. Create a new Web Service, root directory `civicqueue/`, build command `npm install`, start command `npm start`.
3. Set all required environment variables from `.env.example` in the platform's dashboard — **use real, freshly generated JWT secrets**, not the placeholder ones.
4. Set `NODE_ENV=production` and `FRONTEND_URL` to your deployed frontend's URL.
5. If using MongoDB Atlas, whitelist the platform's outbound IP (or `0.0.0.0/0` for simplicity on a student project).

**Frontend (Vercel or Netlify):**
1. Root directory `civicqueue-frontend/civicqueue-frontend/`, build command `npm run build`, output directory `dist`.
2. Set `VITE_API_URL` to your deployed backend's `/api/v1` URL and `VITE_SOCKET_URL` to the backend's base URL.

**Before you deploy, double-check:**
- [ ] Real JWT secrets set (not the `.env.example` placeholders)
- [ ] `FRONTEND_URL` matches your actual deployed frontend origin exactly
- [ ] `NODE_ENV=production` is set on the backend host
- [ ] MongoDB Atlas network access allows the backend host

---

## API Documentation

Once the backend is running, full interactive API docs (every endpoint, request/response schemas, try-it-out) are available at:

```
http://localhost:5000/api-docs
```

All endpoints are versioned under `/api/v1`. Responses follow a consistent envelope:

```json
{ "success": true, "message": "...", "data": { } }
```

---

## Known Limitations (honest, on purpose)

A short, deliberately honest list — the kind of thing worth being able to speak to in an interview rather than have discovered live:

- Automated test coverage is intentionally minimal (auth flows only) — this is a placement-ready project, not an enterprise one.
- No CI/CD pipeline or containerization — out of scope for this stage by design.
- Access tokens are still kept in `localStorage` on the frontend (short-lived, low-risk tradeoff); only the refresh token is httpOnly-cookie-only.
- Redis is optional and falls back to an in-memory cache — fine for a single-instance deployment, not for horizontal scaling.
