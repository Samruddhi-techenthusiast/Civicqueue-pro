import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [role, setRole] = useState("citizen");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault(); // VERY IMPORTANT

  try {
    const response = await fetch(
      "http://localhost:5001/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();
   
    if (response.ok) {
      // Check if the user's role matches the selected role
      if (data.role !== role) {
        alert(`You cannot login as ${role}. Your account is ${data.role}.`);
        return; // Stop login
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);

      alert("Login successful!");

      // Redirect based on role
      if (data.role === "admin") {
        navigate("/admin");
      } else if (data.role === "staff") {
        navigate("/staff");
      } else {
        navigate("/citizen");
      }
    } else {
      alert(data.message || "Login failed");
    }
  } catch (error) {
    console.error(error);
    alert("Server error");
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

        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #eef2ff, #e0e7ff, #f3e8ff);
          padding: 20px;
        }

        .login-card {
          background: #ffffff;
          width: 100%;
          max-width: 500px;
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

        .login-title {
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

        .register-text {
          text-align: center;
          margin-top: 25px;
          font-size: 15px;
          color: #64748b;
        }

        .register-text span {
          color: #2563eb;
          font-weight: 600;
          cursor: pointer;
        }

        .register-text span:hover {
          text-decoration: underline;
        }

        .role-tabs {
          display: flex;
          border: 1px solid #c7d2fe;
          border-radius: 10px;
          margin-bottom: 25px;
          overflow: hidden;
        }

        .role-btn {
          flex: 1;
          padding: 12px;
          background: #fff;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        .role-btn.active {
          background: #4f46e5;
          color: white;
        }

        .role-btn:hover {
          background: #eef2ff;
        }
      `}</style>

      {/* Layout */}
      <div className="login-container">
        <div className="login-card">

          {/* Logo */}
          <div className="logo">
            <img src="/images/civicQueue.png" alt="CivicQueue Logo" />
          </div>

          <div className="login-title">Sign in</div>

          {/* Role Tabs */}
          <div className="role-tabs">
            {["citizen", "staff", "admin"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRole(item)}
                className={`role-btn ${role === item ? "active" : ""}`}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit" className="btn-primary">
              Login as {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          </form>

          <div className="register-text">
            Don’t have an account?{" "}
            <span onClick={() => navigate("/register")}>
              Register here
            </span>
          </div>

        </div>
      </div>
    </>
  );
}

export default Login;
