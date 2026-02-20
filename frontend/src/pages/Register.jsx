import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "citizen"
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", form);
      alert("Registered Successfully");
      navigate("/login");
    } catch {
      alert("Error registering");
    }
  };

  return (
    <>
      {/* Internal CSS */}
      <style>{`
        body {
          margin: 0;
          font-family: 'Roboto', sans-serif;
        }

        .register-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #eef2ff, #e0e7ff, #f3e8ff);
          padding: 20px;
        }

        .register-card {
          background: #ffffff;
          width: 100%;
          max-width: 520px;
          padding: 50px;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
          border: 2px solid #6366f1;
        }

        .logo {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }

        .logo img {
          width: 100px;
        }

        .register-title {
          text-align: center;
          font-size: 26px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 30px;
        }

        .form-control {
          width: 100%;
          height: 60px;
          border: none;
          border-radius: 10px;
          background: #f1f5f9;
          padding: 0 20px;
          font-size: 16px;
          margin-bottom: 20px;
          transition: 0.3s;
        }

        .form-control:focus {
          outline: none;
          background: #e0e7ff;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
        }

        .btn-primary {
          width: 100%;
          height: 60px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(to right, #4f46e5, #7c3aed);
          color: white;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s ease;
        }

        .btn-primary:hover {
          background: linear-gradient(to right, #4338ca, #6d28d9);
          transform: translateY(-2px);
        }

        .login-text {
          text-align: center;
          margin-top: 25px;
          font-size: 15px;
          color: #64748b;
        }

        .login-text span {
          color: #2563eb;
          font-weight: 600;
          cursor: pointer;
        }

        .login-text span:hover {
          text-decoration: underline;
        }
      `}</style>

      {/* Layout */}
      <div className="register-container">
        <div className="register-card">

          {/* Logo */}
          <div className="logo">
            <img src="/images/civicQueue.png" alt="CivicQueue Logo" />
          </div>

          <div className="register-title">Create Your Account</div>

          <form onSubmit={handleSubmit}>

            <input
              type="text"
              className="form-control"
              placeholder="Full Name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />

            <input
              type="email"
              className="form-control"
              placeholder="Email Address"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <input
              type="password"
              className="form-control"
              placeholder="Password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />

            <select
              className="form-control"
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="citizen">Citizen</option>
              <option value="staff">Staff</option>
            </select>

            <button type="submit" className="btn-primary">
              Register Account
            </button>

          </form>

          <div className="login-text">
            Already have an account?{" "}
            <span onClick={() => navigate("/")}>
              Login here
            </span>
          </div>

        </div>
      </div>
    </>
  );
};

export default Register;
