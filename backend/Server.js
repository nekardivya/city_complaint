const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/city_complaint";

app.use(cors());
app.use(express.json());

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    mobile: { type: String, trim: true },
    stateCode: { type: String, trim: true },
    state: { type: String, trim: true },
    district: { type: String, trim: true },
    city: { type: String, trim: true }
  },
  { timestamps: true }
);

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    mediaName: { type: String, trim: true },
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    status: { type: String, default: "Pending" }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Complaint = mongoose.model("Complaint", complaintSchema);

app.get("/", (req, res) => {
  res.send("Backend is running with MongoDB");
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password, mobile, stateCode, state, district, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "This email is already registered" });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      mobile,
      stateCode,
      state,
      district,
      city
    });

    console.log("Registered user:", newUser.email);

    res.status(201).json({
      message: "User registered successfully. Please login.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Please register before login" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Login failed" });
  }
});

app.post("/add-complaint", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      address,
      type,
      mediaName,
      userEmail
    } = req.body;

    if (!userEmail) {
      return res.status(401).json({ message: "Please login before adding a complaint" });
    }

    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(401).json({ message: "Please register before adding a complaint" });
    }

    await Complaint.create({
      title,
      description,
      category,
      address,
      type,
      mediaName,
      userEmail: user.email
    });

    console.log("Complaint received from:", user.email);

    res.json({ message: "Complaint submitted successfully" });
  } catch (error) {
    console.error("Complaint error:", error.message);
    res.status(500).json({ message: "Error submitting complaint" });
  }
});

app.get("/complaints", async (req, res) => {
  try {
    const filter = req.query.userEmail ? { userEmail: req.query.userEmail } : {};
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error("Complaints fetch error:", error.message);
    res.status(500).json({ message: "Error loading complaints" });
  }
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
