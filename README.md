# 🚀 CivicQueue Pro

A full-stack Smart Queue Management System designed to streamline public service queues with real-time updates, appointment booking, and role-based dashboards.

## 🌐 Live Demo

- **Frontend:** https://civicqueue-pro.vercel.app/
- **Backend API:** https://civicqueue-pro.onrender.com

---

## 📌 Overview

CivicQueue Pro digitizes traditional queue management by allowing citizens to book appointments, generate queue tokens, and track their position in real time. Staff can efficiently manage queues, while administrators oversee departments, users, and analytics.

---

## ✨ Features

### 👤 Citizen
- User Registration & Login
- Secure JWT Authentication
- Book Appointments
- View Queue Status
- Real-Time Token Updates
- Notification System
- Profile Management

### 👨‍💼 Staff
- Staff Dashboard
- View Assigned Appointments
- Call Next Token
- Mark Appointments as Completed
- Skip or Hold Tokens
- Queue Monitoring

### 🛡️ Admin
- Department Management
- Staff Management
- Queue Management
- Appointment Monitoring
- User Management
- Analytics Dashboard

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Vite
- React Router
- Axios
- Tailwind CSS
- Socket.IO Client

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- Socket.IO
- Cloudinary (if enabled)

### Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## 📂 Project Structure

```
civicqueue-pro/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── utils/
│   └── server.js
│
└── README.md
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/your-username/civicqueue-pro.git

cd civicqueue-pro
```

### Backend

```bash
cd backend

npm install

npm run dev
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file inside the backend.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLIENT_URL=http://localhost:5173
```

---

## 📡 API Base URL

Production

```
https://civicqueue-pro.onrender.com/api/v1
```

---

## 📸 Screenshots

> Add screenshots of:
- Home Page
- Citizen Dashboard
- Staff Dashboard
- Admin Dashboard
- Appointment Booking
- Queue Tracking

---

## 🚀 Future Enhancements

- Email Notifications
- SMS Notifications
- QR Code Token Generation
- AI-based Queue Prediction
- Payment Integration
- Multi-language Support
- PWA Support
- Redis Caching

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

## 👨‍💻 Developer

**Samruddhi Patil**

GitHub: https://github.com/Samruddhi-techenthusiast

LinkedIn: www.linkedin.com/in/samruddhi-patil-31b739285

Email: samru2304@gmail.com
