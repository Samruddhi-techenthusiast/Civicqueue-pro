<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> b39a1f7edfb1750ee70940e959fef7d0938f56e2
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
<<<<<<< HEAD
=======
=======
# CivicQueue — Smart Queue Management System

Production-ready backend for government & public office queue management.
>>>>>>> 84ca5b7d2d1ad149ce48b01784af5f194865fab5
>>>>>>> b39a1f7edfb1750ee70940e959fef7d0938f56e2

---

## Tech Stack

| Layer | Technology |
|---|---|
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> b39a1f7edfb1750ee70940e959fef7d0938f56e2
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
<<<<<<< HEAD
=======
=======
| Runtime | Node.js 18+ |
| Framework | Express.js 4.x |
| Database | MongoDB + Mongoose 8.x |
| Cache | Redis (ioredis) |
| Auth | JWT (access + refresh tokens) |
| Real-time | Socket.io 4.x |
| Docs | Swagger / OpenAPI 3.0 |
| Logging | Winston + daily-rotate-file |
| Security | Helmet, CORS, mongo-sanitize, rate-limit |

---

## Folder Structure

```
civicqueue/
├── src/
│   ├── config/          # DB, Redis, Swagger config
│   ├── controllers/     # Route handlers (thin)
│   ├── middlewares/     # auth, error, validate, audit, rate-limit
│   ├── models/          # Mongoose schemas + indexes
│   ├── repositories/    # Data access layer (BaseRepository + per-model)
│   ├── routes/v1/       # Express routers with Swagger JSDoc
│   ├── services/        # Business logic
│   ├── sockets/         # Socket.io server + event handlers
│   ├── utils/           # ApiError, ApiResponse, helpers, logger
│   ├── validators/      # express-validator rule sets
│   ├── app.js           # Express app factory
│   └── server.js        # HTTP server + graceful shutdown
├── logs/                # Rotated log files
├── .env.example
└── package.json
>>>>>>> 84ca5b7d2d1ad149ce48b01784af5f194865fab5
>>>>>>> b39a1f7edfb1750ee70940e959fef7d0938f56e2
```

---

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> b39a1f7edfb1750ee70940e959fef7d0938f56e2
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
<<<<<<< HEAD
=======
=======
## Quick Start

```bash
# 1. Clone & install
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — set MONGO_URI, JWT secrets, Redis config

# 3. Start (development)
npm run dev

# 4. Start (production)
npm start
```

API Docs: http://localhost:5000/api-docs
Health:   http://localhost:5000/api/v1/health
>>>>>>> 84ca5b7d2d1ad149ce48b01784af5f194865fab5
>>>>>>> b39a1f7edfb1750ee70940e959fef7d0938f56e2

---

## Environment Variables

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> b39a1f7edfb1750ee70940e959fef7d0938f56e2
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
<<<<<<< HEAD
=======
=======
| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | required |
| `JWT_ACCESS_SECRET` | Access token secret (min 64 chars) | required |
| `JWT_REFRESH_SECRET` | Refresh token secret (min 64 chars) | required |
| `JWT_ACCESS_EXPIRE` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRE` | Refresh token TTL | `7d` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `AUTH_RATE_LIMIT_MAX` | Max auth attempts per window | `10` |
| `FRONTEND_URL` | CORS origin | `http://localhost:3000` |

---

## API Endpoints (v1)

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register user |
| POST | `/auth/login` | Public | Login → tokens |
| POST | `/auth/refresh` | Public | Refresh access token |
| POST | `/auth/logout` | Bearer | Logout session |
| POST | `/auth/logout-all` | Bearer | Revoke all sessions |
| GET  | `/auth/me` | Bearer | Own profile |
| PATCH | `/auth/change-password` | Bearer | Change password |
| POST | `/auth/forgot-password` | Public | Request reset |
| POST | `/auth/reset-password` | Public | Reset with token |

### Departments
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/departments` | Public | List departments |
| GET | `/departments/:id` | Public | Get department |
| POST | `/departments` | admin | Create department |
| PATCH | `/departments/:id` | admin | Update department |
| DELETE | `/departments/:id` | super_admin | Deactivate |

### Queue & Tokens
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/queue/:deptId/open` | staff | Open today's queue |
| GET | `/queue/:deptId/status` | Public | Live queue status |
| PATCH | `/queue/:deptId/status` | staff | Pause / close queue |
| GET | `/queue/:queueId/tokens` | staff | List queue tokens |
| POST | `/queue/tokens/issue` | citizen | Get a queue token |
| POST | `/queue/tokens/call-next` | staff | Call next citizen |
| PATCH | `/queue/tokens/:id/serve` | staff | Mark as served |
| PATCH | `/queue/tokens/:id/cancel` | citizen/staff | Cancel token |
| GET | `/queue/tokens/my` | citizen | My token history |
| GET | `/queue/tokens/verify/:id` | Public | QR verification |
| GET | `/queue/tokens/:id/qr` | citizen | Token QR code |

