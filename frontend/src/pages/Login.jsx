import { useState } from "react";
import { useAuth } from "../features/auth/features.authContext";
import { useNavigate, Link } from "react-router-dom";
import "../styles/auth.css";   // important

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("FORM SUBMITTED", form);

  try {
    await login(form);
    navigate("/home");
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    setError("ACCESS DENIED");
  }
};

  return (
    <div className="auth-container">

      {/* Top Left Branding (same as home) */}
      <div className="auth-header">
        <h1>DEBUG RACE</h1>
        <p>Decode • Optimize • Accelerate</p>
      </div>

      {/* Card */}
      <div className="auth-card">

        <h2 className="auth-title">LOGIN TERMINAL</h2>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="input-group">
            <label>EMAIL</label>
            <input
              type="email"
              required
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <div className="input-group">
            <label>PASSWORD</label>
            <input
              type="password"
              required
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          <button type="submit" className="primary-btn">
            IGNITE ENGINE
          </button>

        </form>

        <p className="switch-link">
          NEW RACER? <Link to="/register">CREATE ACCOUNT</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;