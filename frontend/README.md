CivicQueue – Smart Queue Management System

Description:

CivicQueue is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application designed to digitize and streamline queue management in civic service centers such as municipal offices, hospitals, banks, and government departments. The system allows citizens to book service tokens online and track their queue status in real-time. Administrators can manage services, monitor the queue dashboard, and call the next citizen efficiently. Real-time updates are powered using Socket.IO to ensure seamless communication between users and the system.

Features:

👤 Citizen Module

    User Registration & Login
    View available services
    Book token for a selected service
    View token status (Waiting / Called / Completed)
    Receive real-time queue updates

🛠 Admin Module

    Secure Admin Login
    Create and manage services
    View live queue dashboard
    Call next citizen
    Mark token as completed
    Real-time queue synchronization using Socket.IO

Tech Stack
Frontend

    React.js
    Axios
    Socket.IO Client
    CSS

Backend

    Node.js
    Express.js
    MongoDB
    Mongoose
    JWT Authentication
    Socket.IO

Tools

    VS Code
    Postman
    MongoDB Compass
    Git & GitHub
    Nodemon

5️⃣ Installation
Step 1: Clone the Repository

git clone https://github.com/your-username/civicqueue.git
cd civicqueue


## Step 2: Install Backend Dependencies

```bash
cd backend
npm install


## Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install


# 6️⃣ Environment Variables

Create a `.env` file inside the **backend** folder and add the following:

MONGO_URI=mongodb+srv://sam:sam123@cluster0.f5glnr1.mongodb.net/civicqueue PORT=5001 JWT_SECRET=civicqueue_secret
7️⃣ Running the App
Start Backend Server

cd backend
npm run dev

Backend will run on:

http://localhost:5001

Start Frontend Application

cd frontend
npm start

Frontend will run on: http://localhost:5173


 ## Project Structure

CivicQueue/ │ ├── backend/ │ ├── server.js │ ├── src/ │ │ ├── models/ │ │ ├── routes/ │ │ ├── middleware/ │ │ └── controllers/ │ ├── frontend/ │ ├── src/ │ │ ├── pages/ │ │ ├── components/ │ │ └── services/ │ └── README.md

Author: Samruddhi Patil
