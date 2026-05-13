import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./AddComplaint.css";

function buildAddressFromLocation(data, fallbackAddress) {
  const address = data.address || {};
  const street = [address.house_number, address.road || address.pedestrian]
    .filter(Boolean)
    .join(", ");
  const area = address.neighbourhood || address.suburb || address.quarter || address.residential;
  const city = address.city || address.town || address.village || address.municipality;
  const state = address.state;
  const postcode = address.postcode;
  const country = address.country;

  const formattedAddress = [
    street,
    area,
    city,
    address.state_district,
    state,
    postcode,
    country
  ].filter(Boolean).join(", ");

  return formattedAddress || data.display_name || fallbackAddress;
}

function buildAddressFromBigDataCloud(data, fallbackAddress) {
  return [
    data.localityInfo?.administrative?.[4]?.name,
    data.locality,
    data.city,
    data.principalSubdivision,
    data.postcode,
    data.countryName
  ].filter(Boolean).join(", ") || data.locality || fallbackAddress;
}

async function getAddressFromCoordinates(latitude, longitude, fallbackAddress) {
  const nominatimParams = new URLSearchParams({
    format: "jsonv2",
    addressdetails: "1",
    zoom: "18",
    "accept-language": "en",
    lat: String(latitude),
    lon: String(longitude)
  });

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${nominatimParams.toString()}`,
      {
        headers: {
          "Accept-Language": "en"
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      const address = buildAddressFromLocation(data, fallbackAddress);

      if (address !== fallbackAddress) {
        return address;
      }
    }
  } catch (error) {
    // Try the backup geocoder below.
  }

  const backupParams = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: "en"
  });
  const backupResponse = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?${backupParams.toString()}`
  );

  if (!backupResponse.ok) {
    return fallbackAddress;
  }

  const backupData = await backupResponse.json();
  return buildAddressFromBigDataCloud(backupData, fallbackAddress);
}

function AddComplaint() {
  const storedUser = localStorage.getItem("cityComplaintUser");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    address: "",
    type: "",
    mediaName: ""
  });

  const [message, setMessage] = useState("");
  const [addressStatus, setAddressStatus] = useState("");
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  if (!user) {
    return (
      <main className="complaint-page">
        <section className="complaint-card">
          <h2>Login Required</h2>
          <p className="complaint-message">
            Please register and login before adding a complaint.
          </p>
          <Link className="complaint-login-link" to="/register">
            Register Account
          </Link>
          <Link className="complaint-login-link" to="/login">
            Login
          </Link>
        </section>
      </main>
    );
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    setForm({
      ...form,
      mediaName: file ? file.name : ""
    });
  };

  const fillAddressFromLocation = async () => {
    if (!navigator.geolocation) {
      setAddressStatus("Location is not supported in this browser");
      return;
    }

    if (!window.isSecureContext) {
      setAddressStatus("Open this app on localhost or HTTPS to allow current location access.");
      return;
    }

    if (navigator.permissions?.query) {
      try {
        const permission = await navigator.permissions.query({ name: "geolocation" });

        if (permission.state === "denied") {
          setAddressStatus("Location permission is blocked. Enable it in browser site settings.");
          return;
        }
      } catch (error) {
        // Some browsers do not support querying geolocation permission.
      }
    }

    setIsFetchingLocation(true);
    setAddressStatus("Allow location access in the browser popup...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const fallbackAddress = `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`;

        try {
          const address = await getAddressFromCoordinates(latitude, longitude, fallbackAddress);

          setForm((currentForm) => ({
            ...currentForm,
            address
          }));
          setAddressStatus("Address added.");
        } catch (error) {
          setForm((currentForm) => ({
            ...currentForm,
            address: fallbackAddress
          }));
          setAddressStatus("Location added as coordinates");
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        setIsFetchingLocation(false);

        if (error.code === error.PERMISSION_DENIED) {
          setAddressStatus("Location permission was denied. Click allow in the browser popup.");
          return;
        }

        if (error.code === error.TIMEOUT) {
          setAddressStatus("Location request timed out. Turn on GPS and try again.");
          return;
        }

        setAddressStatus("Unable to fetch current location. Turn on GPS and try again.");
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/add-complaint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          userEmail: user.email
        })
      });

      const data = await res.json();
      setMessage(data.message);

      // clear form
      setForm({
        title: "",
        description: "",
        category: "",
        address: "",
        type: "",
        mediaName: ""
      });
      setAddressStatus("");

    } catch (error) {
      setMessage("Error submitting complaint");
    }
  };

  return (
    <main className="complaint-page">
      <section className="complaint-card">
        <h2>Add Complaint</h2>

        {message && <p className="complaint-message">{message}</p>}

        <form className="complaint-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Complaint Title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Describe your issue"
            value={form.description}
            onChange={handleChange}
            required
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Road">Road</option>
            <option value="Garbage">Garbage</option>
            <option value="Water">Water</option>
            <option value="Electricity">Electricity</option>
          </select>

          <div className="address-row">
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              onClick={fillAddressFromLocation}
              disabled={isFetchingLocation}
            >
              {isFetchingLocation ? "Fetching Location..." : "Use Current Location"}
            </button>
          </div>

          {addressStatus && <p className="address-status">{addressStatus}</p>}

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            required
          >
            <option value="">Select Type</option>
            <option value="Minor">Minor</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
            <option value="Critical">Critical</option>
          </select>

          <label className="media-upload">
            <span>Upload Photo or Video</span>
            <input
              type="file"
              name="media"
              accept="image/*,video/*"
              onChange={handleMediaChange}
            />
          </label>

          {form.mediaName && (
            <p className="media-name">Selected file: {form.mediaName}</p>
          )}

          <button className="complaint-submit" type="submit">
            Submit Complaint
          </button>
        </form>
      </section>
    </main>
  );
}

export default AddComplaint;
