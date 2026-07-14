# CivicQueue — How to Start the App

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| MongoDB | 6+ | https://www.mongodb.com/try/download/community |
| npm | 9+ | comes with Node.js |

> **Redis is optional.** The app runs without it using an in-memory cache.

---

## Step 1 — Start MongoDB

**Mac (Homebrew):**
```bash
brew services start mongodb-community
```

**Windows:**
MongoDB runs as a service automatically after install. Check Services or run:
```bash
net start MongoDB
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Verify MongoDB is running:**
```bash
mongosh --eval "db.runCommand({ ping: 1 })"
# Should print: { ok: 1 }
```

---

## Step 2 — Start the Backend (port 5000)

```bash
cd civicqueue
npm install
npm run dev
```

You should see:
```
╔════════════════════════════════════════════╗
║   CivicQueue API  →  http://localhost:5000  ║
║   Docs           →  /api-docs              ║
╚════════════════════════════════════════════╝
```

**Test it's working:**
```bash
curl http://localhost:5000/api/v1/health
# Should return: {"success":true,"message":"CivicQueue API is healthy"}
```

---

## Step 3 — Start the Frontend (port 3000)

Open a **new terminal** (keep backend running):
```bash
cd civicqueue-frontend/civicqueue-frontend
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Step 4 — Create Your First Admin Account

Register at http://localhost:3000/register

Then in the MongoDB shell, promote yourself to admin:
```bash
mongosh civicqueue
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "super_admin" } })
```

Or use the API (during dev, the register endpoint accepts role):
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@civic.com","password":"Admin@1234","role":"super_admin"}'
```

---

## Troubleshooting

### "timeout of 15000ms exceeded" in browser console
This means the **frontend can't reach the backend**. Fix in order:
1. Confirm backend is running: `curl http://localhost:5000/api/v1/health`
2. Confirm MongoDB is running (backend crashes if Mongo is down)
3. Check for port conflict: `lsof -i :5000`

### "MongoServerError: connection refused"
MongoDB is not running. See Step 1 above.

### "Cannot find module" on backend start
Run `npm install` inside the `civicqueue/` folder.

### Port already in use
```bash
# Kill whatever is on port 5000
lsof -ti:5000 | xargs kill -9
# Kill whatever is on port 3000
lsof -ti:3000 | xargs kill -9
```

### CORS errors in browser
Make sure `FRONTEND_URL=http://localhost:3000` is set in `civicqueue/.env`.
The Vite proxy (`/api/v1`) handles this automatically in dev.

---

## API Documentation (Swagger)

http://localhost:5000/api-docs

---

## Project Structure

```
civicqueue/                ← Node.js + Express backend (port 5000)
  src/
    controllers/           ← Route handlers
    services/              ← Business logic
    models/                ← Mongoose schemas
    routes/                ← Express routes
    middlewares/           ← Auth, RBAC, audit, upload
    sockets/               ← Socket.IO server
  .env                     ← ✅ Already created for you

civicqueue-frontend/
  civicqueue-frontend/     ← React + Vite frontend (port 3000)
    src/
      pages/               ← All UI pages
      components/          ← Reusable UI components
      store/               ← Redux state
      services/            ← API + Socket.IO client
    .env                   ← ✅ Already created for you
```
