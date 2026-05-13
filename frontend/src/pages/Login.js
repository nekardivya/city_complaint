import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem("cityComplaintUser", JSON.stringify(data.user));
      setMessage("Login successful");
      navigate(data.user.role === "admin" ? "/dashboard" : "/add-complaint");
    } catch (error) {
      setMessage("Server error");
    }
  };

  return (
    <main className="login-page">
      <section className="login-card" aria-label="Login form">
        <Link to="/" className="login-close" aria-label="Close login">
          x
        </Link>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button className="login-submit" type="submit">
            Login
          </button>

          {message && <p className="login-message">{message}</p>}

          <div className="login-links">
            <Link to="/forgot-password">Forgot password?</Link>
            <Link to="/register">Register Here</Link>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Login;
