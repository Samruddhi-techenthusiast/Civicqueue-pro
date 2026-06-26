import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";


import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import CitizenDashboard from "./pages/CitizenDashboard";
import QueueManagement from "./pages/QueueManagement";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
        

          {/* Role Based Login */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboards */}
          <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/queue-management" element={<QueueManagement />} />
          <Route path="/staff" element={<StaffDashboard />} />
          <Route path="/citizen" element={<CitizenDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
