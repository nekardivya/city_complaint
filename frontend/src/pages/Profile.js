import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const { email } = useParams();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    address: "",
    gender: "",
    personType: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isPhotoEditing, setIsPhotoEditing] = useState(false);
  const [message, setMessage] = useState("Loading profile...");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`http://localhost:5000/profile/${encodeURIComponent(email)}`);
        const data = await res.json();

        if (!res.ok) {
          setMessage(data.message || "Profile not found");
          return;
        }

        setUser(data.user);
        setForm({
          name: data.user.name || "",
          mobile: data.user.mobile || "",
          address: data.user.address || "",
          gender: data.user.gender || "",
          personType: data.user.personType || ""
        });
        setMessage("");
      } catch (error) {
        setMessage("Server error while loading profile");
      }
    }

    loadProfile();
  }, [email]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setIsPhotoEditing(false);
    setMessage("");
  };

  const handleCancel = () => {
    setForm({
      name: user.name || "",
      mobile: user.mobile || "",
      address: user.address || "",
      gender: user.gender || "",
      personType: user.personType || ""
    });
    setIsEditing(false);
    setMessage("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage("Saving profile...");

    try {
      const res = await fetch(`http://localhost:5000/profile/${encodeURIComponent(email)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Profile update failed");
        return;
      }

      setUser(data.user);
      localStorage.setItem("cityComplaintUser", JSON.stringify(data.user));
      setIsEditing(false);
      setMessage(data.message);
    } catch (error) {
      setMessage("Server error while saving profile");
    }
  };

  const updateProfileImage = async (profileImage) => {
    setMessage("Saving picture...");

    try {
      const res = await fetch(`http://localhost:5000/profile/${encodeURIComponent(email)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ profileImage })
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Picture update failed");
        return;
      }

      setUser(data.user);
      localStorage.setItem("cityComplaintUser", JSON.stringify(data.user));
      setIsPhotoEditing(false);
      setMessage(profileImage ? "Picture updated successfully" : "Picture deleted successfully");
    } catch (error) {
      setMessage("Server error while saving picture");
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => updateProfileImage(reader.result);
    reader.readAsDataURL(file);
  };

  const initials = (user?.name || user?.email || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const details = [
    ["Full Name", user?.name],
    ["Email", user?.email],
    ["Mobile Number", user?.mobile],
    ["Gender", user?.gender],
    ["Person Type", user?.personType],
    ["Address", user?.address]
  ];

  return (
    <main className="profile-page">
      <section className="profile-panel" aria-label="User profile details">
        {message && <p className="profile-message">{message}</p>}

        {user && (
          <>
            <div className="profile-header">
              <div className="profile-photo-block">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name || "User profile"} />
                ) : (
                  <div className="profile-avatar" aria-label="Profile initials">
                    {initials}
                  </div>
                )}

                <button
                  className="profile-photo-edit"
                  type="button"
                  onClick={() => {
                    setIsPhotoEditing((value) => !value);
                    setMessage("");
                  }}
                  aria-label="Edit profile picture"
                >
                  &#9998;
                </button>

                {isPhotoEditing && (
                  <div className="profile-photo-actions">
                    <label>
                      Choose
                      <input type="file" accept="image/*" onChange={handlePhotoChange} />
                    </label>
                    {user.profileImage && (
                      <button type="button" onClick={() => updateProfileImage("")}>
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h1>{user.name || "User Profile"}</h1>
                <p>{user.personType || "Registered user"}</p>
              </div>
            </div>

            {isEditing ? (
              <form className="profile-edit-form" onSubmit={handleSave}>
                <label>
                  <span>Full Name</span>
                  <input name="name" value={form.name} onChange={handleChange} required />
                </label>

                <label>
                  <span>Email</span>
                  <input value={user.email} disabled />
                </label>

                <label>
                  <span>Mobile Number</span>
                  <input
                    className="mobile-input"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    inputMode="numeric"
                    maxLength="10"
                    pattern="[0-9]{10}"
                    required
                  />
                </label>

                <label>
                  <span>Address</span>
                  <input name="address" value={form.address} onChange={handleChange} required />
                </label>

                <label>
                  <span>Gender</span>
                  <select name="gender" value={form.gender} onChange={handleChange} required>
                    <option value="">Choose Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label>
                  <span>Person Type</span>
                  <select name="personType" value={form.personType} onChange={handleChange} required>
                    <option value="">Select Person Type</option>
                    <option value="Employee">Employee</option>
                    <option value="Own Business">Own Business</option>
                    <option value="Student">Student</option>
                    <option value="Housewife">Housewife</option>
                    <option value="Retired">Retired</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <div className="profile-actions">
                  <button className="profile-action" type="submit">
                    Save
                  </button>
                  <button className="profile-action secondary" type="button" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <dl className="profile-details">
                  {details.map(([label, value]) => (
                    <div className={label === "Address" ? "profile-detail-wide" : ""} key={label}>
                      <dt>{label}</dt>
                      <dd>{value || "Not provided"}</dd>
                    </div>
                  ))}
                </dl>

                <button className="profile-action" type="button" onClick={handleEdit}>
                  Edit
                </button>
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default Profile;
