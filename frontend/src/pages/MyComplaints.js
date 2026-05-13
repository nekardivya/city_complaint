import React, { useEffect, useMemo, useState } from "react";
import "./MyComplaints.css";

function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("");
  const user = useMemo(() => {
    const storedUser = localStorage.getItem("cityComplaintUser");
    return storedUser ? JSON.parse(storedUser) : null;
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    fetch(`http://localhost:5000/complaints?userEmail=${encodeURIComponent(user.email)}`)
      .then(res => res.json())
      .then(data => setComplaints(data))
      .catch(() => setMessage("Unable to load complaints"));
  }, [user]);

  const handleDelete = async (complaintId) => {
    if (!user) {
      setMessage("Please login before deleting a complaint");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/complaints/${complaintId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userEmail: user.email
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Error deleting complaint");
        return;
      }

      setComplaints((currentComplaints) =>
        currentComplaints.filter((complaint) => complaint._id !== complaintId)
      );
      setMessage(data.message);
    } catch (error) {
      setMessage("Error deleting complaint");
    }
  };

  return (
    <main className="my-complaints-page">
      <h2>My Complaints</h2>

      {message && <p className="my-complaints-message">{message}</p>}

      {complaints.length === 0 ? (
        <p>No complaints found</p>
      ) : (
        complaints.map((complaint) => (
          <article className="my-complaint-card" key={complaint._id}>
            <div className="my-complaint-header">
              <h3>{complaint.title}</h3>
              <button
                className="delete-complaint-button"
                type="button"
                onClick={() => handleDelete(complaint._id)}
              >
                Delete
              </button>
            </div>

            <p><b>Description:</b> {complaint.description}</p>
            <p><b>Category:</b> {complaint.category}</p>
            <p><b>Address:</b> {complaint.address || "Not provided"}</p>
            <p><b>Type:</b> {complaint.type || "Not provided"}</p>
            <p><b>Media:</b> {complaint.mediaName || "No file uploaded"}</p>
            <p><b>Status:</b> {complaint.status || "Pending"}</p>
          </article>
        ))
      )}
    </main>
  );
}

export default MyComplaints;
