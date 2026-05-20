import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { getCurrentUser, isAdminUser } from "../utils/auth";
import "./Navbar.css";

function Navbar() {
  const { pathname } = useLocation();
  const user = getCurrentUser();
  const showDashboard = isAdminUser(user);

  return (
    <header className="site-header">
      <NavLink to="/" className="header-brand" aria-label="City Complaint System home">
        <span className="brand-mark">CC</span>
        <span>
          <strong>City Complaint</strong>
          <small>Clean city support</small>
        </span>
      </NavLink>

      <nav className="header-nav" aria-label="Primary navigation" data-route={pathname}>
        <NavLink to="/" end>
          Home
        </NavLink>

        <NavLink to="/add-complaint">
          Add Complaint
        </NavLink>

        <NavLink to="/my-complaints">
          My Complaints
        </NavLink>

        {showDashboard && (
          <NavLink to="/dashboard">
            Dashboard
          </NavLink>
        )}

        <NavLink className="register-link" to="/register">
          Register
        </NavLink>

        <NavLink to="/login">
          Login
        </NavLink>
        
        {user && (
          <NavLink to={`/profile/${user.email}`}>
            Profile
          </NavLink>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
