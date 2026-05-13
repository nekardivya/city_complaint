import React, { useEffect, useMemo, useState } from "react";
import "./Dashboard.css";

const complaintStatuses = ["Pending", "In Progress", "Fixed", "Closed"];
const complaintTypes = ["Critical", "Severe", "Moderate", "Minor"];
const priorityOrder = {
  Critical: 1,
  Severe: 2,
  Moderate: 3,
  Minor: 4
};

function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [message, setMessage] = useState("Loading complaints...");
  const storedUser = localStorage.getItem("cityComplaintUser");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    fetch("http://localhost:5000/complaints")
      .then((res) => res.json())
      .then((data) => {
        setComplaints(Array.isArray(data) ? data : []);
        setMessage("");
      })
      .catch(() => {
        setMessage("Unable to load complaints");
      });
  }, []);

  const stats = useMemo(() => {
    const statusCounts = complaintStatuses.reduce((counts, status) => ({
      ...counts,
      [status]: complaints.filter((complaint) => (complaint.status || "Pending") === status).length
    }), {});

    const typeCounts = complaintTypes.reduce((counts, type) => ({
      ...counts,
      [type]: complaints.filter((complaint) => complaint.type === type).length
    }), {});

    return {
      total: complaints.length,
      statusCounts,
      typeCounts
    };
  }, [complaints]);

  const prioritySortedComplaints = useMemo(() => {
    return [...complaints].sort((firstComplaint, secondComplaint) => {
      const firstPriority = priorityOrder[firstComplaint.type] || 99;
      const secondPriority = priorityOrder[secondComplaint.type] || 99;

      if (firstPriority !== secondPriority) {
        return firstPriority - secondPriority;
      }

      return new Date(secondComplaint.createdAt || 0) - new Date(firstComplaint.createdAt || 0);
    });
  }, [complaints]);

  const handleStatusChange = async (complaintId, status) => {
    try {
      const res = await fetch(`http://localhost:5000/complaints/${complaintId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          adminEmail: user?.email,
          status
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Unable to update complaint status");
        return;
      }

      setComplaints((currentComplaints) =>
        currentComplaints.map((complaint) =>
          complaint._id === complaintId ? data.complaint : complaint
        )
      );
      setMessage(data.message);
    } catch (error) {
      setMessage("Unable to update complaint status");
    }
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <p className="dashboard-kicker">Admin Dashboard</p>
          <h1>Complaint Overview</h1>
        </div>
      </section>

      <section className="dashboard-stats" aria-label="Complaint overview totals">
        <article className="dashboard-total-card">
          <span>{stats.total}</span>
          <p>Total Complaints</p>
        </article>

        <article className="dashboard-summary-card">
          <h2>Status Totals</h2>
          <div className="dashboard-summary-grid">
            {complaintStatuses.map((status) => (
              <div key={status}>
                <span>{stats.statusCounts[status]}</span>
                <p>{status}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-summary-card">
          <h2>Type Totals</h2>
          <div className="dashboard-summary-grid">
            {complaintTypes.map((type) => (
              <div key={type}>
                <span>{stats.typeCounts[type]}</span>
                <p>{type}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="dashboard-list" aria-label="Priority sorted complaints">
        <h2>Priority Sorted Complaints</h2>

        {message && <p className="dashboard-message">{message}</p>}

        {!message && complaints.length === 0 && (
          <p className="dashboard-message">No complaints found</p>
        )}

        {prioritySortedComplaints.map((complaint) => (
          <article className="dashboard-complaint" key={complaint._id}>
            <div>
              <h3>{complaint.title}</h3>
              <p>{complaint.description}</p>
            </div>

            <dl>
              <div>
                <dt>User</dt>
                <dd>{complaint.userEmail}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{complaint.category}</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{complaint.type}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  <select
                    className="dashboard-status-select"
                    value={complaint.status || "Pending"}
                    onChange={(e) => handleStatusChange(complaint._id, e.target.value)}
                  >
                    {complaintStatuses.map((status) => (
                      <option value={status} key={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </dd>
              </div>
              <div>
                <dt>Address</dt>
                <dd>{complaint.address || "Not provided"}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </main>
  );
}

export default Dashboard;