### Appointments
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/appointments/slots` | Public | Available time slots |
| POST | `/appointments` | citizen | Book appointment |
| GET | `/appointments/my` | citizen | My appointments |
| GET | `/appointments/:id` | citizen | Appointment details |
| POST | `/appointments/:id/checkin` | citizen | Check in → token |
| PATCH | `/appointments/:id/cancel` | citizen/staff | Cancel |
| GET | `/appointments/department/:id` | staff | Dept appointments |

### Other
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/notifications` | citizen | My notifications |
| PATCH | `/notifications/:id/read` | citizen | Mark read |
| PATCH | `/notifications/read-all` | citizen | Mark all read |
| GET | `/analytics/overview` | admin | System overview |
| GET | `/analytics/department/:id` | staff | Dept analytics |
| GET | `/users` | admin | List users |
| PATCH | `/users/profile` | citizen | Update own profile |

---

## Socket.io Events

### Client → Server
| Event | Payload | Description |
|---|---|---|
| `join:queue` | `{ departmentId }` | Subscribe to queue room |
| `leave:queue` | `{ departmentId }` | Unsubscribe |
| `join:dashboard` | `{ departmentId }` | Staff dashboard room |
| `track:token` | `{ tokenId }` | Track personal token |
| `queue:refresh` | `{ departmentId }` | Request fresh state |
| `ping` | — | Keep-alive |

### Server → Client
| Event | Description |
|---|---|
| `queue:initial` | Full queue state on room join |
| `queue:update` | Any queue state change |
| `token:called` | Token called to counter |
| `token:your_turn` | Personal alert to citizen |
| `notification:new` | Real-time in-app notification |
| `dashboard:update` | Staff dashboard data push |
| `pong` | Ping response |

---

## Authentication Flow

```
POST /auth/login
  → validate credentials
  → bcrypt.compare password
  → sign accessToken (15m) + refreshToken (7d)
  → store refreshToken in user.refreshTokens[]
  → return both tokens

POST /auth/refresh
  → verify refreshToken signature
  → check token exists in user.refreshTokens[] (rotation)
  → if reused → revoke ALL tokens (security)
  → issue new token pair

POST /auth/logout
  → blacklist accessToken in Redis (TTL = remaining expiry)
  → remove refreshToken from user.refreshTokens[]
>>>>>>> 84ca5b7d2d1ad149ce48b01784af5f194865fab5
>>>>>>> b39a1f7edfb1750ee70940e959fef7d0938f56e2
```

---

<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> b39a1f7edfb1750ee70940e959fef7d0938f56e2
## Known Limitations (honest, on purpose)

A short, deliberately honest list — the kind of thing worth being able to speak to in an interview rather than have discovered live:

- Automated test coverage is intentionally minimal (auth flows only) — this is a placement-ready project, not an enterprise one.
- No CI/CD pipeline or containerization — out of scope for this stage by design.
- Access tokens are still kept in `localStorage` on the frontend (short-lived, low-risk tradeoff); only the refresh token is httpOnly-cookie-only.
- Redis is optional and falls back to an in-memory cache — fine for a single-instance deployment, not for horizontal scaling.
<<<<<<< HEAD
=======
=======
## Role-Based Access Control

| Role | Permissions |
|---|---|
| `citizen` | Issue tokens, book appointments, view own data |
| `staff` | All citizen + manage queues, call next, serve tokens |
| `admin` | All staff + manage departments and users |
| `super_admin` | Full access including user role changes |

---

## Security Features

- **Password hashing**: bcrypt with salt rounds = 12
- **Account lockout**: 5 failed logins → 30 min lock
- **Token rotation**: refresh token reuse detection → full revocation
- **JWT blacklisting**: Redis-based access token invalidation on logout
- **NoSQL injection prevention**: express-mongo-sanitize
- **HTTP security headers**: Helmet.js
- **Rate limiting**: Global (100/15min) + Auth (10/15min) + Token (5/min)
- **Input validation**: express-validator on all mutation endpoints
- **Audit trail**: All mutations logged with actor, IP, user-agent

---

## Database Indexes

Every collection has optimized compound indexes:
- **Users**: `email`, `phone`, `role`, `department`, `isActive+role`
- **Tokens**: `queue+status`, `queue+serial`, `department+date+status`, `citizen+createdAt`
- **Queue**: `department+date` (unique), `status`, `date`
- **Appointments**: `citizen+date`, `department+date+status`, `confirmationCode` (unique)
- **Notifications**: `recipient+isRead+createdAt`
- **Logs**: `createdAt` (TTL 90 days auto-delete)
>>>>>>> 84ca5b7d2d1ad149ce48b01784af5f194865fab5
>>>>>>> b39a1f7edfb1750ee70940e959fef7d0938f56e2
