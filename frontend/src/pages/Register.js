import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    address: "",
    profileImage: "",
    gender: "",
    personType: ""
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setForm({
        ...form,
        profileImage: ""
      });
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm({
        ...form,
        profileImage: reader.result
      });
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        localStorage.setItem("cityComplaintUser", JSON.stringify(data.user));
        setForm({
          name: "",
          email: "",
          mobile: "",
          password: "",
          address: "",
          profileImage: "",
          gender: "",
          personType: ""
        });
        setTimeout(() => navigate(`/profile/${data.user.email}`), 800);
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
          <label className="register-field" htmlFor="register-name">
            <span>Full Name</span>
            <input
              id="register-name"
              type="text"
              name="name"
              placeholder="Enter your Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>

          <label className="register-field" htmlFor="register-email">
            <span>Email</span>
            <input
              id="register-email"
              type="email"
              name="email"
              placeholder="Enter your Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>

          <label className="register-field compact-field" htmlFor="register-mobile">
            <span>Mobile Number</span>
            <input
              id="register-mobile"
              className="mobile-input"
              type="tel"
              name="mobile"
              placeholder="Mobile Number"
              value={form.mobile}
              onChange={handleChange}
              inputMode="numeric"
              maxLength="10"
              pattern="[0-9]{10}"
              required
            />
          </label>

          <label className="register-field" htmlFor="register-password">
            <span>Password</span>
            <input
              id="register-password"
              type="password"
              name="password"
              placeholder="Create Password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <label className="register-field" htmlFor="register-address">
            <span>Address</span>
            <input
              id="register-address"
              type="text"
              name="address"
              placeholder="Enter your Address"
              value={form.address}
              onChange={handleChange}
              required
            />
          </label>

          <fieldset className="register-field gender-field">
            <legend>Gender</legend>
            <div className="form-row">
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={form.gender === "Male"}
                  onChange={handleChange}
                  required
                />
                Male
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={form.gender === "Female"}
                  onChange={handleChange}
                />
                Female
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="gender"
                  value="Other"
                  checked={form.gender === "Other"}
                  onChange={handleChange}
                />
                Other
              </label>
            </div>
          </fieldset>

          <label className="register-field" htmlFor="register-person-type">
            <span>Person Type</span>
            <select
              id="register-person-type"
              name="personType"
              value={form.personType}
              onChange={handleChange}
              required
            >
              <option value="">Select Person Type</option>
              <option value="Employee">Employee</option>
              <option value="Own Business">Own Business</option>
              <option value="Student">Student</option>
              <option value="Housewife">Housewife</option>
              <option value="Retired">Retired</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label className="picture-field">
            <span>Profile Picture</span>
            <input
              type="file"
              name="profileImage"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>

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
