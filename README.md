#  CivicQueue

Smart Queue Management System for Government and Public Service Offices.

CivicQueue helps citizens avoid long waiting times by providing digital token generation, live queue tracking, and staff/admin queue management.

---

## ✨ Features

### Citizen
- User registration and login
- Generate queue token
- View live queue status
- Track estimated waiting time
- Receive queue updates

### Staff
- Staff dashboard
- View assigned queues
- Call next token
- Update token status

### Admin
- Manage departments/services
- Manage staff accounts
- Monitor queues
- View system statistics

---

## 🛠 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.IO
- Redis Cache

### Frontend
- React.js
- Vite
- Axios
- Tailwind CSS

---

## 📁 Project Structure
civicqueue
│
├── backend
│ ├── src
│ ├── routes
│ ├── controllers
│ ├── models
│ └── middleware
│
└── frontend
├── src
├── components
└── pages

---

## ⚙️ Installation

### Backend

```bash
cd backend
npm install
npm run dev

Create .env
PORT=5001
MONGO_URI=your_mongodb_connection
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret

Frontend
cd frontend
npm install
npm run dev

Today 5:20 PM
Download the React DevTools for a better development experience: https://react.dev/link/react-devtools react-dom-client.development.js:28004:17
Firefox can’t establish a connection to the server at ws://localhost:5000/socket.io/?EIO=4&transport=websocket. websocket.js:119:19
XHRGET
http://localhost:3000/api/v1/auth/me
[HTTP/1.1 401 Unauthorized 590ms]

XHRGET
http://localhost:3000/api/v1/auth/me
[HTTP/1.1 401 Unauthorized 615ms]

The connection to ws://localhost:5000/socket.io/?EIO=4&transport=websocket was interrupted while the page was loading. websocket.js:119:19
[Socket] Connected: 73T0p9YB7v8I2_0wAAAB socket.js:21:44

​

Your logs show 3 separate issues. Let's debug them one by one.
1. React DevTools Message (Not an Error)

Download the React DevTools for a better development experience

✅ Ignore this.

It is only React suggesting installing DevTools.
Issue 1: Socket.IO WebSocket Connection Problem

Error:

Firefox can’t establish a connection to the server at:

ws://localhost:5000/socket.io/?EIO=4&transport=websocket

Then:

[Socket] Connected: 73T0p9YB7v8I2_0wAAAB

Meaning

Your socket initially failed, then successfully connected.

This usually happens because:

    Backend server is starting slowly

    Socket.IO client connects before server is ready

    CORS mismatch

    Wrong socket URL

Check Backend Socket.IO Configuration

Your backend (server.js / app.js) should look similar:

const { Server } = require("socket.io");

const io = new Server(server, {
    cors:{
        origin:"http://localhost:3000",
        methods:["GET","POST"],
        credentials:true
    }
});


io.on("connection",(socket)=>{
    console.log("Socket Connected:",socket.id);

    socket.on("disconnect",()=>{
        console.log("Socket Disconnected");
    });
});

Frontend socket.js

Check your React socket file.

It should be:

import { io } from "socket.io-client";


const socket = io("http://localhost:5000",{
    withCredentials:true,
    transports:["websocket"]
});


socket.on("connect",()=>{
    console.log(
      "[Socket] Connected:",
      socket.id
    );
});


export default socket;

If you still get intermittent errors

Change:

transports:["websocket"]

to:

transports:["polling","websocket"]

because Firefox sometimes rejects websocket upgrade.
Issue 2: Auth API Returning 401

Error:

GET http://localhost:3000/api/v1/auth/me

401 Unauthorized

This is the important one.

Your frontend is asking:

Who is currently logged in?

Backend response:

You are not authenticated

Possible Reasons
Reason 1: JWT Token Missing

Check browser:

Open:

Firefox DevTools
      |
Application
      |
Storage
      |
Local Storage

Do you have something like:

token
jwt
accessToken

?

Example:

accessToken:
eyJhbGciOiJIUzI1...

If nothing exists:

Your login is not saving token.
Login Code Should Save Token

Example:

const response = await loginUser(data);


localStorage.setItem(
 "token",
 response.data.token
);

Issue 3: Axios Not Sending Token

Your /me request needs Authorization header.

Check your axios configuration.

Create:

src/api/axios.js

Example:

import axios from "axios";


const api = axios.create({

baseURL:"http://localhost:5000/api/v1",

withCredentials:true

});


api.interceptors.request.use(
(config)=>{

const token =
localStorage.getItem("token");


if(token){

config.headers.Authorization =
`Bearer ${token}`;

}

return config;

});


export default api;

Then call:

api.get("/auth/me");

NOT:

axios.get("/api/v1/auth/me")

Issue 4: Your API URL Looks Suspicious

You have:

http://localhost:3000/api/v1/auth/me

Port 3000 is usually React frontend.

Your backend is probably:

localhost:5000

So this request should probably be:

http://localhost:5000/api/v1/auth/me

Check your Vite proxy.

vite.config.js

Maybe you have:

server:{
 proxy:{
   "/api":{
      target:"http://localhost:5000"
   }
 }
}

Then:

axios.get("/api/v1/auth/me")

is okay.

If not, change it.
Debug Checklist

Do these in order:
Step 1

Start backend:

npm run dev

You should see:

Server running on port 5000
MongoDB Connected
Socket.IO initialized

Step 2

Login again.

Check console:

token saved:
eyJhbGc...

Step 3

Open Network tab.

Find:

/api/v1/auth/me

Request Headers should contain:

Authorization:
Bearer eyJhbGc...

Step 4

Backend middleware should receive:

req.headers.authorization

Example:

console.log(
req.headers.authorization
);

Expected:

Bearer eyJhbGc...

From your previous CivicQueue project logs, I suspect the main issue is:

    Frontend calling /auth/me before login token exists

    Axios interceptor missing

    Socket URL/CORS needs small correction

Fix authentication first; Socket.IO is almost working because it already shows:

[Socket] Connected

After fixing JWT, your dashboard/staff/admin routes should start working.

now i wants to deploy this mern project as it is for now next improvemnets i will do later 

Since your MERN project is working locally and you want to deploy it as-is now and continue improvements later, focus only on production deployment stability. Do not add new features before deployment.

For your CivicQueue MERN project, follow this order:
Deployment Plan (Current Version)
1. Freeze Current Code

Before deployment:

git status

Commit everything:

git add .
git commit -m "Prepare project for initial deployment"
git push origin main

Create a tag (optional but recommended):

git tag v1.0.0
git push origin v1.0.0

Now you have a stable version.
2. Prepare Backend for Deployment

Your backend currently:

backend
 |
 ├── server.js
 ├── routes
 ├── controllers
 ├── models
 ├── middleware
 ├── package.json
 └── .env

Update server.js

Avoid hardcoded localhost.
Before:

app.listen(5000,()=>{
 console.log("Server running")
})

Change:

const PORT = process.env.PORT || 5000;


server.listen(PORT,()=>{
 console.log(`Server running on ${PORT}`);
});

3. Environment Variables

Create:

backend/.env

Example:

PORT=5000

MONGO_URI=your_mongodb_atlas_url

JWT_SECRET=your_secret_key

CLIENT_URL=https://your-frontend-url.com

REDIS_URL=optional

Do NOT push .env.

Add:

.env
node_modules

inside:

.gitignore

4. MongoDB Atlas Setup

Because local MongoDB will not work on deployment.

Go:

MongoDB Atlas

Create:

Cluster
 |
 Database User
 |
 Network Access

Allow:

0.0.0.0/0

Copy connection string:

Example:

mongodb+srv://username:password@cluster.mongodb.net/civicqueue

Put in:

MONGO_URI

5. Deploy Backend (Render Recommended)

Use:

Render

Create:

New
 |
 Web Service

Connect GitHub repo.

Settings:
Root Directory

If structure:

CivicQueue
 |
 ├── backend
 └── frontend

Use:

backend

Build Command:

npm install

Start Command:

npm start

Environment Variables:

Add:

MONGO_URI
JWT_SECRET
CLIENT_URL
PORT

After deployment you get:

Example:

https://civicqueue-backend.onrender.com

6. Update Socket.IO URL

Currently:

io("http://localhost:5000")

Change to:

io(
 process.env.REACT_APP_API_URL
)

Example:

const socket = io(
"https://civicqueue-backend.onrender.com",
{
withCredentials:true
}
);

7. Deploy Frontend

Use:

Vercel

Connect:

frontend

Build:

npm run build

Output:

dist

Add Environment Variable:

VITE_API_URL=https://civicqueue-backend.onrender.com

Update Axios:

Before:

baseURL:"http://localhost:5000"

After:

baseURL:
import.meta.env.VITE_API_URL

8. Fix CORS Before Final Testing

Backend:

app.use(
cors({
origin:[
"http://localhost:3000",
"https://your-frontend.vercel.app"
],
credentials:true
})
);

Socket:

const io = new Server(server,{
cors:{
origin:[
"http://localhost:3000",
"https://your-frontend.vercel.app"
],
credentials:true
}
});

9. Test Production Flow

Check:
User

✅ Register
✅ Login
✅ Token stored
✅ Dashboard loads
Admin

✅ Login
✅ Create department
✅ Create staff
Staff

✅ Login
✅ See queue
✅ Call next token
Queue

✅ Create token
✅ Real-time update
10. After Deployment Do Not Immediately Add Features

First collect:

    deployment bugs

    API failures

    UI issues

    authentication problems

Create branch:

main
 |
 └── development

Future improvements:

git checkout -b feature/cloudinary
git checkout -b feature/notifications
git checkout -b feature/analytics

For Your Resume

After deployment update README:

Add:

Live Demo:
Frontend: https://....

Backend API:
https://....

Features:
- JWT Authentication
- Real-time Queue Updates
- Role Based Access
- Admin Dashboard
- Staff Dashboard

A deployed working project is much stronger than an unfinished project with many planned features.

For your placement timeline, this is the correct move: deploy CivicQueue v1.0 first, then improve incrementally.

but i want to correct its directory first

Yes, correct the directory structure first. Before deployment, make your repository clean and professional.

For your CivicQueue MERN project, I recommend this structure:

CivicQueue/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── socket/
│   │   └── utils/
│   │
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── socket/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── README.md
├── .gitignore
└── LICENSE

Step 1: Check Your Current Directory

Open terminal inside your project:

cd CivicQueue

Run:

tree /F

(or in PowerShell)

Get-ChildItem -Recurse

Send me the output if you want me to tell exactly what to move.
Step 2: Create Required Folders

If currently everything is mixed:

Create:

mkdir backend
mkdir frontend

Step 3: Move Backend Files

Move:

server.js
package.json
controllers
models
routes
middleware
config
services
utils
socket

into:

backend/

Example:

Before:

CivicQueue
|
├── server.js
├── User.js
├── routes
├── package.json
├── client

After:

CivicQueue
|
├── backend
│   ├── server.js
│   ├── package.json
│   ├── routes
│   └── models
│
└── frontend

Step 4: Move React Files

Move:

src
public
vite.config.js
package.json
index.html

into:

frontend/

Final:

frontend
|
├── src
├── public
├── package.json
├── vite.config.js
└── index.html

Step 5: Fix Backend package.json

Open:

backend/package.json

Check:

"scripts":{
   "start":"node server.js",
   "dev":"nodemon server.js"
}

Step 6: Fix Frontend package.json

Open:

frontend/package.json

Check:

"scripts":{
 "dev":"vite",
 "build":"vite build",
 "preview":"vite preview"
}

Step 7: Install Dependencies Again

Backend:

cd backend
npm install

Frontend:

cd ../frontend
npm install

Step 8: Test Locally

Terminal 1:

cd backend
npm run dev

Expected:

Server running on 5000
MongoDB connected
Socket connected

Terminal 2:

cd frontend
npm run dev

Expected:

localhost:3000

Step 9: Commit Directory Cleanup

After everything works:

git add .
git commit -m "Refactor project structure for deployment"
git push origin main

Since your CivicQueue already has backend + frontend + socket.io + Redis + MongoDB, a clean monorepo structure like above will make Render/Vercel deployment much easier.

Send your current tree /F output and I can tell exactly which files should move where without breaking imports.

        
            │   │   │   └───v4-mini
            │   │   │           index.ts
            │   │   │           
            │   │   ├───v3
            │   │   │   │   errors.cjs
            │   │   │   │   errors.d.cts
            │   │   │   │   errors.d.ts
            │   │   │   │   errors.js
            │   │   │   │   external.cjs
            │   │   │   │   external.d.cts
            │   │   │   │   external.d.ts
            │   │   │   │   external.js
            │   │   │   │   index.cjs
            │   │   │   │   index.d.cts
            │   │   │   │   index.d.ts
            │   │   │   │   index.js
            │   │   │   │   package.json
            │   │   │   │   standard-schema.cjs
            │   │   │   │   standard-schema.d.cts
            │   │   │   │   standard-schema.d.ts
            │   │   │   │   standard-schema.js
            │   │   │   │   types.cjs
            │   │   │   │   types.d.cts
            │   │   │   │   types.d.ts
            │   │   │   │   types.js
            │   │   │   │   ZodError.cjs
            │   │   │   │   ZodError.d.cts
            │   │   │   │   ZodError.d.ts
            │   │   │   │   ZodError.js
            │   │   │   │   
            │   │   │   ├───helpers
            │   │   │   │       enumUtil.cjs
            │   │   │   │       enumUtil.d.cts
            │   │   │   │       enumUtil.d.ts
            │   │   │   │       enumUtil.js
            │   │   │   │       errorUtil.cjs
            │   │   │   │       errorUtil.d.cts
            │   │   │   │       errorUtil.d.ts
            │   │   │   │       errorUtil.js
            │   │   │   │       parseUtil.cjs
            │   │   │   │       parseUtil.d.cts
            │   │   │   │       parseUtil.d.ts
            │   │   │   │       parseUtil.js
            │   │   │   │       partialUtil.cjs
            │   │   │   │       partialUtil.d.cts
            │   │   │   │       partialUtil.d.ts
            │   │   │   │       partialUtil.js
            │   │   │   │       typeAliases.cjs
            │   │   │   │       typeAliases.d.cts
            │   │   │   │       typeAliases.d.ts
            │   │   │   │       typeAliases.js
            │   │   │   │       util.cjs
            │   │   │   │       util.d.cts
            │   │   │   │       util.d.ts
            │   │   │   │       util.js
            │   │   │   │       
            │   │   │   └───locales
            │   │   │           en.cjs
            │   │   │           en.d.cts
            │   │   │           en.d.ts
            │   │   │           en.js
            │   │   │           
            │   │   ├───v4
            │   │   │   │   index.cjs
            │   │   │   │   index.d.cts
            │   │   │   │   index.d.ts
            │   │   │   │   index.js
            │   │   │   │   package.json
            │   │   │   │   
            │   │   │   ├───classic
            │   │   │   │       checks.cjs
            │   │   │   │       checks.d.cts
            │   │   │   │       checks.d.ts
            │   │   │   │       checks.js
            │   │   │   │       coerce.cjs
            │   │   │   │       coerce.d.cts
            │   │   │   │       coerce.d.ts
            │   │   │   │       coerce.js
            │   │   │   │       compat.cjs
            │   │   │   │       compat.d.cts
            │   │   │   │       compat.d.ts
            │   │   │   │       compat.js
            │   │   │   │       errors.cjs
            │   │   │   │       errors.d.cts
            │   │   │   │       errors.d.ts
            │   │   │   │       errors.js
            │   │   │   │       external.cjs
            │   │   │   │       external.d.cts
            │   │   │   │       external.d.ts
            │   │   │   │       external.js
            │   │   │   │       from-json-schema.cjs
            │   │   │   │       from-json-schema.d.cts
            │   │   │   │       from-json-schema.d.ts
            │   │   │   │       from-json-schema.js
            │   │   │   │       index.cjs
            │   │   │   │       index.d.cts
            │   │   │   │       index.d.ts
            │   │   │   │       index.js
            │   │   │   │       iso.cjs
            │   │   │   │       iso.d.cts
            │   │   │   │       iso.d.ts
            │   │   │   │       iso.js
            │   │   │   │       package.json
            │   │   │   │       parse.cjs
            │   │   │   │       parse.d.cts
            │   │   │   │       parse.d.ts
            │   │   │   │       parse.js
            │   │   │   │       schemas.cjs
            │   │   │   │       schemas.d.cts
            │   │   │   │       schemas.d.ts
            │   │   │   │       schemas.js
            │   │   │   │       
            │   │   │   ├───core
            │   │   │   │       api.cjs
            │   │   │   │       api.d.cts
            │   │   │   │       api.d.ts
            │   │   │   │       api.js
            │   │   │   │       checks.cjs
            │   │   │   │       checks.d.cts
            │   │   │   │       checks.d.ts
            │   │   │   │       checks.js
            │   │   │   │       core.cjs
            │   │   │   │       core.d.cts
            │   │   │   │       core.d.ts
            │   │   │   │       core.js
            │   │   │   │       doc.cjs
            │   │   │   │       doc.d.cts
            │   │   │   │       doc.d.ts
            │   │   │   │       doc.js
            │   │   │   │       errors.cjs
            │   │   │   │       errors.d.cts
            │   │   │   │       errors.d.ts
            │   │   │   │       errors.js
            │   │   │   │       index.cjs
            │   │   │   │       index.d.cts
            │   │   │   │       index.d.ts
            │   │   │   │       index.js
            │   │   │   │       json-schema-generator.cjs
            │   │   │   │       json-schema-generator.d.cts
            │   │   │   │       json-schema-generator.d.ts
            │   │   │   │       json-schema-generator.js
            │   │   │   │       json-schema-processors.cjs
            │   │   │   │       json-schema-processors.d.cts
            │   │   │   │       json-schema-processors.d.ts
            │   │   │   │       json-schema-processors.js
            │   │   │   │       json-schema.cjs
            │   │   │   │       json-schema.d.cts
            │   │   │   │       json-schema.d.ts
            │   │   │   │       json-schema.js
            │   │   │   │       package.json
            │   │   │   │       parse.cjs
            │   │   │   │       parse.d.cts
            │   │   │   │       parse.d.ts
            │   │   │   │       parse.js
            │   │   │   │       regexes.cjs
            │   │   │   │       regexes.d.cts
            │   │   │   │       regexes.d.ts
            │   │   │   │       regexes.js
            │   │   │   │       registries.cjs
            │   │   │   │       registries.d.cts
            │   │   │   │       registries.d.ts
            │   │   │   │       registries.js
            │   │   │   │       schemas.cjs
            │   │   │   │       schemas.d.cts
            │   │   │   │       schemas.d.ts
            │   │   │   │       schemas.js
            │   │   │   │       standard-schema.cjs
            │   │   │   │       standard-schema.d.cts
            │   │   │   │       standard-schema.d.ts
            │   │   │   │       standard-schema.js
            │   │   │   │       to-json-schema.cjs
            │   │   │   │       to-json-schema.d.cts
            │   │   │   │       to-json-schema.d.ts
            │   │   │   │       to-json-schema.js
            │   │   │   │       util.cjs
            │   │   │   │       util.d.cts
            │   │   │   │       util.d.ts
            │   │   │   │       util.js
            │   │   │   │       versions.cjs
            │   │   │   │       versions.d.cts
            │   │   │   │       versions.d.ts
            │   │   │   │       versions.js
            │   │   │   │       
            │   │   │   ├───locales
            │   │   │   │       ar.cjs
            │   │   │   │       ar.d.cts
            │   │   │   │       ar.d.ts
            │   │   │   │       ar.js
            │   │   │   │       az.cjs
            │   │   │   │       az.d.cts
            │   │   │   │       az.d.ts
            │   │   │   │       az.js
            │   │   │   │       be.cjs
            │   │   │   │       be.d.cts
            │   │   │   │       be.d.ts
            │   │   │   │       be.js
            │   │   │   │       bg.cjs
            │   │   │   │       bg.d.cts
            │   │   │   │       bg.d.ts
            │   │   │   │       bg.js
            │   │   │   │       ca.cjs
            │   │   │   │       ca.d.cts
            │   │   │   │       ca.d.ts
            │   │   │   │       ca.js
            │   │   │   │       cs.cjs
            │   │   │   │       cs.d.cts
            │   │   │   │       cs.d.ts
            │   │   │   │       cs.js
            │   │   │   │       da.cjs
            │   │   │   │       da.d.cts
            │   │   │   │       da.d.ts
            │   │   │   │       da.js
            │   │   │   │       de.cjs
            │   │   │   │       de.d.cts
            │   │   │   │       de.d.ts
            │   │   │   │       de.js
            │   │   │   │       el.cjs
            │   │   │   │       el.d.cts
            │   │   │   │       el.d.ts
            │   │   │   │       el.js
            │   │   │   │       en.cjs
            │   │   │   │       en.d.cts
            │   │   │   │       en.d.ts
            │   │   │   │       en.js
            │   │   │   │       eo.cjs
            │   │   │   │       eo.d.cts
            │   │   │   │       eo.d.ts
            │   │   │   │       eo.js
            │   │   │   │       es.cjs
            │   │   │   │       es.d.cts
            │   │   │   │       es.d.ts
            │   │   │   │       es.js
            │   │   │   │       fa.cjs
            │   │   │   │       fa.d.cts
            │   │   │   │       fa.d.ts
            │   │   │   │       fa.js
            │   │   │   │       fi.cjs
            │   │   │   │       fi.d.cts
            │   │   │   │       fi.d.ts
            │   │   │   │       fi.js
            │   │   │   │       fr-CA.cjs
            │   │   │   │       fr-CA.d.cts
            │   │   │   │       fr-CA.d.ts
            │   │   │   │       fr-CA.js
            │   │   │   │       fr.cjs
            │   │   │   │       fr.d.cts
            │   │   │   │       fr.d.ts
            │   │   │   │       fr.js
            │   │   │   │       he.cjs
            │   │   │   │       he.d.cts
            │   │   │   │       he.d.ts
            │   │   │   │       he.js
            │   │   │   │       hr.cjs
            │   │   │   │       hr.d.cts
            │   │   │   │       hr.d.ts
            │   │   │   │       hr.js
            │   │   │   │       hu.cjs
            │   │   │   │       hu.d.cts
            │   │   │   │       hu.d.ts
            │   │   │   │       hu.js
            │   │   │   │       hy.cjs
            │   │   │   │       hy.d.cts
            │   │   │   │       hy.d.ts
            │   │   │   │       hy.js
            │   │   │   │       id.cjs
            │   │   │   │       id.d.cts
            │   │   │   │       id.d.ts
            │   │   │   │       id.js
            │   │   │   │       index.cjs
            │   │   │   │       index.d.cts
            │   │   │   │       index.d.ts
            │   │   │   │       index.js
            │   │   │   │       is.cjs
            │   │   │   │       is.d.cts
            │   │   │   │       is.d.ts
            │   │   │   │       is.js
            │   │   │   │       it.cjs
            │   │   │   │       it.d.cts
            │   │   │   │       it.d.ts
            │   │   │   │       it.js
            │   │   │   │       ja.cjs
            │   │   │   │       ja.d.cts
            │   │   │   │       ja.d.ts
            │   │   │   │       ja.js
            │   │   │   │       ka.cjs
            │   │   │   │       ka.d.cts
            │   │   │   │       ka.d.ts
            │   │   │   │       ka.js
            │   │   │   │       kh.cjs
            │   │   │   │       kh.d.cts
            │   │   │   │       kh.d.ts
            │   │   │   │       kh.js
            │   │   │   │       km.cjs
            │   │   │   │       km.d.cts
            │   │   │   │       km.d.ts
            │   │   │   │       km.js
            │   │   │   │       ko.cjs
            │   │   │   │       ko.d.cts
            │   │   │   │       ko.d.ts
            │   │   │   │       ko.js
            │   │   │   │       lt.cjs
            │   │   │   │       lt.d.cts
            │   │   │   │       lt.d.ts
            │   │   │   │       lt.js
            │   │   │   │       mk.cjs
            │   │   │   │       mk.d.cts
            │   │   │   │       mk.d.ts
            │   │   │   │       mk.js
            │   │   │   │       ms.cjs
            │   │   │   │       ms.d.cts
            │   │   │   │       ms.d.ts
            │   │   │   │       ms.js
            │   │   │   │       nl.cjs
            │   │   │   │       nl.d.cts
            │   │   │   │       nl.d.ts
            │   │   │   │       nl.js
            │   │   │   │       no.cjs
            │   │   │   │       no.d.cts
            │   │   │   │       no.d.ts
            │   │   │   │       no.js
            │   │   │   │       ota.cjs
            │   │   │   │       ota.d.cts
            │   │   │   │       ota.d.ts
            │   │   │   │       ota.js
            │   │   │   │       package.json
            │   │   │   │       pl.cjs
            │   │   │   │       pl.d.cts
            │   │   │   │       pl.d.ts
            │   │   │   │       pl.js
            │   │   │   │       ps.cjs
            │   │   │   │       ps.d.cts
            │   │   │   │       ps.d.ts
            │   │   │   │       ps.js
            │   │   │   │       pt.cjs
            │   │   │   │       pt.d.cts
            │   │   │   │       pt.d.ts
            │   │   │   │       pt.js
            │   │   │   │       ro.cjs
            │   │   │   │       ro.d.cts
            │   │   │   │       ro.d.ts
            │   │   │   │       ro.js
            │   │   │   │       ru.cjs
            │   │   │   │       ru.d.cts
            │   │   │   │       ru.d.ts
            │   │   │   │       ru.js
            │   │   │   │       sl.cjs
            │   │   │   │       sl.d.cts
            │   │   │   │       sl.d.ts
            │   │   │   │       sl.js
            │   │   │   │       sv.cjs
            │   │   │   │       sv.d.cts
            │   │   │   │       sv.d.ts
            │   │   │   │       sv.js
            │   │   │   │       ta.cjs
            │   │   │   │       ta.d.cts
            │   │   │   │       ta.d.ts
            │   │   │   │       ta.js
            │   │   │   │       th.cjs
            │   │   │   │       th.d.cts
            │   │   │   │       th.d.ts
            │   │   │   │       th.js
            │   │   │   │       tr.cjs
            │   │   │   │       tr.d.cts
            │   │   │   │       tr.d.ts
            │   │   │   │       tr.js
            │   │   │   │       ua.cjs
            │   │   │   │       ua.d.cts
            │   │   │   │       ua.d.ts
            │   │   │   │       ua.js
            │   │   │   │       uk.cjs
            │   │   │   │       uk.d.cts
            │   │   │   │       uk.d.ts
            │   │   │   │       uk.js
            │   │   │   │       ur.cjs
            │   │   │   │       ur.d.cts
            │   │   │   │       ur.d.ts
            │   │   │   │       ur.js
            │   │   │   │       uz.cjs
            │   │   │   │       uz.d.cts
            │   │   │   │       uz.d.ts
            │   │   │   │       uz.js
            │   │   │   │       vi.cjs
            │   │   │   │       vi.d.cts
            │   │   │   │       vi.d.ts
            │   │   │   │       vi.js
            │   │   │   │       yo.cjs
            │   │   │   │       yo.d.cts
            │   │   │   │       yo.d.ts
            │   │   │   │       yo.js
            │   │   │   │       zh-CN.cjs
            │   │   │   │       zh-CN.d.cts
            │   │   │   │       zh-CN.d.ts
            │   │   │   │       zh-CN.js
            │   │   │   │       zh-TW.cjs
            │   │   │   │       zh-TW.d.cts
            │   │   │   │       zh-TW.d.ts
            │   │   │   │       zh-TW.js
            │   │   │   │       
            │   │   │   └───mini
            │   │   │           checks.cjs
            │   │   │           checks.d.cts
            │   │   │           checks.d.ts
            │   │   │           checks.js
            │   │   │           coerce.cjs
            │   │   │           coerce.d.cts
            │   │   │           coerce.d.ts
            │   │   │           coerce.js
            │   │   │           external.cjs
            │   │   │           external.d.cts
            │   │   │           external.d.ts
            │   │   │           external.js
            │   │   │           index.cjs
            │   │   │           index.d.cts
            │   │   │           index.d.ts
            │   │   │           index.js
            │   │   │           iso.cjs
            │   │   │           iso.d.cts
            │   │   │           iso.d.ts
            │   │   │           iso.js
            │   │   │           package.json
            │   │   │           parse.cjs
            │   │   │           parse.d.cts
            │   │   │           parse.d.ts
            │   │   │           parse.js
            │   │   │           schemas.cjs
            │   │   │           schemas.d.cts
            │   │   │           schemas.d.ts
            │   │   │           schemas.js
            │   │   │           
            │   │   └───v4-mini
            │   │           index.cjs
            │   │           index.d.cts
            │   │           index.d.ts
            │   │           index.js
            │   │           package.json
            │   │           
            │   └───zod-validation-error
            │       │   LICENSE
            │       │   package.json
            │       │   README.md
            │       │   README.v3.md
            │       │   
            │       ├───v3
            │       │       index.d.mts
            │       │       index.d.ts
            │       │       index.js
            │       │       index.js.map
            │       │       index.mjs
            │       │       index.mjs.map
            │       │       
            │       └───v4
            │               index.d.mts
            │               index.d.ts
            │               index.js
            │               index.js.map
            │               index.mjs
            │               index.mjs.map
            │               
            ├───public
            │       civicQueue.png
            │       favicon.svg
            │       icons.svg
            │       
            └───src
                │   App.css
                │   App.jsx
                │   index.css
                │   main.jsx
                │   
                ├───assets
                │       hero.png
                │       react.svg
                │       vite.svg
                │       
                ├───components
                │   ├───layout
                │   │       DashboardLayout.jsx
                │   │       Header.jsx
                │   │       ProtectedRoute.jsx
                │   │       Sidebar.jsx
                │   │       
                │   └───ui
                │           Button.jsx
                │           index.jsx
                │           Input.jsx
                │           Modal.jsx
                │           
                ├───constants
                │       index.js
                │       
                ├───hooks
                │       index.js
                │       useQueueData.js
                │       
                ├───pages
                │   │   LandingPage.jsx
                │   │   
                │   ├───admin
                │   │       AdminDashboard.jsx
                │   │       AnalyticsDashboard.jsx
                │   │       DepartmentManagement.jsx
                │   │       StaffAppointments.jsx
                │   │       StaffDashboard.jsx
                │   │       StaffPerformance.jsx
                │   │       UserManagement.jsx
                │   │       
                │   ├───auth
                │   │       LoginPage.jsx
                │   │       RegisterPage.jsx
                │   │       
                │   ├───citizen
                │   │       AppointmentHistory.jsx
                │   │       CitizenDashboard.jsx
                │   │       LiveQueueTracking.jsx
                │   │       NotificationsPanel.jsx
                │   │       QueueBookingPage.jsx
                │   │       
                │   └───shared
                │           QRVerificationPage.jsx
                │           
                ├───services
                │       api.js
                │       socket.js
                │       
                ├───store
                │   │   index.js
                │   │   
                │   └───slices
                │           authSlice.js
                │           otherSlices.js
                │           queueSlice.js
                │           
                ├───utils
                │       index.js
                │       
                └───{components
                    └───{ui,layout,charts},pages
                        └───{auth,citizen,admin,shared},store
                            └───{slices},hooks,services,utils,constants}
PS C:\Users\HP\Downloads\civicqueue-placement-ready (1)> 

I checked your tree output. The main problem is you are viewing node_modules also, so most of the output is useless for restructuring.

From the bottom part, I can identify your current structure:

civicqueue-placement-ready (1)
│
├── node_modules        ❌ (ignore, don't move)
│
├── public              ✅ Frontend
│
└── src                 ✅ Frontend React code
    ├── App.jsx
    ├── components
    ├── pages
    ├── services
    ├── store
    ├── hooks
    └── utils

This looks like your frontend root currently.

I don't see backend in this output, which means one of these is true:

    Backend is in another folder

    Backend is above this folder

    You are currently inside frontend folder

First check current location

Run:

pwd

Then:

dir

Send that output.
Your target structure should become:

Rename your current folder:

civicqueue-placement-ready (1)

to:

CivicQueue

Then:

CivicQueue
│
├── frontend
│   │
│   ├── public
│   ├── src
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
├── backend
│   │
│   ├── server.js
│   ├── package.json
│   ├── routes
│   ├── controllers
│   ├── models
│   ├── middleware
│   ├── config
│   └── .env
│
├── README.md
└── .gitignore

Important: Do NOT move these

Do not touch:

node_modules
package-lock.json inside node_modules
.vite
dist

node_modules will be regenerated.
First cleanup frontend

Inside current folder run:

rm -r node_modules

Then later reinstall:

npm install

This will reduce your repo size massively.
Also remove this suspicious folder

At the end:

src
 └── {components
       └── {ui,layout,charts}
       └── pages
       └── store
}

This is not a normal folder. It looks like a mistake created by AI/tool generation.

Delete:

src/{components

and everything inside that weird {} folder.

Your real folders are already:

src/components
src/pages
src/store
src/hooks
src/services

Next step

Run only these two commands from:

C:\Users\HP\Downloads\civicqueue-placement-ready (1)

and send me output:

dir

and

cd ..
dir

Then I will tell you exactly how to create backend and frontend folders without breaking your project.

  Directory: C:\Users\HP\Down
    loads\civicqueue-placement-
    ready (1)


Mode              LastWriteTime
----              -------------
d-----     14-07-2026     16:20


PS C:\Users\HP\Downloads\civicqueue-placement-ready (1)> 

Your output shows:

Directory: C:\Users\HP\Downloads\civicqueue-placement-ready (1)

Mode              LastWriteTime
----              -------------
d-----

It is only showing one directory, but not its name because PowerShell output is truncated. We need to see the actual contents.

Run this command:

Get-ChildItem -Force

or shorter:

dir -Force

You should see something like:

Mode       Name
----       ----
d-----     frontend
d-----     backend
-a----     package.json
-a----     README.md

Also run:

tree /A /F /L 2

This will show only 2 levels deep (not the huge node_modules output).

Example output we need:

civicqueue-placement-ready (1)
│
├── backend
│   ├── server.js
│   └── package.json
│
├── frontend
│   ├── src
│   └── package.json

From your previous output, I can already see your React frontend is present:

public/
src/
package.json
vite.config.js

Now we just need to locate your backend.

Don't move anything yet. First send the output of:

dir -Force

and

tree /A /F /L 2

Then I'll give exact commands to reorganize it.

give step by step

Okay. We will do it step-by-step and not break your project.

Currently you are inside:

C:\Users\HP\Downloads\civicqueue-placement-ready (1)

We will first identify the structure, then create frontend and backend.
Step 1: Check current files

Run:

dir -Force

You should see something like:

src
public
package.json
server.js
routes
models
...

Do not move anything yet.
Step 2: Create backup (important)

Go one level back:

cd ..

Copy the complete folder:

Copy-Item "civicqueue-placement-ready (1)" "civicqueue-backup" -Recurse

Now you have a backup.

Return:

cd "civicqueue-placement-ready (1)"

Step 3: Delete node_modules (recommended)

Your output contained a huge node_modules folder.

Delete it:

Remove-Item node_modules -Recurse -Force

Do not worry. We will reinstall later.
Step 4: Create main project folders

Create:

mkdir frontend
mkdir backend

Now:

civicqueue-placement-ready (1)

├── frontend
├── backend
├── src
├── public
├── package.json

Step 5: Move React frontend files

Move these into frontend:

Move-Item src frontend
Move-Item public frontend
Move-Item package.json frontend
Move-Item package-lock.json frontend
Move-Item vite.config.js frontend
Move-Item index.html frontend

After this:

CivicQueue

├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
└── backend

Step 6: Find backend files

Now run:

dir

You should see remaining backend files:

Example:

server.js
routes
controllers
models
middleware
config
package.json

Step 7: Move backend files

Move backend files:

Example:

Move-Item server.js backend
Move-Item routes backend
Move-Item controllers backend
Move-Item models backend
Move-Item middleware backend
Move-Item config backend

Also move backend package files:

Move-Item package.json backend
Move-Item package-lock.json backend

(Only if they belong to backend.)
Step 8: Final expected structure

Your project should look like:

CivicQueue
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
├── backend
│   ├── server.js
│   ├── routes
│   ├── controllers
│   ├── models
│   ├── middleware
│   └── package.json
│
├── README.md
└── .gitignore

Step 9: Reinstall dependencies

Frontend:

cd frontend
npm install

Backend:

cd ../backend
npm install

Step 10: Test

Backend:

cd backend
npm run dev

Frontend (new terminal):

cd frontend
npm run dev

⚠️ Important: Do not execute all steps blindly.
First execute Step 1 only:

dir -Force

Send me that output. I will tell you exactly which files are frontend and backend before you move anything. This avoids breaking your CivicQueue project.

PS C:\Users\HP\Downloads\civicqueue-placement-ready (1)> cd..
PS C:\Users\HP\Downloads> Copy-Item "civicqueue-placement-ready (1)" "civicqueue-backup" -Recurse
PS C:\Users\HP\Downloads> 
PS C:\Users\HP\Downloads> cd civicqueue-placement-ready(1)
Set-Location : A positional 
parameter cannot be found that 
accepts argument '1'.
At line:1 char:1
+ cd 
civicqueue-placement-ready(1)
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~
    + CategoryInfo          :  
   InvalidArgument: (:) [Set-  
  Location], ParameterBindin   
 gException
    + FullyQualifiedErrorId :  
   PositionalParameterNotFoun  
  d,Microsoft.PowerShell.Com   
 mands.SetLocationCommand
 
PS C:\Users\HP\Downloads> cd "civicqueue-placement-ready (1)"
PS C:\Users\HP\Downloads\civicqueue-placement-ready (1)> Remove-Item node_modules -Recurse -Force
Remove-Item : Cannot find path 
'C:\Users\HP\Downloads\civicque
ue-placement-ready 
(1)\node_modules' because it 
does not exist.
At line:1 char:1
+ Remove-Item node_modules 
-Recurse -Force
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~
    + CategoryInfo          :  
   ObjectNotFound: (C:\Users\  
  HP\Dow...1)\node_modules:S   
 tring) [Remove-Item], Item    
NotFoundException
    + FullyQualifiedErrorId :  
   PathNotFound,Microsoft.Pow  
  erShell.Commands.RemoveIte   
 mCommand
 
PS C:\Users\HP\Downloads\civicqueue-placement-ready (1)> Remove-Item node_modules -Recurse -Force
Remove-Item : Cannot find path 
'C:\Users\HP\Downloads\civicque
ue-placement-ready 
(1)\node_modules' because it 
does not exist.
At line:1 char:1
+ Remove-Item node_modules 
-Recurse -Force
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~
    + CategoryInfo          :  
   ObjectNotFound: (C:\Users\  
  HP\Dow...1)\node_modules:S   
 tring) [Remove-Item], Item    
NotFoundException
    + FullyQualifiedErrorId :  
   PathNotFound,Microsoft.Pow  
  erShell.Commands.RemoveIte   
 mCommand
 
PS C:\Users\HP\Downloads\civicqueue-placement-ready (1)> mkdir frontend


    Directory: C:\Users\HP\Down
    loads\civicqueue-placement-
    ready (1)


Mode              LastWriteTime
----              -------------
d-----     14-07-2026     17:39


PS C:\Users\HP\Downloads\civicqueue-placement-ready (1)> mkdir backend


    Directory: C:\Users\HP\Down
    loads\civicqueue-placement-
    ready (1)


Mode              LastWriteTime
----              -------------
d-----     14-07-2026     17:40


PS C:\Users\HP\Downloads\civicqueue-placement-ready (1)> Move-Item src frontend
Move-Item : Cannot find path 'C
:\Users\HP\Downloads\civicqueue
-placement-ready (1)\src' 
because it does not exist.
At line:1 char:1
+ Move-Item src frontend
+ ~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          :  
   ObjectNotFound: (C:\Users\  
  HP\Dow...t-ready (1)\src:S   
 tring) [Move-Item], ItemNo    
tFoundException
    + FullyQualifiedErrorId :  
   PathNotFound,Microsoft.Pow  
  erShell.Commands.MoveItemC   
 ommand
 
PS C:\Users\HP\Downloads\civicqueue-placement-ready (1)> Move-Item public frontend
Move-Item : Cannot find path 'C
:\Users\HP\Downloads\civicqueue
-placement-ready (1)\public' 
because it does not exist.
At line:1 char:1
+ Move-Item public frontend
+ ~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          :  
   ObjectNotFound: (C:\Users\  
  HP\Dow...eady (1)\public:S   
 tring) [Move-Item], ItemNo    
tFoundException
    + FullyQualifiedErrorId :  
   PathNotFound,Microsoft.Pow  
  erShell.Commands.MoveItemC   
 ommand
 
PS C:\Users\HP\Downloads\civicqueue-placement-ready (1)> Move-Item package.json frontend
Move-Item : Cannot find path 'C
:\Users\HP\Downloads\civicqueue
-placement-ready 
(1)\package.json' because it 
does not exist.
At line:1 char:1
+ Move-Item package.json 
frontend
+ 
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          :  
   ObjectNotFound: (C:\Users\  
  HP\Dow...1)\package.json:S   
 tring) [Move-Item], ItemNo    
tFoundException
    + FullyQualifiedErrorId :  
   PathNotFound,Microsoft.Pow  
  erShell.Commands.MoveItemC   
 ommand
 
PS C:\Users\HP\Downloads\civicqueue-placement-ready (1)> Move-Item package-lock.json frontend
Move-Item : Cannot find path 'C
:\Users\HP\Downloads\civicqueue
-placement-ready 
(1)\package-lock.json' because 
it does not exist.
At line:1 char:1
+ Move-Item package-lock.json 
frontend
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~
    + CategoryInfo          :  
   ObjectNotFound: (C:\Users\  
  HP\Dow...ckage-lock.json:S   
 tring) [Move-Item], ItemNo    
tFoundException
    + FullyQualifiedErrorId :  
   PathNotFound,Microsoft.Pow  
  erShell.Commands.MoveItemC   
 ommand
 
PS C:\Users\HP\Downloads\civicqueue-placement-ready (1)> Move-Item vite.config.js frontend
Move-Item : Cannot find path 'C
:\Users\HP\Downloads\civicqueue
-placement-ready 
(1)\vite.config.js' because it 
does not exist.
At line:1 char:1
+ Move-Item vite.config.js 
frontend
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~
    + CategoryInfo          :  
   ObjectNotFound: (C:\Users\  
  HP\Dow...\vite.config.js:S   
 tring) [Move-Item], ItemNo    
tFoundException
    + FullyQualifiedErrorId :  
   PathNotFound,Microsoft.Pow  
  erShell.Commands.MoveItemC   
 ommand
 
PS C:\Users\HP\Downloads\civicqueue-placement-ready (1)> Move-Item index.html frontend
Move-Item : Cannot find path 'C
:\Users\HP\Downloads\civicqueue
-placement-ready 
(1)\index.html' because it 
does not exist.
At line:1 char:1
+ Move-Item index.html frontend
+ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          :  
   ObjectNotFound: (C:\Users\  
  HP\Dow... (1)\index.html:S   
 tring) [Move-Item], ItemNo    
tFoundException
    + FullyQualifiedErrorId :  
   PathNotFound,Microsoft.Pow  
  erShell.Commands.MoveItemC   
 ommand
 

Good. You did the backup correctly ✅.

The errors happened because your project files are not directly inside:

civicqueue-placement-ready (1)

Your earlier tree output showed src, public, etc., but that was probably inside a subfolder. Now we need to locate that folder.

Do not move anything more yet.
Step 1: Check current folder

You are here:

C:\Users\HP\Downloads\civicqueue-placement-ready (1)

Run:

dir -Force

Send me the output.

Most likely you have something like:

civicqueue-placement-ready (1)
│
└── civicqueue-placement-ready
    │
    ├── src
    ├── public
    ├── package.json

or:

civicqueue-placement-ready (1)
│
└── frontend
    ├── src

Why your commands failed

Example:

Move-Item src frontend

failed because PowerShell searched:

C:\Users\HP\Downloads\civicqueue-placement-ready (1)\src

but src is not there.
Also check one level deeper

Run:

tree /A /L 2

This will show only the first 2 levels and avoid the huge node_modules output.

Expected output:

civicqueue-placement-ready (1)
│
└── some-folder-name
    ├── src
    ├── public
    └── package.json

Send both outputs:

dir -Force

tree /A /L 2

Then I will give the exact Move-Item commands for your actual structure. Don't run more move commands until then.

    loads\civicqueue-placement-
    ready (1)


Mode              LastWriteTime
----              -------------
d-----     14-07-2026     17:40
d-----     14-07-2026     16:20
d-----     14-07-2026     17:39


PS C:\Users\HP\Downloads\civicqueue-placement-ready (1)> 

Good. Now we know something important:

Your folder contains only 3 directories. There are no files like src, package.json, etc. at this level.

The three directories are likely:

    backup folder we created

    frontend folder we created

    original project folder

PowerShell is hiding names because of your terminal width.

Run this exact command:

Get-ChildItem -Directory | Select-Object Name

You will get:

Example:

Name
----
civicqueue-backup
frontend
civicqueue-placement-ready

After you get the names, we will do the next step.

Most likely your structure is currently:

Downloads
│
└── civicqueue-placement-ready (1)
    │
    ├── civicqueue-backup        (backup)
    │
    ├── frontend                 (empty folder we created)
    │
    └── civicqueue-placement-ready   ← actual project
        │
        ├── src
        ├── public
        ├── package.json
        └── backend files

We need to enter the actual project folder:

cd "actual-folder-name"

Then we will move files.

Run:

Get-ChildItem -Directory | Select-Object Name

and send the output.



    Directory: C:\Users\HP\Down
    loads\civicqueue-placement-
    ready (1)


Mode              LastWriteTime
----              -------------
d-----     14-07-2026     17:40
d-----     14-07-2026     16:20
d-----     14-07-2026     17:39


PS C:\Users\HP\Downloads\civicqueue-placement-ready (1)> Get-ChildItem -Directory | Select-Object Name

Name               
----               
backend            
civicqueue-upgraded
frontend           


PS C:\Users\HP\Downloads\civicqueue-placement-ready (1)> 

Great. Now the structure is clear ✅

Currently you have:

civicqueue-placement-ready (1)
│
├── backend              ← empty folder we created
├── frontend             ← empty folder we created
└── civicqueue-upgraded  ← YOUR ACTUAL PROJECT

Your React files (src, public, package.json) are inside:

civicqueue-upgraded

Now we need to move from there.
Step 1: Enter actual project folder

Run:

cd civicqueue-upgraded

Now check:

dir

You should see something like:

src
public
package.json
server.js
...

Step 2: Check what is inside

Run:

tree /A /L 2

This will show:

    frontend files

    backend files

    current structure

⚠️ Do not run any Move-Item commands yet.

Send me the output of:

dir

from inside civicqueue-upgraded.

Then I will tell you exactly what to move into your already-created frontend and backend folders.




    Directory: C:\Users\HP\Down
    loads\civicqueue-placement-
    ready (1)


Mode              LastWriteTime
----              -------------
d-----     14-07-2026     17:40
d-----     14-07-2026     16:20
d-----     14-07-2026     17:39


PS C:\Users\HP\Downloads\civicqueue-placement-ready (1)> Get-ChildItem -Directory | Select-Object Name

Name               
----               
backend            
civicqueue-upgraded
frontend           


PS C:\Users\HP\Downloads\civicqueue-placement-ready (1)> cd civicqueue-upgraded
PS C:\Users\HP\Downloads\civicqueue-placement-ready (1)\civicqueue-upgraded> dir


    Directory: C:\Users\HP\Down
    loads\civicqueue-placement-
    ready 
    (1)\civicqueue-upgraded


Mode              LastWriteTime
----              -------------
d-----     14-07-2026     16:22
d-----     14-07-2026     16:20
-a----     14-07-2026     16:20
-a----     14-07-2026     16:20


PS C:\Users\HP\Downloads\civicqueue-placement-ready (1)\civicqueue-upgraded> 

Good. Now we are inside the actual project folder:

C:\Users\HP\Downloads\civicqueue-placement-ready (1)\civicqueue-upgraded

Your dir output is again hiding names because the terminal width is small. It shows:

Mode
----
d----- 
d-----
-a----
-a----

So there are 2 folders + 2 files here.

Now we need the actual names.

Run:

Get-ChildItem | Select-Object Name

You should get something like:

Name
----
backend
frontend
package.json
README.md

or:

Name
----
client
server
package.json
package-lock.json

After that, run:

tree /A /L 2

Do not move anything yet.

Once I see the names, I will give exact commands like:

Move-Item "something" "..\frontend"

or

Move-Item "something" "..\backend"

so your final structure becomes:

civicqueue-placement-ready (1)
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── backend
│   ├── server.js
│   ├── routes
│   ├── models
│   └── package.json
│
└── README.md

Run:

Get-ChildItem | Select-Object Name

and send the output.

give step by step deployment

Okay. Since you want to deploy your MERN CivicQueue project now, we will follow a clean deployment process. We will not add new features. We will first make the current version deployable.

Your deployment architecture:

CivicQueue
│
├── frontend  → Vercel
│
└── backend   → Render
                 |
                 MongoDB Atlas

PHASE 1 — Prepare Project Structure
Step 1: Final folder structure

Your GitHub repository should become:

CivicQueue/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── .env
│
├── README.md
└── .gitignore

First complete this.
PHASE 2 — Prepare Backend

Go inside backend:

cd backend

Install dependencies:

npm install

Step 2: Update backend server.js

Change:

server.listen(5000)

to:

const PORT = process.env.PORT || 5000;

server.listen(PORT,()=>{
 console.log(`Server running on ${PORT}`);
});

Step 3: Create backend .env

Inside:

backend/.env

Add:

PORT=5000

MONGO_URI=your_mongodb_atlas_connection

JWT_SECRET=your_secret

CLIENT_URL=https://your-frontend-url.vercel.app

Step 4: Add .gitignore

Backend:

node_modules
.env

PHASE 3 — Setup MongoDB Atlas

Go to:

MongoDB Atlas

Create:

    Free Cluster

    Database User

    Network Access

Allow:

0.0.0.0/0

Copy connection string:

Example:

mongodb+srv://username:password@cluster.mongodb.net/civicqueue

Put it in:

MONGO_URI

PHASE 4 — Test Backend Locally

Run:

npm run dev

Expected:

Server running on 5000
MongoDB Connected

Test:

http://localhost:5000

or your API endpoint.
PHASE 5 — Push to GitHub

From project root:

git add .
git commit -m "Prepare CivicQueue for deployment"
git push origin main

PHASE 6 — Deploy Backend on Render

Go to:

Render

Steps:

Dashboard
    |
New
    |
Web Service

Connect GitHub repository.

Settings:
Root Directory

If your repo:

CivicQueue
 ├── backend
 └── frontend

Set:

backend

Build Command:

npm install

Start Command:

npm start

Add Environment Variables:

PORT
MONGO_URI
JWT_SECRET
CLIENT_URL

Deploy.

You get:

Example:

https://civicqueue-backend.onrender.com

Save this.
PHASE 7 — Prepare Frontend

Go:

cd frontend

Install:

npm install

Step 1: Update API URL

Find:

src/services/api.js

Change:

Before:

baseURL:"http://localhost:5000"

After:

baseURL:
import.meta.env.VITE_API_URL

Step 2: Create frontend .env

frontend/.env

Add:

VITE_API_URL=https://civicqueue-backend.onrender.com

PHASE 8 — Fix CORS

Backend:

app.use(
cors({
origin:[
"http://localhost:5173",
"https://your-vercel-url.vercel.app"
],
credentials:true
})
)

Socket.IO:

const io = new Server(server,{
cors:{
origin:[
"http://localhost:5173",
"https://your-vercel-url.vercel.app"
],
credentials:true
}
});

PHASE 9 — Deploy Frontend

Go to:

Vercel

Steps:

New Project
     |
Import GitHub Repo

Settings:

Framework:

Vite

Root Directory:

frontend

Build command:

npm run build

Output:

dist

Add Environment Variable:

VITE_API_URL

Value:

https://civicqueue-backend.onrender.com

Deploy.
PHASE 10 — Final Testing

Check:
Citizen

✅ Register
✅ Login
✅ Book appointment
✅ View queue
Staff

✅ Login
✅ See appointments
✅ Update token
Admin

✅ Dashboard
✅ Manage staff
Real-time

✅ Socket connection
PHASE 11 — Update README

Add:

## Live Demo

Frontend:
https://your-vercel-url.vercel.app

Backend:
https://civicqueue-backend.onrender.com


## Features

- JWT Authentication
- Role Based Access
- Real Time Queue Updates
- Admin Dashboard
- Staff Dashboard
- Citizen Booking System

Follow this order:

1. Folder structure → 2. Backend deploy → 3. Frontend deploy → 4. Connect APIs → 5. Test

Do not deploy before your folder structure is fixed. Your current project still needs that step first.

PS C:\Users\HP\Downloads\civicqueue> git status
fatal: not a git repository (or any of the parent directories): .git
PS C:\Users\HP\Downloads\civicqueue>

This error means your current folder:

C:\Users\HP\Downloads\civicqueue

is not connected to Git yet. There is no .git folder inside it.

We will set it up step-by-step.
Step 1: Check your current project files

Run:

dir -Force

You should see something like:

backend
frontend
README.md

Confirm you are inside the correct CivicQueue project folder.
Step 2: Initialize Git

Run:

git init

Expected:

Initialized empty Git repository in ...

Step 3: Create .gitignore

Create:

notepad .gitignore

Add:

# dependencies
node_modules/

# environment files
.env

# build files
dist/

# logs
*.log

# OS files
.DS_Store

Save and close.
Step 4: Check status

Run:

git status

Now you should see your files:

Untracked files:
 backend/
 frontend/
 README.md
 .gitignore

Step 5: Add files

Run:

git add .

Step 6: First commit

Run:

git commit -m "Initial CivicQueue project setup"

Step 7: Connect GitHub repository

If you already created a GitHub repo:

Example:

https://github.com/Samruddhi-techenthusiast/CivicQueue

Run:

git remote add origin https://github.com/Samruddhi-techenthusiast/CivicQueue.git

Check:

git remote -v

Step 8: Push

For first push:

git branch -M main

Then:

git push -u origin main

After this your repository will be ready for:

    Render backend deployment

    Vercel frontend deployment

Before running git init, send me the output of:

dir -Force

from:

C:\Users\HP\Downloads\civicqueue

I want to confirm this is the correct final project folder and not an empty folder.

t time Git touches it
warning: in the working copy of 'frontend/src/components/ui/Modal.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/components/ui/index.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/constants/index.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/hooks/index.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/hooks/useQueueData.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/index.css', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/main.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/pages/LandingPage.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/pages/admin/AdminDashboard.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/pages/admin/AnalyticsDashboard.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/pages/admin/DepartmentManagement.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/pages/admin/StaffAppointments.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/pages/admin/StaffDashboard.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/pages/admin/StaffPerformance.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/pages/admin/UserManagement.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/pages/auth/LoginPage.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/pages/auth/RegisterPage.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/pages/citizen/AppointmentHistory.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/pages/citizen/CitizenDashboard.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/pages/citizen/LiveQueueTracking.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/pages/citizen/NotificationsPanel.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/pages/citizen/QueueBookingPage.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/pages/shared/QRVerificationPage.jsx', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/services/api.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/services/socket.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/store/index.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/store/slices/authSlice.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/store/slices/otherSlices.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/store/slices/queueSlice.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/src/utils/index.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/tailwind.config.js', LF will be replaced by CRLF the next time Git touches it
warning: in the working copy of 'frontend/vite.config.js', LF will be replaced by CRLF the next time Git touches it
PS C:\Users\HP\Downloads\civicqueue> git remote add origin https://github.com/Samruddhi-techenthusiast/Civicqueue-pro.git
error: remote origin already exists.
PS C:\Users\HP\Downloads\civicqueue> git remote -v
origin  https://github.com/Samruddhi-techenthusiast/Civicqueue-pro.git (fetch)
origin  https://github.com/Samruddhi-techenthusiast/Civicqueue-pro.git (push)
PS C:\Users\HP\Downloads\civicqueue> git branch -M main
PS C:\Users\HP\Downloads\civicqueue> git push -u origin main
error: src refspec main does not match any
error: failed to push some refs to 'https://github.com/Samruddhi-techenthusiast/Civicqueue-pro.git'
PS C:\Users\HP\Downloads\civicqueue> 

Good progress. Your Git is almost ready. The issue is simple:

error: src refspec main does not match any

means you have not created your first commit yet.

git push can only push commits. Currently, files are staged but there is no commit.
Step 1: Check status

Run:

git status

You will probably see:

Changes to be committed:
  frontend/...
  backend/...

Step 2: Create first commit

Run:

git commit -m "Initial CivicQueue project setup"

Wait until you see something like:

[main xxxxxxx] Initial CivicQueue project setup
 xxx files changed

Step 3: Confirm branch

Run:

git branch

Expected:

* main

Step 4: Push again

Now run:

git push -u origin main

It should work.
About LF → CRLF warnings

Example:

warning: LF will be replaced by CRLF

✅ Ignore these.

This happens because:

    Your files use Linux-style line endings (LF)

    Windows uses CRLF

It does not break your React or Node project.
One more thing

Your remote is already correct:

origin https://github.com/Samruddhi-techenthusiast/Civicqueue-pro.git

So do NOT run:

git remote add origin ...

again.

Your exact next commands:

git commit -m "Initial CivicQueue project setup"
git push -u origin main

After push completes, we will prepare Render backend deployment.

s
 create mode 100644 frontend/src/utils/index.js
 create mode 100644 frontend/tailwind.config.js
 create mode 100644 frontend/vite.config.js
PS C:\Users\HP\Downloads\civicqueue> git push -u origin main
To https://github.com/Samruddhi-techenthusiast/Civicqueue-pro.git
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'https://github.com/Samruddhi-techenthusiast/Civicqueue-pro.git'
hint: Updates were rejected because the remote contains work that you do not
hint: have locally. This is usually caused by another repository pushing to
hint: the same ref. If you want to integrate the remote changes, use
hint: 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
PS C:\Users\HP\Downloads\civicqueue> 

Great, your first commit is successful ✅

Now the issue changed:

! [rejected] main -> main (fetch first)

Meaning:

Your GitHub repository:

Civicqueue-pro

already has some commits/files on main (probably your previous CivicQueue version).

Your local project and GitHub repo have different histories.

You have two options:
Option 1 (Recommended for your case): Replace GitHub repo with this cleaned structure

Since you created a cleaner deployment-ready structure and want this version on GitHub, use force push.

⚠️ This will replace the existing GitHub main branch with your current local project.

Run:

git push -u origin main --force

After completion:

Everything should be updated on GitHub

Your repo will become:

Civicqueue-pro
│
├── backend
├── frontend
├── README.md
└── .gitignore

Option 2: Keep old GitHub history

If you want to preserve previous commits:

git pull origin main --allow-unrelated-histories

Resolve conflicts if any:

git add .
git commit -m "Merge old repository history"
git push origin main

For your situation, I recommend Option 1 because:

    You created a deployment-ready structure

    You are preparing for Render + Vercel

    Your old repo likely contains the unorganized version

    Clean GitHub repo looks better for interviews

Run:

git push -u origin main --force

After it finishes, check your GitHub repository and confirm that backend and frontend folders are visible. Then we will move to Render backend deployment.

but if i replaced previous commits will not remain so i use 2 nd option 

Yes, if you use:

git push -u origin main --force

your previous GitHub main branch history will be replaced. The old commits will no longer appear in the normal branch history. Since you want to preserve your previous commits, use Option 2.

Follow these steps carefully:
Step 1: Pull existing GitHub history

Run:

git pull origin main --allow-unrelated-histories

This tells Git:

    "My local repository and GitHub repository are separate histories. Combine them."

Step 2: If there are conflicts

You may see something like:

CONFLICT (add/add): Merge conflict

Check:

git status

If conflicts appear, send me that output. We will resolve them.
Step 3: If no conflicts

Git will create a merge commit automatically.

Then run:

git push origin main

Step 4: Verify

Open GitHub:

https://github.com/Samruddhi-techenthusiast/Civicqueue-pro

You should see:

main
 |
 ├── old commits ✅
 |
 └── new deployment structure commit ✅

One suggestion for your case: since this repo already had CivicQueue work, preserving history is better. Interviewers can see your development journey:

    initial implementation

    feature additions

    bug fixes

    deployment preparation

So use the second option.

Run:

git pull origin main --allow-unrelated-histories

and send the output if Git shows any conflict.

now give all deployments steps

Now that your GitHub repository is ready and history is preserved, we will deploy your CivicQueue MERN project step-by-step.

Final deployment architecture:

GitHub Repository
        |
        |
   ----------------
   |              |
Backend        Frontend
Render         Vercel
   |
MongoDB Atlas

PART 1 — Prepare Backend for Deployment
Step 1: Go to backend folder

From project root:

cd backend

Check:

dir

You should see:

server.js
package.json
routes
controllers
models
middleware

Step 2: Install dependencies

npm install

Step 3: Check backend package.json

Open:

backend/package.json

Make sure scripts contain:

{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}

Render uses:

npm start

PART 2 — MongoDB Atlas Setup

Local MongoDB will not work on Render.

Go to:

MongoDB Atlas
Step 4: Create Database

Create:

Free Cluster

Step 5: Create Database User

Example:

Username:
civicqueue_user

Password:
********

Save these credentials.
Step 6: Allow Network Access

Go:

Security
   |
Network Access

Add:

0.0.0.0/0

Step 7: Get Connection String

Example:

mongodb+srv://username:password@cluster.mongodb.net/civicqueue

Save it.
PART 3 — Backend Environment Variables

Create:

backend/.env

Add:

PORT=5000

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/civicqueue

JWT_SECRET=your_secret_key

CLIENT_URL=https://your-vercel-app.vercel.app

Step 8: Update .gitignore

Backend:

node_modules
.env

Check:

git status

.env should NOT appear.
PART 4 — Fix Backend for Render
Step 9: Update server.js

Find:

server.listen(5000)

Change to:

const PORT = process.env.PORT || 5000;

server.listen(PORT,()=>{
 console.log(`Server running on ${PORT}`);
});

Step 10: Fix CORS

Backend:

app.use(
cors({
origin:[
"http://localhost:5173",
process.env.CLIENT_URL
],
credentials:true
})
);

Step 11: Test Backend Locally

Run:

npm run dev

Expected:

Server running on 5000
MongoDB connected

PART 5 — Deploy Backend on Render

Go:

Render
Step 12: Create Web Service

Choose:

New +
 |
Web Service

Connect:

GitHub
 |
Civicqueue-pro

Step 13: Render Settings
Name

civicqueue-backend

Root Directory

Important:

backend

Environment

Node

Build Command

npm install

Start Command

npm start

Step 14: Add Environment Variables

Add:

PORT
MONGO_URI
JWT_SECRET
CLIENT_URL

Deploy.

After successful deployment you get:

Example:

https://civicqueue-backend.onrender.com

Save this URL.
PART 6 — Prepare Frontend

Go:

cd ../frontend

Install:

npm install

Step 15: Update API URL

Open:

frontend/src/services/api.js

Change:

Before:

baseURL:"http://localhost:5000"

After:

baseURL: import.meta.env.VITE_API_URL

Step 16: Update Socket URL

Open:

frontend/src/services/socket.js

Change:

Before:

io("http://localhost:5000")

After:

io(import.meta.env.VITE_API_URL)

Step 17: Create Frontend Environment

Create:

frontend/.env

Add:

VITE_API_URL=https://civicqueue-backend.onrender.com

PART 7 — Deploy Frontend on Vercel

Go:

Vercel
Step 18: Import Project

Select:

Add New Project

Choose:

Civicqueue-pro

Step 19: Configure

Framework:

Vite

Root Directory:

frontend

Build Command:

npm run build

Output:

dist

Step 20: Add Environment Variable

In Vercel:

Settings
 |
Environment Variables

Add:

VITE_API_URL

value:
https://civicqueue-backend.onrender.com

Deploy.

You will get:

https://civicqueue.vercel.app

PART 8 — Connect Frontend URL Back to Backend

Go back to Render.

Environment variable:

Update:

CLIENT_URL=https://civicqueue.vercel.app

Restart backend.
PART 9 — Final Testing
Citizen

✅ Register
✅ Login
✅ Book appointment
✅ View queue
Staff

✅ Login
✅ View appointments
✅ Call next token
Admin

✅ Login
✅ Manage staff
✅ Manage departments
Real-time

Check browser console:

Socket Connected: xxxx

PART 10 — Final Git Commit

After deployment changes:

git add .
git commit -m "Deploy CivicQueue MERN application"
git push origin main

Your final resume links:

Frontend:
https://civicqueue.vercel.app

Backend:
https://civicqueue-backend.onrender.com

GitHub:
https://github.com/Samruddhi-techenthusiast/Civicqueue-pro

Follow this order exactly:

MongoDB Atlas → Backend Render → Frontend Vercel → Connect URLs → Test.

             18:15
-a----  14-07-2026
             16:20
-a----  14-07-2026
             16:20
-a----  14-07-2026
             18:15
-a----  14-07-2026
             18:15
-a----  14-07-2026
             16:20
-a----  14-07-2026
             18:15


PS C:\Users\HP\Downloads\civicqueue\backend> npm install
npm ERR! code EJSONPARSE
npm ERR! path C:\Users\HP\Downloads\civicqueue\backend/package.json
npm ERR! JSON.parse Expected property name or '}' in JSON at position 3 (line 2 column 1) while parsing near "{\r\n<<<<<<< HEAD\r\n  \"nam..."
npm ERR! JSON.parse Failed to parse JSON data.
npm ERR! JSON.parse Note: package.json must be actual JSON, not just JavaScript.

npm ERR! A complete log of this run can be found in: C:\Users\HP\AppData\Local\npm-cache\_logs\2026-07-14T12_49_06_016Z-debug-0.log
PS C:\Users\HP\Downloads\civicqueue\backend> npm install
npm ERR! code EJSONPARSE
npm ERR! path C:\Users\HP\Downloads\civicqueue\backend/package.json
npm ERR! JSON.parse Expected property name or '}' in JSON at position 3 (line 2 column 1) while parsing near "{\r\n<<<<<<< HEAD\r\n  \"nam..."
npm ERR! JSON.parse Failed to parse JSON data.
npm ERR! JSON.parse Note: package.json must be actual JSON, not just JavaScript.

npm ERR! A complete log of this run can be found in: C:\Users\HP\AppData\Local\npm-cache\_logs\2026-07-14T12_49_58_892Z-debug-0.log
PS C:\Users\HP\Downloads\civ

Your deployment is blocked because you have a Git merge conflict in backend/package.json.

The important part is:

JSON.parse Expected property name or '}'
while parsing near "{\r\n<<<<<<< HEAD\r\n  \"nam..."

This means your package.json contains Git conflict markers:

<<<<<<< HEAD
...
=======
...
>>>>>>> origin/main

npm install cannot read this because it is not valid JSON.
Step 1: Open backend/package.json

Run:

notepad package.json

You will see something like:

<<<<<<< HEAD
{
  "name": "backend",
  ...
}
=======
{
  "name": "server",
  ...
}
>>>>>>> origin/main

Step 2: Remove conflict markers

Delete these lines:

<<<<<<< HEAD
=======
>>>>>>> origin/main

Keep only the correct package.json content.

Example final should look like:

{
  "name": "civicqueue-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "...",
    "mongoose": "...",
    "socket.io": "..."
  }
}

Save the file.
Step 3: Check if other conflicts exist

From:

C:\Users\HP\Downloads\civicqueue\backend

go to project root:

cd ..

Check:

git status

You may see:

both modified:
 backend/package.json

or other files.
Step 4: Search all conflict markers

Run from project root:

findstr /S /N "<<<<<<<" *

This will show all files containing conflicts.

Example:

backend/package.json:2:<<<<<<< HEAD
backend/server.js:45:<<<<<<< HEAD

Fix every file shown.
Step 5: Mark conflicts resolved

After fixing:

git add .

Then:

git commit -m "Resolve merge conflicts"

Step 6: Try npm install again

Go backend:

cd backend
npm install

It should now work.
Why this happened

Earlier you chose:

git pull origin main --allow-unrelated-histories

Git merged your old GitHub project + new cleaned project. During merge, it inserted conflict markers.

Before deployment, all conflicts must be removed.

First run:

findstr /S /N "<<<<<<<" *

from:

C:\Users\HP\Downloads\civicqueue

Send me the output. I will tell you exactly which files to fix.

{

  "name": "civicqueue",
  "version": "1.0.0",
  "description": "Smart queue management system for government/public offices",
  "main": "src/server.js",

  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "lint": "eslint src/",
    "test": "jest --coverage"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "compression": "^1.7.4",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-mongo-sanitize": "^2.2.0",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "ioredis": "^5.3.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.3",
    "morgan": "^1.10.0",
    "multer": "^2.2.0",
    "nodemailer": "^6.9.7",
    "qrcode": "^1.5.3",
    "redis": "^4.6.11",
    "socket.io": "^4.6.1",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0",
    "uuid": "^9.0.1",
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^4.7.1",
    "xss-clean": "^0.1.4"
  },
  "devDependencies": {
    "eslint": "^8.55.0",
    "jest": "^29.7.0",
    "mongodb-memory-server": "^9.1.6",
    "nodemon": "^3.0.2",
    "supertest": "^6.3.3"
  },
  "jest": {
    "testEnvironment": "node",
    "testTimeout": 30000,
    "testPathIgnorePatterns": [
      "/node_modules/",
      "/tests/setup.js"
    ]

  "name": "backend",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Samruddhi",
  "license": "ISC",
  "keywords": [],
  "description": "",
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.6",
    "dotenv": "^17.2.3",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mongoose": "^9.1.5",
    "node-cron": "^4.2.1",
    "socket.io": "^4.8.3"

  }
}

Your package.json is still merged incorrectly. You have two package.json files combined into one.

The problem starts here:

"testPathIgnorePatterns": [
  "/node_modules/",
  "/tests/setup.js"
]

  "name": "backend",

After the first JSON object starts closing, another JSON object begins. A JSON file can have only one root object.

Since your project is the CivicQueue upgraded backend, keep the first package configuration because it has all your required dependencies:

✅ socket.io
✅ redis
✅ swagger
✅ helmet
✅ winston
✅ multer
✅ nodemailer
✅ security packages

Remove the second "name": "backend" section completely.
Replace your entire backend/package.json with this:

{
  "name": "civicqueue",
  "version": "1.0.0",
  "description": "Smart queue management system for government/public offices",
  "main": "src/server.js",

  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "lint": "eslint src/",
    "test": "jest --coverage"
  },

  "dependencies": {
    "bcryptjs": "^2.4.3",
    "compression": "^1.7.4",
    "cookie-parser": "^1.4.6",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "express-mongo-sanitize": "^2.2.0",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "helmet": "^7.1.0",
    "ioredis": "^5.3.2",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.3",
    "morgan": "^1.10.0",
    "multer": "^2.2.0",
    "nodemailer": "^6.9.7",
    "qrcode": "^1.5.3",
    "redis": "^4.6.11",
    "socket.io": "^4.6.1",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0",
    "uuid": "^9.0.1",
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^4.7.1",
    "xss-clean": "^0.1.4"
  },

  "devDependencies": {
    "eslint": "^8.55.0",
    "jest": "^29.7.0",
    "mongodb-memory-server": "^9.1.6",
    "nodemon": "^3.0.2",
    "supertest": "^6.3.3"
  },

  "jest": {
    "testEnvironment": "node",
    "testTimeout": 30000,
    "testPathIgnorePatterns": [
      "/node_modules/",
      "/tests/setup.js"
    ]
  }
}

Now save the file.

Then run:

npm install

You should get:

added xxx packages
audited xxx packages

After npm install succeeds:

Go back to project root:

cd ..

Check Git:

git status

Then commit the conflict fix:

git add backend/package.json
git commit -m "Fix backend package json merge conflict"

Next check

After npm install succeeds, run:

npm start

from backend.

Expected:

Server running on port 5000
MongoDB connected
Socket.io initialized

If you get an error after npm start, send that output. We will fix backend before deploying to Render.

aw-body/index.d.ts
        modified:   backend/node_modules/raw-body/index.js
        modified:   backend/node_modules/raw-body/package.json
        deleted:    backend/node_modules/router/HISTORY.md
        deleted:    backend/node_modules/router/LICENSE
        deleted:    backend/node_modules/router/README.md
        deleted:    backend/node_modules/router/index.js
        deleted:    backend/node_modules/router/lib/layer.js
        deleted:    backend/node_modules/router/lib/route.js
        deleted:    backend/node_modules/router/package.json
        modified:   backend/node_modules/safer-buffer/LICENSE
        modified:   backend/node_modules/safer-buffer/Porting-Buffer.md
        modified:   backend/node_modules/safer-buffer/Readme.md
        modified:   backend/node_modules/safer-buffer/dangerous.js
        modified:   backend/node_modules/safer-buffer/package.json
        modified:   backend/node_modules/safer-buffer/safer.js
        modified:   backend/node_modules/safer-buffer/tests.js
        deleted:    backend/node_modules/semver/LICENSE
        deleted:    backend/node_modules/semver/README.md
        deleted:    backend/node_modules/semver/bin/semver.js
        deleted:    backend/node_modules/semver/classes/comparator.js
        deleted:    backend/node_modules/semver/classes/index.js
        deleted:    backend/node_modules/semver/classes/range.js
        deleted:    backend/node_modules/semver/classes/semver.js
        deleted:    backend/node_modules/semver/functions/clean.js
        deleted:    backend/node_modules/semver/functions/cmp.js
        deleted:    backend/node_modules/semver/functions/coerce.js
        deleted:    backend/node_modules/semver/functions/compare-build.js
        deleted:    backend/node_modules/semver/functions/compare-loose.js
        deleted:    backend/node_modules/semver/functions/compare.js
        deleted:    backend/node_modules/semver/functions/diff.js
        deleted:    backend/node_modules/semver/functions/eq.js
        deleted:    backend/node_modules/semver/functions/gt.js
        deleted:    backend/node_modules/semver/functions/gte.js
        deleted:    backend/node_modules/semver/functions/inc.js
        deleted:    backend/node_modules/semver/functions/lt.js
        deleted:    backend/node_modules/semver/functions/lte.js
        deleted:    backend/node_modules/semver/functions/major.js
        deleted:    backend/node_modules/semver/functions/minor.js
        deleted:    backend/node_modules/semver/functions/neq.js
        deleted:    backend/node_modules/semver/functions/parse.js
        deleted:    backend/node_modules/semver/functions/patch.js
        deleted:    backend/node_modules/semver/functions/prerelease.js
        deleted:    backend/node_modules/semver/functions/rcompare.js
        deleted:    backend/node_modules/semver/functions/rsort.js
        deleted:    backend/node_modules/semver/functions/satisfies.js
        deleted:    backend/node_modules/semver/functions/sort.js
        deleted:    backend/node_modules/semver/functions/valid.js
        deleted:    backend/node_modules/semver/index.js
        deleted:    backend/node_modules/semver/internal/constants.js
        deleted:    backend/node_modules/semver/internal/debug.js
        deleted:    backend/node_modules/semver/internal/identifiers.js
        deleted:    backend/node_modules/semver/internal/lrucache.js
        deleted:    backend/node_modules/semver/internal/parse-options.js
        deleted:    backend/node_modules/semver/internal/re.js
        deleted:    backend/node_modules/semver/package.json
        deleted:    backend/node_modules/semver/preload.js
        deleted:    backend/node_modules/semver/range.bnf
        deleted:    backend/node_modules/semver/ranges/gtr.js
        deleted:    backend/node_modules/semver/ranges/intersects.js
        deleted:    backend/node_modules/semver/ranges/ltr.js
        deleted:    backend/node_modules/semver/ranges/max-satisfying.js
        deleted:    backend/node_modules/semver/ranges/min-satisfying.js
        deleted:    backend/node_modules/semver/ranges/min-version.js
        deleted:    backend/node_modules/semver/ranges/outside.js
        deleted:    backend/node_modules/semver/ranges/simplify.js
        deleted:    backend/node_modules/semver/ranges/subset.js
        deleted:    backend/node_modules/semver/ranges/to-comparators.js
        deleted:    backend/node_modules/semver/ranges/valid.js
        modified:   backend/node_modules/send/LICENSE
        modified:   backend/node_modules/send/README.md
        modified:   backend/node_modules/send/index.js
        modified:   backend/node_modules/send/package.json
        modified:   backend/node_modules/serve-static/LICENSE
        modified:   backend/node_modules/serve-static/README.md
        modified:   backend/node_modules/serve-static/index.js
        modified:   backend/node_modules/serve-static/package.json
        modified:   backend/node_modules/setprototypeof/LICENSE
        modified:   backend/node_modules/setprototypeof/README.md
        modified:   backend/node_modules/setprototypeof/index.d.ts
        modified:   backend/node_modules/setprototypeof/index.js
        modified:   backend/node_modules/setprototypeof/package.json
        modified:   backend/node_modules/setprototypeof/test/index.js
        modified:   backend/node_modules/side-channel-list/.editorconfig
        modified:   backend/node_modules/side-channel-list/.eslintrc
        modified:   backend/node_modules/side-channel-list/.github/FUNDING.yml
        modified:   backend/node_modules/side-channel-list/.nycrc
        modified:   backend/node_modules/side-channel-list/CHANGELOG.md
        modified:   backend/node_modules/side-channel-list/LICENSE
        modified:   backend/node_modules/side-channel-list/README.md
        modified:   backend/node_modules/side-channel-list/index.d.ts
        modified:   backend/node_modules/side-channel-list/index.js
        modified:   backend/node_modules/side-channel-list/list.d.ts
        modified:   backend/node_modules/side-channel-list/package.json
        modified:   backend/node_modules/side-channel-list/test/index.js
        modified:   backend/node_modules/side-channel-list/tsconfig.json
        modified:   backend/node_modules/side-channel-map/.editorconfig
        modified:   backend/node_modules/side-channel-map/.eslintrc
        modified:   backend/node_modules/side-channel-map/.github/FUNDING.yml
        modified:   backend/node_modules/side-channel-map/.nycrc
        modified:   backend/node_modules/side-channel-map/CHANGELOG.md
        modified:   backend/node_modules/side-channel-map/LICENSE
        modified:   backend/node_modules/side-channel-map/README.md
        modified:   backend/node_modules/side-channel-map/index.d.ts
        modified:   backend/node_modules/side-channel-map/index.js
        modified:   backend/node_modules/side-channel-map/package.json
        modified:   backend/node_modules/side-channel-map/test/index.js
        modified:   backend/node_modules/side-channel-map/tsconfig.json
        modified:   backend/node_modules/side-channel-weakmap/.editorconfig
        modified:   backend/node_modules/side-channel-weakmap/.eslintrc
        modified:   backend/node_modules/side-channel-weakmap/.github/FUNDING.yml
        modified:   backend/node_modules/side-channel-weakmap/.nycrc
        modified:   backend/node_modules/side-channel-weakmap/CHANGELOG.md
        modified:   backend/node_modules/side-channel-weakmap/LICENSE
        modified:   backend/node_modules/side-channel-weakmap/README.md
        modified:   backend/node_modules/side-channel-weakmap/index.d.ts
        modified:   backend/node_modules/side-channel-weakmap/index.js
        modified:   backend/node_modules/side-channel-weakmap/package.json
        modified:   backend/node_modules/side-channel-weakmap/test/index.js
        modified:   backend/node_modules/side-channel-weakmap/tsconfig.json
        modified:   backend/node_modules/side-channel/.editorconfig
        modified:   backend/node_modules/side-channel/.eslintrc
        modified:   backend/node_modules/side-channel/.github/FUNDING.yml
        modified:   backend/node_modules/side-channel/.nycrc
        modified:   backend/node_modules/side-channel/CHANGELOG.md
        modified:   backend/node_modules/side-channel/LICENSE
        modified:   backend/node_modules/side-channel/README.md
        modified:   backend/node_modules/side-channel/index.d.ts
        modified:   backend/node_modules/side-channel/index.js
        modified:   backend/node_modules/side-channel/package.json
        modified:   backend/node_modules/side-channel/test/index.js
        modified:   backend/node_modules/side-channel/tsconfig.json
        deleted:    backend/node_modules/socket.io/node_modules/accepts/HISTORY.md
        deleted:    backend/node_modules/socket.io/node_modules/accepts/LICENSE
        deleted:    backend/node_modules/socket.io/node_modules/accepts/README.md
        deleted:    backend/node_modules/socket.io/node_modules/accepts/index.js
        deleted:    backend/node_modules/socket.io/node_modules/accepts/package.json
        deleted:    backend/node_modules/socket.io/node_modules/mime-db/HISTORY.md
        deleted:    backend/node_modules/socket.io/node_modules/mime-db/LICENSE
        deleted:    backend/node_modules/socket.io/node_modules/mime-db/README.md
        deleted:    backend/node_modules/socket.io/node_modules/mime-db/db.json
        deleted:    backend/node_modules/socket.io/node_modules/mime-db/index.js
        deleted:    backend/node_modules/socket.io/node_modules/mime-db/package.json
        deleted:    backend/node_modules/socket.io/node_modules/mime-types/HISTORY.md
        deleted:    backend/node_modules/socket.io/node_modules/mime-types/LICENSE
        deleted:    backend/node_modules/socket.io/node_modules/mime-types/README.md
        deleted:    backend/node_modules/socket.io/node_modules/mime-types/index.js
        deleted:    backend/node_modules/socket.io/node_modules/mime-types/package.json
        deleted:    backend/node_modules/socket.io/node_modules/negotiator/HISTORY.md
        deleted:    backend/node_modules/socket.io/node_modules/negotiator/LICENSE
        deleted:    backend/node_modules/socket.io/node_modules/negotiator/README.md
        deleted:    backend/node_modules/socket.io/node_modules/negotiator/index.js
        deleted:    backend/node_modules/socket.io/node_modules/negotiator/lib/charset.js
        deleted:    backend/node_modules/socket.io/node_modules/negotiator/lib/encoding.js
        deleted:    backend/node_modules/socket.io/node_modules/negotiator/lib/language.js
        deleted:    backend/node_modules/socket.io/node_modules/negotiator/lib/mediaType.js
        deleted:    backend/node_modules/socket.io/node_modules/negotiator/package.json
        modified:   backend/node_modules/statuses/HISTORY.md
        modified:   backend/node_modules/statuses/LICENSE
        modified:   backend/node_modules/statuses/README.md
        modified:   backend/node_modules/statuses/codes.json
        modified:   backend/node_modules/statuses/index.js
        modified:   backend/node_modules/statuses/package.json
        modified:   backend/node_modules/toidentifier/HISTORY.md
        modified:   backend/node_modules/toidentifier/LICENSE
        modified:   backend/node_modules/toidentifier/README.md
        modified:   backend/node_modules/toidentifier/index.js
        modified:   backend/node_modules/toidentifier/package.json
        modified:   backend/node_modules/tr46/LICENSE.md
        modified:   backend/node_modules/tr46/README.md
        modified:   backend/node_modules/tr46/index.js
        modified:   backend/node_modules/tr46/lib/regexes.js
        modified:   backend/node_modules/tr46/lib/statusMapping.js
        modified:   backend/node_modules/tr46/package.json
        modified:   backend/node_modules/type-is/HISTORY.md
        modified:   backend/node_modules/type-is/LICENSE
        modified:   backend/node_modules/type-is/README.md
        modified:   backend/node_modules/type-is/index.js
        modified:   backend/node_modules/type-is/package.json
        modified:   backend/node_modules/unpipe/HISTORY.md
        modified:   backend/node_modules/unpipe/LICENSE
        modified:   backend/node_modules/unpipe/README.md
        modified:   backend/node_modules/unpipe/index.js
        modified:   backend/node_modules/unpipe/package.json
        modified:   backend/node_modules/whatwg-url/LICENSE.txt
        modified:   backend/node_modules/whatwg-url/README.md
        modified:   backend/node_modules/whatwg-url/index.js
        modified:   backend/node_modules/whatwg-url/lib/Function.js
        modified:   backend/node_modules/whatwg-url/lib/URL-impl.js
        modified:   backend/node_modules/whatwg-url/lib/URL.js
        modified:   backend/node_modules/whatwg-url/lib/URLSearchParams-impl.js
        modified:   backend/node_modules/whatwg-url/lib/URLSearchParams.js
        modified:   backend/node_modules/whatwg-url/lib/VoidFunction.js
        modified:   backend/node_modules/whatwg-url/lib/encoding.js
        modified:   backend/node_modules/whatwg-url/lib/infra.js
        modified:   backend/node_modules/whatwg-url/lib/percent-encoding.js
        modified:   backend/node_modules/whatwg-url/lib/url-state-machine.js
        modified:   backend/node_modules/whatwg-url/lib/urlencoded.js
        modified:   backend/node_modules/whatwg-url/lib/utils.js
        modified:   backend/node_modules/whatwg-url/package.json
        modified:   backend/node_modules/whatwg-url/webidl2js-wrapper.js
        modified:   backend/package-lock.json
        modified:   backend/package.json

no changes added to commit (use "git add" and/or "git commit -a")
PS C:\Users\HP\Downloads\civicqueue> git add backend/package.json
PS C:\Users\HP\Downloads\civicqueue> git commit -m "Fix backend package json merge conflict"
[main 544585f] Fix backend package json merge conflict
 1 file changed, 5 insertions(+), 25 deletions(-)
PS C:\Users\HP\Downloads\civicqueue> npm start

> civicqueue@1.0.0 start
> node src/server.js

node:internal/modules/cjs/loader:1424
  throw err;
  ^

Error: Cannot find module 'dotenv'
Require stack:
- C:\Users\HP\Downloads\civicqueue\src\server.js
    at Module._resolveFilename (node:internal/modules/cjs/loader:1421:15)
    at defaultResolveImpl (node:internal/modules/cjs/loader:1059:19)
    at resolveForCJSWithHooks (node:internal/modules/cjs/loader:1064:22)
    at Module._load (node:internal/modules/cjs/loader:1227:37)
    at TracingChannel.traceSync (node:diagnostics_channel:328:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:245:24)
    at Module.require (node:internal/modules/cjs/loader:1504:12)
    at require (node:internal/modules/helpers:152:16)
    at Object.<anonymous> (C:\Users\HP\Downloads\civicqueue\src\server.js:2:1)
    at Module._compile (node:internal/modules/cjs/loader:1761:14) {
  code: 'MODULE_NOT_FOUND',
  requireStack: [ 'C:\\Users\\HP\\Downloads\\civicqueue\\src\\server.js' ]
}

Node.js v24.12.0
PS C:\Users\HP\Downloads\civicqueue> npm install
npm WARN deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
npm WARN deprecated lodash.get@4.4.2: This package is deprecated. Use the optional chaining (?.) operator instead.
npm WARN deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
npm WARN deprecated @humanwhocodes/config-array@0.13.0: Use @eslint/config-array instead
npm WARN deprecated xss-clean@0.1.4: Package no longer supported. Contact Support at https://www.npmjs.com/support for more info.
npm WARN deprecated supertest@6.3.4: Please upgrade to supertest v7.1.3+, see release notes at https://github.com/forwardemail/supertest/releases/tag/v7.1.3 - maintenance is supported by Forward Email @ https://forwardemail.net
npm WARN deprecated rimraf@3.0.2: Rimraf versions prior to v4 are no longer supported
npm WARN deprecated glob@7.2.3: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm WARN deprecated glob@7.1.6: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
npm WARN deprecated @humanwhocodes/object-schema@2.0.3: Use @eslint/object-schema instead
npm WARN deprecated superagent@8.1.2: Please upgrade to superagent v10.2.2+, see release notes at https://github.com/forwardemail/superagent/releases/tag/v10.2.2 - maintenance is supported by Forward Email @ https://forwardemail.net
npm WARN deprecated uuid@9.0.1: uuid@10 and below is no longer supported.  For ESM codebases, update to uuid@latest.  For CommonJS codebases, use uuid@11 (but be aware this version will likely be deprecated in 2028).
npm WARN deprecated eslint@8.57.1: This version is no longer supported. Please see https://eslint.org/version-support for other options.

added 588 packages, removed 10 packages, changed 13 packages, and audited 618 packages in 33s

80 packages are looking for funding
  run npm fund for details

10 vulnerabilities (1 low, 6 moderate, 3 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run npm audit for details.
PS C:\Users\HP\Downloads\civicqueue>

Good progress ✅. You fixed the package.json conflict and npm install completed successfully.

Now we need to fix the project directory issue before deployment.

Look carefully at your error:

Error: Cannot find module 'dotenv'

Require stack:
- C:\Users\HP\Downloads\civicqueue\src\server.js

Your npm start ran from:

C:\Users\HP\Downloads\civicqueue

but your earlier structure was supposed to be:

civicqueue
│
├── backend
│   ├── src
│   │   └── server.js
│   ├── package.json
│   └── node_modules
│
└── frontend

But now your server is here:

civicqueue
└── src
    └── server.js

This means your backend files are not inside backend folder.
Step 1: Check current structure

Run from:

C:\Users\HP\Downloads\civicqueue

:

dir

Send output.

I expect you will see something like:

backend
frontend
src
package.json
package-lock.json

Step 2: Check backend folder

Run:

dir backend

If backend is empty or missing src, we need to move files.
Step 3: Fix structure (most likely)

Your final structure should be:

civicqueue
│
├── backend
│   │
│   ├── src
│   │   ├── server.js
│   │   ├── controllers
│   │   ├── models
│   │   ├── routes
│   │   └── middleware
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── .env
│
├── frontend
│   │
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
└── README.md

Step 4: Move backend files if needed

If your current root has:

src
package.json
package-lock.json

move them:

Move-Item src backend
Move-Item package.json backend
Move-Item package-lock.json backend

Step 5: Install backend dependencies correctly

Go:

cd backend

Delete old node_modules if needed:

Remove-Item node_modules -Recurse -Force

Then:

npm install

Step 6: Test backend

Still inside backend:

npm start

Expected:

Server running on port 5000
MongoDB connected

Important

Do NOT deploy yet.

First we need:

    Correct folder structure ✅

    Backend runs locally ✅

    Frontend runs locally ✅

    Then Render + Vercel deployment

Now send me the output of:

dir

from:

C:\Users\HP\Downloads\civicqueue

Then I will tell exactly what to move.

PS C:\Users\HP\Downloads\civicqueue> cd backend
PS C:\Users\HP\Downloads\civicqueue\backend> npm install

up to date, audited 664 packages in 2s

83 packages are looking for funding
  run npm fund for details

10 vulnerabilities (1 low, 5 moderate, 4 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run npm audit for details.
PS C:\Users\HP\Downloads\civicqueue\backend> npm run dev

> civicqueue@1.0.0 dev
> nodemon src/server.js

[nodemon] 3.1.14
[nodemon] to restart at any time, enter rs
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting node src/server.js
C:\Users\HP\Downloads\civicqueue\backend\src\app.js:1
<<<<<<< HEAD
^^

SyntaxError: Unexpected token '<<'
    at wrapSafe (node:internal/modules/cjs/loader:1692:18)
    at Module._compile (node:internal/modules/cjs/loader:1735:20)
    at Object..js (node:internal/modules/cjs/loader:1893:10)
    at Module.load (node:internal/modules/cjs/loader:1481:32)
    at Module._load (node:internal/modules/cjs/loader:1300:12)
    at TracingChannel.traceSync (node:diagnostics_channel:328:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:245:24)
    at Module.require (node:internal/modules/cjs/loader:1504:12)
    at require (node:internal/modules/helpers:152:16)
    at Object.<anonymous> (C:\Users\HP\Downloads\civicqueue\backend\src\server.js:6:19)

Node.js v24.12.0
[nodemon] app crashed - waiting for file changes before starting...

Good. Your backend structure is correct now ✅

Now we found the next merge conflict.

Error:

C:\Users\HP\Downloads\civicqueue\backend\src\app.js:1

<<<<<<< HEAD
^^
SyntaxError: Unexpected token '<<'

Your app.js still contains Git merge conflict markers.

We need to clean all remaining conflict files before deployment.
Step 1: Stop nodemon

Press:

CTRL + C

Step 2: Find all conflict files

Go to project root:

cd C:\Users\HP\Downloads\civicqueue

Run:

findstr /S /N "<<<<<<<" backend\*.js backend\src\*.js backend\src\*\*.js frontend\src\*.jsx frontend\src\*.js

This will list all files containing:

<<<<<<< HEAD
=======
>>>>>>> origin/main

Step 3: Fix app.js first

Open:

notepad backend\src\app.js

At the top you will see something like:

<<<<<<< HEAD

// version 1 code

=======

// version 2 code

>>>>>>> origin/main

You must decide which code to keep.

For CivicQueue, usually keep the upgraded version because it contains:

    security middleware

    socket support

    routes

    logging

    production setup

Remove only these lines:

<<<<<<< HEAD
=======
>>>>>>> origin/main

Do NOT delete the actual code.

Save.
Step 4: Search again

Run:

findstr /S /N "<<<<<<<" backend\*.js backend\src\*.js

Repeat until it shows nothing.
Step 5: Check Git status

git status

You will see modified files.
Step 6: Commit conflict fixes

git add .

Then:

git commit -m "Resolve remaining backend merge conflicts"

Step 7: Start backend again

Go:

cd backend

Run:

npm run dev

Expected:

[nodemon] starting node src/server.js
Server running on port 5000
MongoDB connected

Important

Do not deploy until this command works:

npm run dev

Right now app.js is only the first conflict. There may be more files.

Run this now:

findstr /S /N "<<<<<<<" backend\src\*.js

Send me the output. I will tell you which files need fixing.


 *  History restored 

PS C:\Users\HP\Downloads\civicqueue> cd backend
PS C:\Users\HP\Downloads\civicqueue\backend> npm install

up to date, audited 664 packages in 2s

83 packages are looking for funding
  run npm fund for details

10 vulnerabilities (1 low, 5 moderate, 4 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run npm audit for details.
PS C:\Users\HP\Downloads\civicqueue\backend> npm run dev

> civicqueue@1.0.0 dev
> nodemon src/server.js

[nodemon] 3.1.14
[nodemon] to restart at any time, enter rs
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting node src/server.js
C:\Users\HP\Downloads\civicqueue\backend\src\app.js:1
<<<<<<< HEAD
^^

SyntaxError: Unexpected token '<<'
    at wrapSafe (node:internal/modules/cjs/loader:1692:18)
    at Module._compile (node:internal/modules/cjs/loader:1735:20)
    at Object..js (node:internal/modules/cjs/loader:1893:10)
    at Module.load (node:internal/modules/cjs/loader:1481:32)
    at Module._load (node:internal/modules/cjs/loader:1300:12)
    at TracingChannel.traceSync (node:diagnostics_channel:328:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:245:24)
    at Module.require (node:internal/modules/cjs/loader:1504:12)
    at require (node:internal/modules/helpers:152:16)
    at Object.<anonymous> (C:\Users\HP\Downloads\civicqueue\backend\src\server.js:6:19)

Node.js v24.12.0
[nodemon] app crashed - waiting for file changes before starting...
^C
PS C:\Users\HP\Downloads\civicqueue\backend> cd ..
PS C:\Users\HP\Downloads\civicqueue> findstr /S /N "<<<<<<<" backend\*.js backend\src\*.js backend\src\*\*.js frontend\src\*.jsx frontend\src\*.js
PS C:\Users\HP\Downloads\civicqueue> findstr /S /N "<<<<<<<" backend\*.js backend\src\*.js backend\src\*\*.js frontend\src\*.jsx frontend\src\*.js
PS C:\Users\HP\Downloads\civicqueue> npm run dev

> civicqueue@1.0.0 dev
> nodemon src/server.js

[nodemon] 3.1.14
[nodemon] to restart at any time, enter rs
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting node src/server.js
(node:13140) [MONGOOSE] Warning: Duplicate schema index on {"email":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
(Use node --trace-warnings ... to show where the warning was created)
(node:13140) [MONGOOSE] Warning: Duplicate schema index on {"code":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
(node:13140) [MONGOOSE] Warning: Duplicate schema index on {"confirmationCode":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
18:29:44 [error]: MongoDB connection failed: The uri parameter to openUri() must be a string, got "undefined". Make sure the first parameter to mongoose.connect() or mongoose.createConnection() is a string.
[nodemon] app crashed - waiting for file changes before starting...

Excellent progress ✅

You have fixed the Git merge conflict issue.

Now your backend is actually starting, but it stopped because of MongoDB configuration.

Current error:

MongoDB connection failed:
The `uri` parameter to `openUri()` must be a string, got "undefined"

Meaning:

Your code is trying to connect:

mongoose.connect(process.env.MONGO_URI)

but MONGO_URI is not available.
Step 1: Check your .env file

Go to:

cd backend

Check files:

dir -Force

You should see:

.env
package.json
src

Step 2: Create .env if missing

Run:

notepad .env

Add:

PORT=5000

MONGO_URI=your_mongodb_connection_string_here

JWT_SECRET=mysecretkey123

CLIENT_URL=http://localhost:5173

Save.
Step 3: Get MongoDB connection string

Go to MongoDB Atlas:

https://cloud.mongodb.com

Then:

Database
   |
Connect
   |
Drivers

Copy:

mongodb+srv://username:password@cluster.mongodb.net/civicqueue

Replace:

username
password

Example:

MONGO_URI=mongodb+srv://civicuser:password123@cluster0.xxxxx.mongodb.net/civicqueue

Step 4: Confirm dotenv loading

Open:

backend/src/server.js

At the top it should have:

require("dotenv").config();

It should be before importing app.

Example:

require("dotenv").config();

const app = require("./app");

Step 5: Restart backend

Stop nodemon if running:

CTRL + C

Run:

npm run dev

Expected:

Server running on port 5000
MongoDB connected successfully

About these warnings

You saw:

Duplicate schema index on {"email":1}
Duplicate schema index on {"code":1}
Duplicate schema index on {"confirmationCode":1}

These are warnings only.

They will NOT stop deployment.

Later we can clean them.
Current status:

✅ Git conflicts fixed
✅ package.json fixed
✅ dependencies installed
✅ backend starts
❌ MongoDB environment variable missing

Next task:

Run:

dir -Force

inside:

C:\Users\HP\Downloads\civicqueue\backend

Send output. I want to confirm .env exists before moving to Render deployment.

[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting node src/server.js
C:\Users\HP\Downloads\civicqueue\backend\src\app.js:94
const express = require("express");
      ^

SyntaxError: Identifier 'express' has already been declared
    at wrapSafe (node:internal/modules/cjs/loader:1692:18)
    at Module._compile (node:internal/modules/cjs/loader:1735:20)
    at Object..js (node:internal/modules/cjs/loader:1893:10)
    at Module.load (node:internal/modules/cjs/loader:1481:32)
    at Module._load (node:internal/modules/cjs/loader:1300:12)
    at TracingChannel.traceSync (node:diagnostics_channel:328:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:245:24)
    at Module.require (node:internal/modules/cjs/loader:1504:12)
    at require (node:internal/modules/helpers:152:16)
    at Object.<anonymous> (C:\Users\HP\Downloads\civicqueue\backend\src\server.js:6:19)

Node.js v24.12.0
[nodemon] app crashed - waiting for file changes before starting...

Good progress. Your Git merge issue is almost resolved. Now you are in backend cleanup phase before deployment.

Current error:

SyntaxError: Identifier 'express' has already been declared

backend\src\app.js:94

const express = require("express");

This means your app.js still contains two merged versions of the file. You probably resolved <<<<<<< HEAD markers but both codes remained.

Follow these steps.
Step 1: Open app.js

Run:

cd backend
code src/app.js

(or open manually in VS Code)
Step 2: Check first 120 lines

You will see something like:

const express = require("express");
const cors = require("cors");
...

Then around line 94 again:

const express = require("express");
const cors = require("cors");
...

Your file has duplicate code.
Step 3: Keep only ONE complete app.js

Delete the second duplicate section.

Your file should start like this:

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");

const app = express();


// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended:true }));

app.use(helmet());
app.use(compression());
app.use(morgan("dev"));


// routes

Only ONE:

const express = require("express");

should exist.
Step 4: Search duplicates

Run:

findstr /S /N "const express" backend\src\*.js

Expected:

backend\src\app.js:1:const express

If you get:

app.js:1
app.js:94

duplicate still exists.
Step 5: Fix MongoDB environment

Earlier you got:

MongoDB connection failed:
uri parameter got undefined

Meaning .env missing.

Go:

cd backend
dir -a

Check if .env exists.

If not create:

code .env

Add:

PORT=5000

MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/civicqueue

JWT_SECRET=mysecretkey123

NODE_ENV=development

Replace Mongo URI with your Atlas URI.
Step 6: Check server.js

Open:

code src/server.js

It should look similar:

require("dotenv").config();

const app=require("./app");
const connectDB=require("./config/database");


const PORT=process.env.PORT || 5000;


connectDB();


app.listen(PORT,()=>{
 console.log(`Server running on ${PORT}`);
});

Step 7: Restart backend

Stop nodemon:

CTRL + C

Then:

npm run dev

Expected:

MongoDB Connected Successfully

Server running on port 5000

After backend works, deployment order:
1. Backend Deploy (Render)

Prepare:

civicqueue
│
├── backend
│   ├── src
│   ├── package.json
│   └── .env
│
└── frontend

Push changes:

git add .
git commit -m "Fix backend merge conflicts and configuration"
git push origin main

2. Render Backend

Create:

Render → New Web Service

Repository:

Civicqueue-pro

Root directory:

backend

Build command:

npm install

Start command:

npm start

Environment variables:

Add:

MONGO_URI
JWT_SECRET
PORT=5000

Deploy.
3. Frontend Deployment

Go:

cd frontend
npm install
npm run build

If build successful:

Deploy on:

    Vercel

Root:

frontend

Build:

npm run build

Output:

dist

Add:

VITE_API_URL=https://your-render-backend-url

First fix app.js duplicate. After that send me your src/app.js content if another error appears. Your project is very close now.

'use strict';
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const v1Router = require('./routes/v1/index');
const errorHandler = require('./middlewares/error.middleware');
const ApiError = require('./utils/ApiError');
const logger = require('./utils/logger');

const createApp = () => {
  const app = express();

  // Render/Railway/Vercel/Heroku-style hosts sit behind a reverse proxy. Without this,
  // Express thinks every request is plain HTTP (breaking secure: true cookies) and
  // express-rate-limit sees the proxy's IP for every user instead of the real client IP.
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
  }));
  // credentials: true + a wildcard '*' origin is rejected by browsers anyway,
  // and if it were ever honored it would allow any site to send authenticated
  // requests. FRONTEND_URL now supports a comma-separated list and there is no
  // wildcard fallback — an explicit whitelist only.
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl/Postman/server-to-server — no Origin header
      if (allowedOrigins.includes(origin)) return callback(null, true);
      logger.warn(CORS blocked request from origin: ${origin});
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // ── Parsing & sanitization ────────────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser()); // required so req.cookies is ever defined (auth controller reads req.cookies.refreshToken)
  app.use(mongoSanitize()); // prevent NoSQL injection
  app.use(xss()); // sanitize user input against stored XSS payloads

  // ── Performance ───────────────────────────────────────────────────────────
  app.use(compression());

  // ── Logging ───────────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', { stream: logger.stream }));
  }

  // ── API docs ──────────────────────────────────────────────────────────────
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'CivicQueue API Docs',
    customCss: '.swagger-ui .topbar { background: #1a1a2e }',
  }));

  // ── Routes ────────────────────────────────────────────────────────────────
  // Rate limiting intentionally disabled per project requirements (no express-rate-limit,
  // no 429s during testing/deployment). middlewares/rateLimit.middleware.js still exists
  // in the repo if you want to re-enable it later for a real production launch — just
  // re-add apiLimiter/authLimiter to this app.use() and to auth.routes.js.
  app.use('/api/v1', v1Router);

  // Root health check
  app.get('/', (req, res) => res.json({ app: 'CivicQueue', status: 'running', docs: '/api-docs' }));

  // ── 404 handler ───────────────────────────────────────────────────────────
  app.use((req, res, next) => next(ApiError.notFound(Route ${req.originalUrl} not found)));

  // ── Centralized error handler ─────────────────────────────────────────────
  app.use(errorHandler);

  return app;
};

module.exports = createApp;

const express = require("express");
const cors = require("cors");

const app = express();

// 1️⃣ Apply middlewares first
app.use(
  cors({
    origin: true,            // allow all origins (DEV)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// 2️⃣ Then define routes
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const tokenRoutes = require("./routes/tokenRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/tokens", tokenRoutes);

// 3️⃣ Root route
app.get("/", (req, res) => {
  res.send("CivicQueue API is running 🚦");
});

module.exports = app;

Your app.js has two complete Express applications merged together.

You need to keep the first one (production-ready version from Claude) and remove the second one completely.

Currently after:

module.exports = createApp;

you have another app:

const express = require("express");
const cors = require("cors");

const app = express();
...
module.exports = app;

This causes:

SyntaxError: Identifier 'express' has already been declared

Step 1: Open backend/src/app.js

Delete everything starting from this line:

const express = require("express");

(the second occurrence near the bottom)

Delete until the end:

const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: true,
...
module.exports = app;

Your final file should end like this:

  // ── Centralized error handler ─────────────────────────────────────────────
  app.use(errorHandler);

  return app;
};

module.exports = createApp;

Nothing after this.
Step 2: Save file

Ctrl + S
Step 3: Restart backend

Terminal:

cd backend
npm run dev

Next expected error

After this fix, most likely you will get:

MongoDB connection failed: uri parameter got undefined

because earlier your .env was missing.

Then we will fix:

MONGO_URI
JWT_SECRET
PORT
FRONTEND_URL

Also one important thing:

Your first app uses:

const v1Router = require('./routes/v1/index');

So your routes should be:

backend
 └── src
     └── routes
         └── v1
             └── index.js

Do not use the second app's:

/routes/authRoutes
/routes/serviceRoutes
/routes/tokenRoutes

because that is the older structure.

After deleting the duplicate part, run:

npm run dev

Send me the next output. We are now cleaning the merge conflicts one by one before deployment.

Today 7:51 PM
'use strict';
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const v1Router = require('./routes/v1/index');
const errorHandler = require('./middlewares/error.middleware');
const ApiError = require('./utils/ApiError');
const logger = require('./utils/logger');

const createApp = () => {
  const app = express();

  // Render/Railway/Vercel/Heroku-style hosts sit behind a reverse proxy. Without this,
  // Express thinks every request is plain HTTP (breaking secure: true cookies) and
  // express-rate-limit sees the proxy's IP for every user instead of the real client IP.
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
  }));
  // credentials: true + a wildcard '*' origin is rejected by browsers anyway,
  // and if it were ever honored it would allow any site to send authenticated
  // requests. FRONTEND_URL now supports a comma-separated list and there is no
  // wildcard fallback — an explicit whitelist only.
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl/Postman/server-to-server — no Origin header
      if (allowedOrigins.includes(origin)) return callback(null, true);
      logger.warn(CORS blocked request from origin: ${origin});
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // ── Parsing & sanitization ────────────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));
  app.use(cookieParser()); // required so req.cookies is ever defined (auth controller reads req.cookies.refreshToken)
  app.use(mongoSanitize()); // prevent NoSQL injection
  app.use(xss()); // sanitize user input against stored XSS payloads

  // ── Performance ───────────────────────────────────────────────────────────
  app.use(compression());

  // ── Logging ───────────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', { stream: logger.stream }));
  }

  // ── API docs ──────────────────────────────────────────────────────────────
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'CivicQueue API Docs',
    customCss: '.swagger-ui .topbar { background: #1a1a2e }',
  }));

  // ── Routes ────────────────────────────────────────────────────────────────
  // Rate limiting intentionally disabled per project requirements (no express-rate-limit,
  // no 429s during testing/deployment). middlewares/rateLimit.middleware.js still exists
  // in the repo if you want to re-enable it later for a real production launch — just
  // re-add apiLimiter/authLimiter to this app.use() and to auth.routes.js.
  app.use('/api/v1', v1Router);

  // Root health check
  app.get('/', (req, res) => res.json({ app: 'CivicQueue', status: 'running', docs: '/api-docs' }));

  // ── 404 handler ───────────────────────────────────────────────────────────
  app.use((req, res, next) => next(ApiError.notFound(Route ${req.originalUrl} not found)));

  // ── Centralized error handler ─────────────────────────────────────────────
  app.use(errorHandler);

  return app;
};

module.exports = createApp;

const express = require("express");
const cors = require("cors");

const app = express();

// 1️⃣ Apply middlewares first
app.use(
  cors({
    origin: true,            // allow all origins (DEV)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// 2️⃣ Then define routes
const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const tokenRoutes = require("./routes/tokenRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/tokens", tokenRoutes);

// 3️⃣ Root route
app.get("/", (req, res) => {
  res.send("CivicQueue API is running 🚦");
});

module.exports = app;

You have pasted the same file again. The duplicate part is still present.

You only need to remove the second half.
Delete everything after this line:

module.exports = createApp;

So your final backend/src/app.js should end exactly here:

  app.use(errorHandler);

  return app;
};

module.exports = createApp;

Remove this entire section:

const express = require("express");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const tokenRoutes = require("./routes/tokenRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/tokens", tokenRoutes);

app.get("/", (req, res) => {
  res.send("CivicQueue API is running 🚦");
});

module.exports = app;

After deleting:
1. Save file

Ctrl + S
2. Verify duplicate express is gone

Run:

findstr /N "const express" backend\src\app.js

Expected output:

3:const express = require('express');

Only one line should appear.
3. Start backend again

cd backend
npm run dev

The next error will probably be MongoDB .env configuration because your previous log showed:

MongoDB connection failed:
uri parameter got undefined

Fix this first, then send the new terminal output.

> nodemon src/server.js

[nodemon] 3.1.14
[nodemon] to restart at any time, enter rs
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting node src/server.js
(node:13140) [MONGOOSE] Warning: Duplicate schema index on {"email":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
(Use node --trace-warnings ... to show where the warning was created)
(node:13140) [MONGOOSE] Warning: Duplicate schema index on {"code":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
(node:13140) [MONGOOSE] Warning: Duplicate schema index on {"confirmationCode":1} found. This is often due to declaring an index using both "index: true" and "schema.index()". Please remove the duplicate index definition.
18:29:44 [error]: MongoDB connection failed: The uri parameter to openUri() must be a string, got "undefined". Make sure the first parameter to mongoose.connect() or mongoose.createConnection() is a string.
[nodemon] app crashed - waiting for file changes before starting...
^C
PS C:\Users\HP\Downloads\civicqueue> cd backend
PS C:\Users\HP\Downloads\civicqueue\backend> dir -Force


    Directory: C:\Users\HP\Dow
    nloads\civicqueue\backend


Mode             LastWriteTime
----             -------------
d-----    25-06-2026     05:31
d-----    14-07-2026     17:44
d-----    14-07-2026     18:23
d-----    14-07-2026     18:15
d-----    14-07-2026     17:48
d-----    14-07-2026     17:48
-a----    14-07-2026     18:15
-a----    14-07-2026     16:20
-a----    14-07-2026     16:20
-a----    14-07-2026     18:26
-a----    14-07-2026     18:22
-a----    14-07-2026     16:20
-a----    14-07-2026     18:15


PS C:\Users\HP\Downloads\civicqueue\backend> notepad .env
PS C:\Users\HP\Downloads\civicqueue\backend> npm run dev

> civicqueue@1.0.0 dev
> nodemon src/server.js

[nodemon] 3.1.14
[nodemon] to restart at any time, enter rs
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting node src/server.js
C:\Users\HP\Downloads\civicqueue\backend\src\app.js:94
const express = require("express");
      ^

SyntaxError: Identifier 'express' has already been declared
    at wrapSafe (node:internal/modules/cjs/loader:1692:18)
    at Module._compile (node:internal/modules/cjs/loader:1735:20)
    at Object..js (node:internal/modules/cjs/loader:1893:10)
    at Module.load (node:internal/modules/cjs/loader:1481:32)
    at Module._load (node:internal/modules/cjs/loader:1300:12)
    at TracingChannel.traceSync (node:diagnostics_channel:328:14)
    at wrapModuleLoad (node:internal/modules/cjs/loader:245:24)
    at Module.require (node:internal/modules/cjs/loader:1504:12)
    at require (node:internal/modules/helpers:152:16)
    at Object.<anonymous> (C:\Users\HP\Downloads\civicqueue\backend\src\server.js:6:19)

Node.js v24.12.0
[nodemon] app crashed - waiting for file changes before starting...
[nodemon] restarting due to changes...
[nodemon] starting node src/server.js
[nodemon] restarting due to changes...
19:51:37 [error]: Missing required environment variable(s): JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
19:51:37 [error]: Copy .env.example to .env and fill in real values before starting the server.
[nodemon] starting node src/server.js
19:51:40 [error]: Missing required environment variable(s): JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
19:51:40 [error]: Copy .env.example to .env and fill in real values before starting the server.
[nodemon] app crashed - waiting for file changes before starting...

Good progress. Your app.js duplicate issue is fixed now. The current error is not code issue. It is .env configuration.

Current error:

Missing required environment variable(s):
JWT_ACCESS_SECRET, JWT_REFRESH_SECRET

Copy .env.example to .env and fill in real values before starting the server.

Your project has environment validation. You need to add all required variables.
Step 1: Check .env.example

Inside backend run:

dir -Force

Find:

.env.example

Then open:

notepad .env.example

Copy all variable names.
Step 2: Create/update .env

Open:

notepad .env

Add these:

NODE_ENV=development

PORT=5000

MONGO_URI=your_mongodb_connection_string


JWT_ACCESS_SECRET=civicqueue_access_secret_2026
JWT_REFRESH_SECRET=civicqueue_refresh_secret_2026

JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d


FRONTEND_URL=http://localhost:5173,http://localhost:3000

Step 3: MongoDB URI

Replace:

your_mongodb_connection_string

with your Mongo Atlas URI.

Example:

MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/civicqueue

Step 4: Check if .env is actually saved

Run:

type .env

You should see:

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
MONGO_URI=...

Step 5: Restart server

Stop nodemon:

CTRL + C

Run:

npm run dev

Expected:

MongoDB connected successfully
Server running on port 5000

About these warnings:

Duplicate schema index on {"email":1}
Duplicate schema index on {"code":1}

Ignore them for deployment right now.

They are warnings, not crashes.

Later fix:

Example:

Your model probably has:

email:{
 type:String,
 unique:true,
 index:true
}

and also:

schema.index({email:1})

Remove one.
Current deployment checklist:

✅ Git merge conflict fixed
✅ package.json fixed
✅ npm install working
✅ app.js duplicate fixed
⬜ Environment variables
⬜ MongoDB connection
⬜ Test APIs
⬜ Deploy backend Render
⬜ Deploy frontend Vercel

First fix .env. Then send the next npm run dev output.

PORT=5001
MONGO_URI=mongodb+srv://sam:sam123@cluster0.f5glnr1.mongodb.net/civicqueue
JWT_SECRET=civicqueue_secret
CLIENT_URL=http://localhost:5173

Your current .env is missing the variables your upgraded backend expects.

Your backend error says it needs:

JWT_ACCESS_SECRET
JWT_REFRESH_SECRET

but your .env has only:

JWT_SECRET=civicqueue_secret

Replace your .env with this:

NODE_ENV=development

PORT=5001

MONGO_URI=mongodb+srv://sam:sam123@cluster0.f5glnr1.mongodb.net/civicqueue

JWT_ACCESS_SECRET=civicqueue_access_secret_2026
JWT_REFRESH_SECRET=civicqueue_refresh_secret_2026

JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173

Save .env

Then verify:

type .env

You should see:

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
MONGO_URI=...

Restart backend

Stop nodemon:

CTRL + C

Run:

npm run dev

Expected next output:

Something like:

MongoDB connected successfully
Server running on port 5001

One important thing: your MongoDB password is visible here:

mongodb+srv://sam:sam123@...

After deployment, change this password in MongoDB Atlas because it has been shared in chat.

For now, continue testing locally. Send the next terminal output after npm run dev.

and fill in real values before starting the server.
[nodemon] starting node src/server.js
19:51:40 [error]: Missing required environment variable(s): JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
19:51:40 [error]: Copy .env.example to .env and fill in real values before starting the server.
[nodemon] app crashed - waiting for file changes before starting...
^C
PS C:\Users\HP\Downloads\civicq        ueue\backend> 
 *  History restored 

PS C:\Users\HP\Downloads\civicqueue> cd backend
PS C:\Users\HP\Downloads\civicqueue\backend> dir -Force


    Directory: C:\Use
    rs\HP\Downloads\c
    ivicqueue\backend


Mode    LastWriteTime
----    -------------
d-----  25-06-2026   
                05:31
d-----  14-07-2026   
                17:44
d-----  14-07-2026   
                18:23
d-----  14-07-2026   
                18:15
d-----  14-07-2026   
                17:48
d-----  14-07-2026   
                17:48
-a----  14-07-2026   
                18:31
-a----  14-07-2026   
                16:20
-a----  14-07-2026   
                16:20
-a----  14-07-2026   
                18:26
-a----  14-07-2026   
                18:22
-a----  14-07-2026   
                16:20
-a----  14-07-2026   
                18:15


PS C:\Users\HP\Downloads\civicqueue\backend> notepad .env.example
PS C:\Users\HP\Downloads\civicqueue\backend> npm run dev

> civicqueue@1.0.0 dev
> nodemon src/server.js

[nodemon] 3.1.14
[nodemon] to restart at any time, enter rs
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting node src/server.js
19:56:33 [info]: MongoDB connected: ac-y7gf6m3-shard-00-01.f5glnr1.mongodb.net
19:56:33 [warn]: Redis unavailable (Connection is closed.) — running with in-memory cache
Failed to start: TypeError: createApp is not a function
    at bootstrap (C:\Users\HP\Downloads\civicqueue\backend\src\server.js:31:15)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
[nodemon] app crashed - waiting for file changes before starting...

Great progress. Now:

✅ MongoDB connected
✅ Environment variables fixed
✅ Backend loading further

Current error:

Failed to start: TypeError: createApp is not a function

This means your server.js expects:

const createApp = require("./app");

but your app.js is exporting something else.
Step 1: Check server.js

Open:

code src/server.js

Look around line 6.

You will probably see:

const createApp = require('./app');

and later:

const app = createApp();

Because it calls createApp().
Step 2: Check last line of app.js

Run:

Get-Content src/app.js -Tail 10

You should see:

return app;
};

module.exports = createApp;

If you see:

module.exports = app;

change it.
Step 3: Fix export

At the bottom of:

backend/src/app.js

make sure it is exactly:

  app.use(errorHandler);

  return app;
};

module.exports = createApp;

Save.
Step 4: Restart

npm run dev

Why this happened

Your project had two app styles:
Old style:

const app = express();

module.exports = app;

server.js:

const app = require("./app");
app.listen(PORT);

New upgraded style:

const createApp = () => {
 const app = express();
 return app;
}

module.exports = createApp;

server.js:

const createApp = require("./app");

const app=createApp();

app.listen(PORT);

Your project is using the second one.

After fixing, expected output:

MongoDB connected: cluster...
Redis unavailable — running with in-memory cache
Server running on port 5001

Send the next output. You are very close to backend deployment.

PS C:\Users\HP\Downloads\civicqueue\frontend> npm run dev
npm ERR! code EJSONPARSE
npm ERR! JSON.parse Invalid package.json: JSONParseError: Expected property name or '}' in JSON at position 3 (line 2 column 1) while parsing near "{\r\n<<<<<<< HEAD\r\n  \"nam..."
npm ERR! JSON.parse Failed to parse JSON data.
npm ERR! JSON.parse Note: package.json must be actual JSON, not just JavaScript.

npm ERR! A complete log of this run can be found in: C:\Users\HP\AppData\Local\npm-cache\_logs\2026-07-14T14_28_38_086Z-debug-0.log
PS C:\Users\HP\Downloads\civicqueue\frontend> npm install
npm ERR! code EJSONPARSE
npm ERR! path C:\Users\HP\Downloads\civicqueue\frontend/package.json
npm ERR! JSON.parse Expected property name or '}' in JSON at position 3 (line 2 column 1) while parsing near "{\r\n<<<<<<< HEAD\r\n  \"nam..."
npm ERR! JSON.parse Failed to parse JSON data.
npm ERR! JSON.parse Note: package.json must be actual JSON, not just JavaScript.

npm ERR! A complete log of this run can be found in: C:\Users\HP\AppData\Local\npm-cache\_logs\2026-07-14T14_28_49_491Z-debug-0.log
PS C:\Users\HP\Downloads\civicqueue\frontend> 

You are very close. Your deployment is blocked because merge conflict files are still present from Git pull. We need to clean frontend + backend first, then deploy.

Follow exactly step-by-step.
PART 1: Fix Backend createApp is not a function

Your backend error:

Failed to start: TypeError: createApp is not a function

means your src/app.js export is broken.

Open:

backend/src/app.js

Currently you have two apps merged together:

First part:

const createApp = () => {
...
}

module.exports = createApp;

Then again:

const express = require("express");
const cors = require("cors");

const app = express();
...
module.exports = app;

You cannot keep both.
Step 1: Remove second half

Keep only this structure:

'use strict';

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');

const createApp = () => {

const app = express();

app.use(cors({
    origin:true,
    credentials:true
}));

app.use(express.json());

app.get("/",(req,res)=>{
    res.json({
        app:"CivicQueue",
        status:"running"
    });
});


return app;

};


module.exports = createApp;

Save.
PART 2: Fix backend environment

Your .env needs these:

Open:

backend/.env

Put:

PORT=5001

MONGO_URI=mongodb+srv://sam:sam123@cluster0.f5glnr1.mongodb.net/civicqueue

JWT_ACCESS_SECRET=civicqueue_access_secret_123456

JWT_REFRESH_SECRET=civicqueue_refresh_secret_123456

CLIENT_URL=http://localhost:5173

FRONTEND_URL=http://localhost:5173

NODE_ENV=development

Save.
PART 3: Restart backend

Terminal:

cd backend
npm run dev

Expected:

MongoDB connected
Server running on port 5001

PART 4: Fix frontend package.json

Your frontend has the same merge conflict.

Error:

<<<<<<< HEAD
"name"

means package.json contains Git markers.

Open:

frontend/package.json

You will see:

<<<<<<< HEAD
{
...
=======
{
...
}
>>>>>>> main

Delete everything and replace with:

{
  "name": "civicqueue-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",

  "scripts": {
    "dev": "vite",
    "build": "vite",
    "preview": "vite preview"
  },

  "dependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "axios": "^1.7.9",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.1.1",
    "socket.io-client": "^4.8.1"
  },

  "devDependencies": {
    "vite": "^6.0.5"
  }
}

Save.
PART 5: Clean frontend installation

Inside frontend:

Run:

Remove-Item node_modules -Recurse -Force

If it says not found ignore.

Then:

Remove-Item package-lock.json

Then:

npm install

PART 6: Run frontend

npm run dev

Expected:

VITE ready

Local:
http://localhost:5173/

PART 7: Check remaining merge conflicts

From project root:

C:\Users\HP\Downloads\civicqueue

Run:

findstr /S /N "<<<<<<<" *

If output appears, those files still have conflicts.

Need to fix every file showing:

<<<<<<< HEAD
=======
>>>>>>> 

PART 8: Git commit after fixing

From root:

git status

You should NOT see:

backend/node_modules
frontend/node_modules

If they appear:

git rm -r --cached backend/node_modules
git rm -r --cached frontend/node_modules

Create .gitignore:

Root:

.gitignore

Add:

node_modules/
.env
dist/
build/

Then:

git add .
git commit -m "Fix merge conflicts and prepare deployment"
git push origin main

After local testing works

Deployment order:
Backend → Render

Build:

npm install

Start:

npm start

Environment variables:

PORT=5001
MONGO_URI=your atlas url
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
FRONTEND_URL=https://your-frontend-url
NODE_ENV=production

Frontend → Vercel

Root directory:

frontend

Build:

npm run build

Output:

dist

Environment:

VITE_API_URL=https://your-backend-url

First fix app.js and frontend/package.json. After that run:

backend npm run dev
frontend npm run dev

Send me the next error if any. You are in the final debugging stage now.

tend
PS C:\Users\HP\Downloads\civicqueue\frontend> npm run dev
npm ERR! code EJSONPARSE
npm ERR! JSON.parse Invalid package.json: JSONParseError: Expected property name or '}' in JSON at position 3 (line 2 column 1) while parsing near "{\r\n<<<<<<< HEAD\r\n  \"nam..."
npm ERR! JSON.parse Failed to parse JSON data.
npm ERR! JSON.parse Note: package.json must be actual JSON, not just JavaScript.

npm ERR! A complete log of this run can be found in: C:\Users\HP\AppData\Local\npm-cache\_logs\2026-07-14T14_28_38_086Z-debug-0.log
PS C:\Users\HP\Downloads\civicqueue\frontend> npm install
npm ERR! code EJSONPARSE
npm ERR! path C:\Users\HP\Downloads\civicqueue\frontend/package.json
npm ERR! JSON.parse Expected property name or '}' in JSON at position 3 (line 2 column 1) while parsing near "{\r\n<<<<<<< HEAD\r\n  \"nam..."
npm ERR! JSON.parse Failed to parse JSON data.
npm ERR! JSON.parse Note: package.json must be actual JSON, not just JavaScript.

npm ERR! A complete log of this run can be found in: C:\Users\HP\AppData\Local\npm-cache\_logs\2026-07-14T14_28_49_491Z-debug-0.log
PS C:\Users\HP\Downloads\civicqueue\frontend> 

Your frontend is still not fixed. The error clearly says:

<<<<<<< HEAD

inside:

frontend/package.json

This means Git merge conflict markers are still there.

Do this step-by-step.
Step 1: Open frontend package.json

Run:

notepad package.json

You will see something like:

{
<<<<<<< HEAD
"name": "something",
...
=======
"name": "something else",
...
>>>>>>> main
}

Step 2: Delete everything inside package.json

Select all:

CTRL + A

Delete.

Paste this:

{
  "name": "civicqueue-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",

  "scripts": {
    "dev": "vite",
    "build": "vite",
    "preview": "vite preview"
  },

  "dependencies": {
    "axios": "^1.7.9",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.1.1",
    "socket.io-client": "^4.8.1"
  },

  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^6.0.5"
  }
}

Save:

CTRL + S

Close Notepad.
Step 3: Remove broken installation

Still inside:

PS C:\Users\HP\Downloads\civicqueue\frontend>

Run:

Remove-Item node_modules -Recurse -Force

If it says:

Cannot find path

ignore it.

Then:

Remove-Item package-lock.json -Force

Step 4: Install again

Run:

npm install

Wait until complete.

You should see:

added xxx packages

Step 5: Start frontend

Run:

npm run dev

Expected:

VITE v6.x.x ready

➜ Local:
http://localhost:5173/

Step 6: Check remaining conflicts

From project root:

cd ..
cd ..

You should be here:

C:\Users\HP\Downloads\civicqueue

Run:

findstr /S /N "<<<<<<<" *

If it prints any files, those files still need conflict removal.

After frontend starts successfully, your next step will be connecting:

Frontend (5173)
        |
        |
Backend (5001)
        |
        |
MongoDB Atlas

Run the above steps and send me the output of:

npm run dev


> npm run dev

> frontend@0.0.0 dev
> vite

failed to load config from C:\Users\HP\Downloads\civicqueue\frontend\vite.config.js
error when starting dev server:
Error: Build failed with 1 error:

[PARSE_ERROR] Encountered diff marker
    ╭─[ vite.config.js:4:1 ]
    │
  4 │ <<<<<<< HEAD
    │ ───┬───  
    │    ╰───── between this marker and ======= is the code that we're merging into
    │ 
 14 │ =======
    │ ───┬───  
    │    ╰───── between this marker and >>>>>>> is the incoming code
    │ 
 18 │ >>>>>>> b39a1f7edfb1750ee70940e959fef7d0938f56e2
    │ ───┬───  
    │    ╰───── this marker concludes the conflict region
    │ 
    │ Help: Conflict markers indicate that a merge was started but could not be completed due to merge conflicts.
    │       To resolve a conflict, keep only the code you want and then delete the lines containing conflict markers.
    │       If you're having merge conflicts after pulling new code, the top section is the code you already had and the bottom section is the remote code.
    │       If you're in the middle of a rebase, the top section is the code being rebased onto and the bottom section is the code coming from the current commit being rebased.
    │       If you have nested conflicts, resolve the outermost conflict first.
────╯

    at aggregateBindingErrorsIntoJsError (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/rolldown/dist/shared/error-CkdMJ9ps.mjs:48:18)
    at unwrapBindingResult (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/rolldown/dist/shared/error-CkdMJ9ps.mjs:18:128)
    at #build (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/rolldown/dist/shared/rolldown-build-BVD3dIdE.mjs:3275:34)
    at async bundleConfigFile (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/chunks/node.js:34842:17)
    at async bundleAndLoadConfigFile (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/chunks/node.js:34750:18)
    at async loadConfigFromFile (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/chunks/node.js:34719:42)
    at async resolveConfig (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/chunks/node.js:34345:22)
    at async _createServer (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/chunks/node.js:26080:65)
    at async CAC.<anonymous> (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/cli.js:708:18) {
  errors: [Getter/Setter]
}
PS C:\Users\HP\Downloads\civicqueue\frontend> 

Good. package.json is fixed. Now the next remaining merge conflict is:

frontend/vite.config.js

Error:

<<<<<<< HEAD
=======
>>>>>>> b39a1f7...

Git conflict markers are still present.

Follow these steps.
Step 1: Open vite.config.js

Run:

notepad vite.config.js

Step 2: Replace the whole file

Delete everything and paste:

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react()
  ],

  server: {
    port: 5173,
    host: true
  }
})

Save:

CTRL + S

Close Notepad.
Step 3: Check frontend conflicts again

Inside:

C:\Users\HP\Downloads\civicqueue\frontend

Run:

findstr /S /N "<<<<<<<" *

If it shows files, fix them one by one.
Step 4: Start frontend again

Run:

npm run dev

Expected:

VITE v6.x.x ready

➜ Local: http://localhost:5173/

Important: You probably have more conflict files

Because your project had a big merge, run this from project root:

cd ..
findstr /S /N "<<<<<<<" *

It will show all remaining files.

Example:

frontend/src/App.jsx:10:<<<<<<< HEAD
frontend/src/main.jsx:5:<<<<<<< HEAD
backend/src/routes/auth.js:20:<<<<<<< HEAD

We need to clean all of them before deployment.

Send me the output of:

findstr /S /N "<<<<<<<" *

from:

C:\Users\HP\Downloads\civicqueue

Then I will tell exactly which files to edit.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:5000', ws: true, changeOrigin: true },
    },
  },

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

Your vite.config.js also has a merge conflict, but the markers were removed incorrectly. Now you have duplicate export default defineConfig.

Current problem:

export default defineConfig({
...
})

// https://vite.dev/config/
export default defineConfig({
...
})

A Vite config can have only one export.

Replace the whole file with this:

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,

    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      },

      '/socket.io': {
        target: 'http://localhost:5001',
        ws: true,
        changeOrigin: true
      }
    }
  }
})

Why port changed?

Your backend .env has:

PORT=5001

so frontend proxy must point to:

http://localhost:5001

not:

http://localhost:5000

Now save the file.

Run:

npm run dev

Expected:

VITE v6.x.x ready

➜ Local: http://localhost:3000/

After frontend starts, go to project root:

cd ..
cd ..

You should be here:

C:\Users\HP\Downloads\civicqueue

Run:

findstr /S /N "<<<<<<<" *

This will find the remaining conflict files before deployment.

node_modules/vite/dist/node/chunks/node.js:34750:18)
    at async loadConfigFromFile (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/chunks/node.js:34719:42)
    at async resolveConfig (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/chunks/node.js:34345:22)
    at async _createServer (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/chunks/node.js:26080:65)
    at async CAC.<anonymous> (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/cli.js:708:18) {
  errors: [Getter/Setter]
}
PS C:\Users\HP\Downloads\civicqueue\frontend> npm run dev

> frontend@0.0.0 dev
> vite

8:04:13 pm [vite] (client) Re-optimizing dependencies because vite config has changed

  VITE v8.0.13  ready in 578 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
(!) Failed to run dependency scan. Skipping dependency pre-bundling. Error:   Failed to scan for dependencies from entries:
  C:/Users/HP/Downloads/civicqueue/frontend/index.html

  Build failed with 1 error:

[PARSE_ERROR] Encountered diff marker
    ╭─[ src/main.jsx:1:1 ]
    │
  1 │ <<<<<<< HEAD
    │ ───┬───  
    │    ╰───── between this marker and ======= is the code that we're merging into
    │ 
 12 │ =======
    │ ───┬───  
    │    ╰───── between this marker and >>>>>>> is the incoming code
    │ 
 27 │ >>>>>>> b39a1f7edfb1750ee70940e959fef7d0938f56e2
    │ ───┬───  
    │    ╰───── this marker concludes the conflict region
    │ 
    │ Help: Conflict markers indicate that a merge was started but could not be completed due to merge conflicts.
    │       To resolve a conflict, keep only the code you want and then delete the lines containing conflict markers.
    │       If you're having merge conflicts after pulling new code, the top section is the code you already had and the bottom section is the remote code.
    │       If you're in the middle of a rebase, the top section is the code being rebased onto and the bottom section is the code coming from the current commit being rebased.
    │       If you have nested conflicts, resolve the outermost conflict first.
────╯

    at aggregateBindingErrorsIntoJsError (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/rolldown/dist/shared/error-CkdMJ9ps.mjs:48:18)
    at unwrapBindingResult (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/rolldown/dist/shared/error-CkdMJ9ps.mjs:18:128)
    at scan (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/rolldown/dist/experimental-index.mjs:176:3)
    at async Object.build (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/chunks/node.js:30826:3)
    at async scan (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/chunks/node.js:30771:4)
    at async file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/chunks/node.js:23242:15

Good progress. Vite is starting now, but it found the next Git merge conflict:

src/main.jsx:1

<<<<<<< HEAD
=======
>>>>>>> 

You need to clean frontend/src/main.jsx.
Step 1: Open main.jsx

From:

PS C:\Users\HP\Downloads\civicqueue\frontend>

Run:

notepad src/main.jsx

Step 2: Remove conflict and keep one version

You will see something like:

<<<<<<< HEAD

(old code)

=======

(new code)

>>>>>>> b39a1f7edfb1750ee70940e959fef7d0938f56e2

Delete:

<<<<<<< HEAD
=======
>>>>>>> commit-id

Keep only the actual React code.

If you are unsure, replace the whole file with this standard Vite React setup:

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

Save.
Step 3: Find ALL remaining conflicts

Do not fix one by one manually anymore.

Go to project root:

cd ..
cd ..

You should be here:

C:\Users\HP\Downloads\civicqueue

Run:

findstr /S /N "<<<<<<<" *

You will get a list like:

frontend/src/App.jsx:1
frontend/src/routes/index.jsx:5
backend/src/controllers/auth.js:20

Send me that complete output.

We will clean all remaining files together, then commit and deploy.

gnostics_channel:350:14)
  Plugin: vite:css
  File: C:/Users/HP/Downloads/civicqueue/frontend/src/index.css
8:06:24 pm [vite] (client) Pre-transform error: Failed to load PostCSS config (searchPath: C:/Users/HP/Downloads/civicqueue/frontend): [SyntaxError] Unexpected token '<<'
SyntaxError: Unexpected token '<<'
    at compileSourceTextModule (node:internal/modules/esm/utils:318:16)
    at ModuleLoader.moduleStrategy (node:internal/modules/esm/translators:111:18)
    at #translate (node:internal/modules/esm/loader:473:20)
    at afterLoad (node:internal/modules/esm/loader:529:29)
    at ModuleLoader.loadAndTranslate (node:internal/modules/esm/loader:534:12)
    at #getOrCreateModuleJobAfterResolve (node:internal/modules/esm/loader:571:36)
    at afterResolve (node:internal/modules/esm/loader:624:52)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:630:12)
    at onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:649:32)
    at TracingChannel.tracePromise (node:diagnostics_channel:350:14)
  Plugin: vite:css
  File: C:/Users/HP/Downloads/civicqueue/frontend/src/index.css
8:06:24 pm [vite] (client) Pre-transform error: Transform failed with 1 error:

[PARSE_ERROR] Encountered diff marker
     ╭─[ src/App.jsx:1:1 ]
     │
   1 │ <<<<<<< HEAD
     │ ───┬───  
     │    ╰───── between this marker and ======= is the code that we're merging into
     │ 
  94 │ =======
     │ ───┬───  
     │    ╰───── between this marker and >>>>>>> is the incoming code
     │ 
 130 │ >>>>>>> b39a1f7edfb1750ee70940e959fef7d0938f56e2
     │ ───┬───  
     │    ╰───── this marker concludes the conflict region
     │ 
     │ Help: Conflict markers indicate that a merge was started but could not be completed due to merge conflicts.
     │       To resolve a conflict, keep only the code you want and then delete the lines containing conflict markers.
     │       If you're having merge conflicts after pulling new code, the top section is the code you already had and the bottom section is the remote code.
     │       If you're in the middle of a rebase, the top section is the code being rebased onto and the bottom section is the code coming from the current commit being rebased.
     │       If you have nested conflicts, resolve the outermost conflict first.
─────╯

  Plugin: vite:oxc
  File: C:/Users/HP/Downloads/civicqueue/frontend/src/App.jsx
8:06:24 pm [vite] Internal server error: Transform failed with 1 error:

[PARSE_ERROR] Encountered diff marker
     ╭─[ src/App.jsx:1:1 ]
     │
   1 │ <<<<<<< HEAD
     │ ───┬───  
     │    ╰───── between this marker and ======= is the code that we're merging into
     │ 
  94 │ =======
     │ ───┬───  
     │    ╰───── between this marker and >>>>>>> is the incoming code
     │ 
 130 │ >>>>>>> b39a1f7edfb1750ee70940e959fef7d0938f56e2
     │ ───┬───  
     │    ╰───── this marker concludes the conflict region
     │ 
     │ Help: Conflict markers indicate that a merge was started but could not be completed due to merge conflicts.
     │       To resolve a conflict, keep only the code you want and then delete the lines containing conflict markers.
     │       If you're having merge conflicts after pulling new code, the top section is the code you already had and the bottom section is the remote code.
     │       If you're in the middle of a rebase, the top section is the code being rebased onto and the bottom section is the code coming from the current commit being rebased.
     │       If you have nested conflicts, resolve the outermost conflict first.
─────╯

  Plugin: vite:oxc
  File: C:/Users/HP/Downloads/civicqueue/frontend/src/App.jsx
      at transformWithOxc (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/chunks/node.js:3339:19)
      at TransformPluginContext.transform (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/chunks/node.js:3410:26)
      at EnvironmentPluginContainer.transform (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/chunks/node.js:30271:51)
      at async loadAndTransform (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/chunks/node.js:24532:26)
      at async viteTransformMiddleware (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/chunks/node.js:24326:20)
8:06:24 pm [vite] (client) ✨ new dependencies optimized: react-dom/client, react-hot-toast
8:06:24 pm [vite] (client) ✨ optimized dependencies changed. reloading

Unable to parse HTML; parse5 error code invalid-first-character-of-tag-name
 at C:/Users/HP/Downloads/civicqueue/frontend/index.html:5:2
3  |    <head>
4  |      <meta charset="UTF-8" />
5  |  <<<<<<< HEAD
   |       ^
6  |      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
7  |      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
8:06:25 pm [vite] (client) Pre-transform error: Failed to load PostCSS config (searchPath: C:/Users/HP/Downloads/civicqueue/frontend): [SyntaxError] Unexpected token '<<'
SyntaxError: Unexpected token '<<'
    at compileSourceTextModule (node:internal/modules/esm/utils:318:16)
    at ModuleLoader.moduleStrategy (node:internal/modules/esm/translators:111:18)
    at #translate (node:internal/modules/esm/loader:473:20)
    at afterLoad (node:internal/modules/esm/loader:529:29)
    at ModuleLoader.loadAndTranslate (node:internal/modules/esm/loader:534:12)
    at #getOrCreateModuleJobAfterResolve (node:internal/modules/esm/loader:571:36)
    at afterResolve (node:internal/modules/esm/loader:624:52)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:630:12)
    at onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:649:32)
    at TracingChannel.tracePromise (node:diagnostics_channel:350:14)
  Plugin: vite:css
  File: C:/Users/HP/Downloads/civicqueue/frontend/src/index.css
8:06:25 pm [vite] Internal server error: Transform failed with 1 error:

[PARSE_ERROR] Encountered diff marker
     ╭─[ src/App.jsx:1:1 ]
     │
   1 │ <<<<<<< HEAD
     │ ───┬───  
     │    ╰───── between this marker and ======= is the code that we're merging into
     │ 
  94 │ =======
     │ ───┬───  
     │    ╰───── between this marker and >>>>>>> is the incoming code
     │ 
 130 │ >>>>>>> b39a1f7edfb1750ee70940e959fef7d0938f56e2
     │ ───┬───  
     │    ╰───── this marker concludes the conflict region
     │ 
     │ Help: Conflict markers indicate that a merge was started but could not be completed due to merge conflicts.
     │       To resolve a conflict, keep only the code you want and then delete the lines containing conflict markers.
     │       If you're having merge conflicts after pulling new code, the top section is the code you already had and the bottom section is the remote code.
     │       If you're in the middle of a rebase, the top section is the code being rebased onto and the bottom section is the code coming from the current commit being rebased.
     │       If you have nested conflicts, resolve the outermost conflict first.
─────╯

  Plugin: vite:oxc
  File: C:/Users/HP/Downloads/civicqueue/frontend/src/App.jsx
      at transformWithOxc (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/chunks/node.js:3339:19)
      at TransformPluginContext.transform (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/chunks/node.js:3410:26)
      at EnvironmentPluginContainer.transform (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/chunks/node.js:30271:51)
      at async loadAndTransform (file:///C:/Users/HP/Downloads/civicqueue/frontend/node_modules/vite/dist/node/chunks/node.js:24532:26)
8:06:25 pm [vite] (client) Pre-transform error: Transform failed with 1 error:

[PARSE_ERROR] Encountered diff marker
     ╭─[ src/App.jsx:1:1 ]
     │
   1 │ <<<<<<< HEAD
     │ ───┬───  
     │    ╰───── between this marker and ======= is the code that we're merging into
     │ 
  94 │ =======
     │ ───┬───  
     │    ╰───── between this marker and >>>>>>> is the incoming code
     │ 
 130 │ >>>>>>> b39a1f7edfb1750ee70940e959fef7d0938f56e2
     │ ───┬───  
     │    ╰───── this marker concludes the conflict region
     │ 
     │ Help: Conflict markers indicate that a merge was started but could not be completed due to merge conflicts.
     │       To resolve a conflict, keep only the code you want and then delete the lines containing conflict markers.
     │       If you're having merge conflicts after pulling new code, the top section is the code you already had and the bottom section is the remote code.
     │       If you're in the middle of a rebase, the top section is the code being rebased onto and the bottom section is the code coming from the current commit being rebased.
     │       If you have nested conflicts, resolve the outermost conflict first.
─────╯

  Plugin: vite:oxc
  File: C:/Users/HP/Downloads/civicqueue/frontend/src/App.jsx
8:06:25 pm [vite] Internal server error: Failed to load PostCSS config (searchPath: C:/Users/HP/Downloads/civicqueue/frontend): [SyntaxError] Unexpected token '<<'
SyntaxError: Unexpected token '<<'
    at compileSourceTextModule (node:internal/modules/esm/utils:318:16)
    at ModuleLoader.moduleStrategy (node:internal/modules/esm/translators:111:18)
    at #translate (node:internal/modules/esm/loader:473:20)
    at afterLoad (node:internal/modules/esm/loader:529:29)
    at ModuleLoader.loadAndTranslate (node:internal/modules/esm/loader:534:12)
    at #getOrCreateModuleJobAfterResolve (node:internal/modules/esm/loader:571:36)
    at afterResolve (node:internal/modules/esm/loader:624:52)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:630:12)
    at onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:649:32)
    at TracingChannel.tracePromise (node:diagnostics_channel:350:14)
  Plugin: vite:css
  File: C:/Users/HP/Downloads/civicqueue/frontend/src/index.css

You are facing Git merge conflict leftovers in both backend and frontend. The project is almost running, but many files still contain these markers:

<<<<<<< HEAD
=======
>>>>>>> commit-id

These are not valid JavaScript/JSON/CSS/HTML. You need to remove them and keep the correct code.

Follow this order.
1. First find ALL remaining conflicts

From project root:

cd C:\Users\HP\Downloads\civicqueue

Run:

git grep -n "<<<<<<<"

You will get a list like:

frontend/package.json
frontend/vite.config.js
frontend/src/App.jsx
frontend/src/main.jsx
frontend/src/index.css
frontend/index.html
backend/src/app.js

Resolve each.
BACKEND FIX
Problem

Your backend/src/app.js contains TWO applications merged together.

You have:
First part (production version)

const createApp = () => {
...
}

module.exports = createApp;

and then again:

const express = require("express");
const cors = require("cors");

const app = express();

This caused:

Identifier 'express' has already been declared

Replace entire backend/src/app.js

Keep only the first version.

At the end it should only have:

return app;
};

module.exports = createApp;

Remove everything after:

module.exports = createApp;

Then check:

npm run dev

FRONTEND FIX

You have conflicts in:

package.json
vite.config.js
src/main.jsx
src/App.jsx
src/index.css
index.html

2. Fix vite.config.js

Your current file has:

export default defineConfig({
...
})


// second config

export default defineConfig({
...
})

Two exports are invalid.

Replace with:

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server:{
    port:3000,

    proxy:{
      '/api':{
        target:'http://localhost:5001',
        changeOrigin:true
      },

      '/socket.io':{
        target:'http://localhost:5001',
        ws:true,
        changeOrigin:true
      }
    }
  }
})

Notice:

Your backend runs on:

PORT=5001

so frontend proxy should not use:

localhost:5000

3. Fix package.json

Open:

frontend/package.json

Remove:

<<<<<<< HEAD
=======
>>>>>>> xxxxx

Keep one JSON only.

Example:

{
  "name":"frontend",
  "version":"0.0.0",

  "scripts":{
    "dev":"vite",
    "build":"vite build",
    "preview":"vite preview"
  },

  "dependencies":{
    "axios":"^1.6.0",
    "react":"latest",
    "react-dom":"latest",
    "react-hot-toast":"latest"
  },

  "devDependencies":{
    "@vitejs/plugin-react":"latest",
    "vite":"latest"
  }
}

Then:

npm install

4. Fix src/main.jsx

Open:

frontend/src/main.jsx

Remove conflict markers.

Final should look similar:

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(
  document.getElementById('root')
).render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>
)

5. Fix App.jsx

Open:

frontend/src/App.jsx

Remove:

<<<<<<< HEAD
=======
>>>>>>> commit

Keep only one App component.
6. Fix index.html

Remove:

<<<<<<< HEAD
=======
>>>>>>> 

Your file should start:

<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>CivicQueue</title>
</head>

<body>

<div id="root"></div>

<script type="module" src="/src/main.jsx"></script>

</body>
</html>

7. Fix index.css

Open:

frontend/src/index.css

Remove conflict markers.
8. Check again

Run:

git grep -n "<<<<<<<"

Expected:

(no output)

9. Start backend

Terminal 1:

cd backend
npm run dev

Expected:

MongoDB connected
Server running on port 5001

10. Start frontend

Terminal 2:

cd frontend
npm run dev

Expected:

VITE ready

Local:
http://localhost:3000

Why this happened

You probably merged Claude's improved project into your existing CivicQueue repo. Git found conflicts but the conflict resolution was incomplete. The files were committed with:

<<<<<<< HEAD
old code
=======
new code
>>>>>>> commit

inside them.

Your project is not broken; it only needs conflict cleanup.

After cleanup, commit:

git add .
git commit -m "Resolve merge conflicts and fix project setup"

Then push:

git push origin main

Your next error (if any) will likely be normal runtime errors, not merge issues.

PS C:\Users\HP\Downloads\civicqueue> git grep -n "<<<<<<<"
README.md:1:<<<<<<< HEAD
README.md:3:<<<<<<< HEAD
README.md:49:<<<<<<< HEAD
README.md:64:<<<<<<< HEAD
README.md:66:<<<<<<< HEAD
README.md:110:<<<<<<< HEAD
README.md:151:<<<<<<< :

Good. Now only README.md has remaining merge conflicts.

Your code files are clean now, but Git will still consider the repository conflicted because README contains markers.
Step 1: Open README.md

Run:

notepad README.md

You will see sections like:

<<<<<<< HEAD

(old README content)

=======

(new README content)

>>>>>>> commit-id

Step 2: Clean README

For every conflict:
Remove these lines:

<<<<<<< HEAD
=======
>>>>>>> commit-id

Keep the better content between them.

Example:

Before:

<<<<<<< HEAD
# CivicQueue

Smart Queue Management System
=======
# CivicQueue 🚦

Real-time government queue management platform
>>>>>>> b39a1f7

After:

# CivicQueue 🚦

Smart Queue Management System

Real-time government queue management platform

Step 3: Check again

Save README.

Run:

git grep -n "<<<<<<<"

Expected:

(no output)

Step 4: Check Git status

Run:

git status

You should see modified files:

Example:

modified: README.md
modified: backend/src/app.js
modified: frontend/src/App.jsx
...

Step 5: Commit the merge cleanup

Run:

git add .

Then:

git commit -m "Resolve all merge conflicts"

Step 6: Test both apps again

Backend:

cd backend
npm run dev

Frontend:

New terminal:

cd frontend
npm run dev

At this stage, your previous errors:

    ❌ <<<<<<< HEAD

    ❌ duplicate express declaration

    ❌ invalid package.json

    ❌ invalid vite config

should be completely gone.

If another runtime error appears after this, it will be an actual project issue (MongoDB, routes, authentication, API mismatch), not Git merge damage.

PS C:\Users\HP\Downloads\civicqueue> git grep -n "<<<<<<<"
README.md:1:<<<<<<< HEAD
README.md:3:<<<<<<< HEAD
README.md:49:<<<<<<< HEAD
README.md:64:<<<<<<< HEAD
README.md:66:<<<<<<< HEAD
README.md:110:<<<<<<< HEAD
README.md:151:<<<<<<< :

Your git grep output shows that README.md still contains unresolved merge conflict markers. You need to clean this file.

Since README does not affect application execution, the fastest and safest solution is to replace it with a clean README.
Step 1: Open README.md

Run:

notepad README.md

Step 2: Select all content and replace it with this clean README

# 🚦 CivicQueue

Smart Queue Management System for Government and Public Service Offices.

CivicQueue helps citizens avoid long waiting times by providing digital token generation, live queue tracking, and staff/admin queue management.

---

## ✨ Features

### Citizen
- User registration and login
- Generate queue token
- View live queue status
- Track estimated waiting time
- Receive queue updates

### Staff
- Staff dashboard
- View assigned queues
- Call next token
- Update token status

### Admin
- Manage departments/services
- Manage staff accounts
- Monitor queues
- View system statistics

---

## 🛠 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.IO
- Redis Cache

### Frontend
- React.js
- Vite
- Axios
- Tailwind CSS

---

## 📁 Project Structure

civicqueue
│
├── backend
│ ├── src
│ ├── routes
│ ├── controllers
│ ├── models
│ └── middleware
│
└── frontend
├── src
├── components
└── pages


---

## ⚙️ Installation

### Backend

```bash
cd backend
npm install
npm run dev

Create .env

PORT=5001
MONGO_URI=your_mongodb_connection
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret

Frontend

cd frontend
npm install
npm run dev

Frontend runs on:
http://localhost:3000


Backend runs on:
http://localhost:5001

👨‍💻 Author

Samruddhi Patil