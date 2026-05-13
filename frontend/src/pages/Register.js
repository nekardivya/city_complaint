import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    stateCode: "",
    state: "",
    district: "",
    city: "",
    captcha: ""
  });
  const [captchaSeed, setCaptchaSeed] = useState(0);
  const [message, setMessage] = useState("");

  const captcha = useMemo(() => {
    const values = ["F Q H 5 5", "A 8 M 2 K", "T 6 Y 4 P"];
    return values[captchaSeed % values.length];
  }, [captchaSeed]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.captcha.replace(/\s/g, "") !== captcha.replace(/\s/g, "")) {
      setMessage("Captcha does not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setForm({
          name: "",
          email: "",
          mobile: "",
          password: "",
          stateCode: "",
          state: "",
          district: "",
          city: "",
          captcha: ""
        });
        setTimeout(() => navigate("/login"), 800);
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (error) {
      setMessage("Server error");
    }
  };

  return (
    <main className="register-page">
      <section className="register-card" aria-label="Register account form">
        <Link to="/" className="register-close" aria-label="Close register">
          x
        </Link>

        <form className="register-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Enter your Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Enter your Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="tel"
            name="mobile"
            placeholder="Enter your Mobile Number"
            value={form.mobile}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Create Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <p className="state-note">
            State code is required. Get it from your State Login Profile.
          </p>

          <input
            type="text"
            name="stateCode"
            placeholder="Enter State Code"
            value={form.stateCode}
            onChange={handleChange}
            required
          />

          <select name="state" value={form.state} onChange={handleChange} required>
            <option value="">Choose State</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Delhi">Delhi</option>
          </select>

          <select name="district" value={form.district} onChange={handleChange} required>
            <option value="">Choose District</option>
            <option value="Central">Central</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="West">West</option>
          </select>

          <select name="city" value={form.city} onChange={handleChange} required>
            <option value="">Choose City</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Chennai">Chennai</option>
            <option value="New Delhi">New Delhi</option>
          </select>

          <div className="register-captcha-row">
            <div className="register-captcha-box" aria-label={`Captcha ${captcha}`}>
              <span>{captcha}</span>
              <i />
              <i />
              <i />
            </div>
            <button
              type="button"
              className="register-captcha-refresh"
              aria-label="Refresh captcha"
              onClick={() => setCaptchaSeed((seed) => seed + 1)}
            />
          </div>

          <input
            type="text"
            name="captcha"
            placeholder="Enter Captcha"
            value={form.captcha}
            onChange={handleChange}
            required
          />

          <button className="register-submit" type="submit">
            Register Account
          </button>

          {message && <p className="register-message">{message}</p>}

          <Link className="register-login-link" to="/login">
            Back To Login
          </Link>
        </form>
      </section>
    </main>
  );
}

export default Register;
