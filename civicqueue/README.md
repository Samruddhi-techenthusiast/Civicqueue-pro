# CivicQueue — Smart Queue Management System

Production-ready backend for government & public office queue management.

---

## Tech Stack

| Layer | Technology |
|---|---|
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
```

---

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

---

## Environment Variables

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
```

---

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
