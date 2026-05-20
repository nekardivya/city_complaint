const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/city_complaint";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@citycomplaint.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

app.use(cors());
app.use(express.json({ limit: "5mb" }));

const userSchema = new mongoose.Schema(
   {
     name: { type: String, required: true, trim: true },
     email: { type: String, required: true, unique: true, lowercase: true, trim: true },
     password: { type: String, required: true },
     mobile: { type: String, trim: true },
     address: { type: String, trim: true },
     gender: { type: String, trim: true },
     personType: { type: String, trim: true },
     profileImage: { type: String, trim: true },
     role: { type: String, enum: ["user", "admin"], default: "user" }
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

async function createDefaultAdmin() {
  const admin = await User.findOne({ email: ADMIN_EMAIL });

  if (admin) {
    if (admin.role !== "admin") {
      admin.role = "admin";
      admin.password = ADMIN_PASSWORD;
      await admin.save();
      console.log(`Existing user promoted to admin: ${ADMIN_EMAIL}`);
    }

    return;
  }

  await User.create({
    name: "Admin",
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin"
  });

  console.log(`Default admin created: ${ADMIN_EMAIL}`);
}

app.get("/", (req, res) => {
  res.send("Backend is running with MongoDB");
});

app.post("/register", async (req, res) => {
   try {
     const { name, email, password, mobile, address, gender, personType, profileImage } = req.body;

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
       address,
       gender,
       personType,
       profileImage
     });

     console.log("Registered user:", newUser.email);

     res.status(201).json({
       message: "User registered successfully. Please login.",
       user: {
         id: newUser._id,
         name: newUser.name,
         email: newUser.email,
         mobile: newUser.mobile,
         address: newUser.address,
         gender: newUser.gender,
         personType: newUser.personType,
         profileImage: newUser.profileImage,
         role: newUser.role
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
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        gender: user.gender,
        personType: user.personType,
        profileImage: user.profileImage,
        role: user.role || "user"
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

app.delete("/complaints/:id", async (req, res) => {
  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(401).json({ message: "Please login before deleting a complaint" });
    }

    const complaint = await Complaint.findOneAndDelete({
      _id: req.params.id,
      userEmail
    });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ message: "Complaint deleted successfully" });
  } catch (error) {
    console.error("Complaint delete error:", error.message);
    res.status(500).json({ message: "Error deleting complaint" });
  }
});

app.patch("/complaints/:id/status", async (req, res) => {
  try {
    const { adminEmail, status } = req.body;
    const allowedStatuses = ["Pending", "In Progress", "Fixed", "Closed"];

    const admin = await User.findOne({ email: adminEmail });

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Only admin can update complaint status" });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid complaint status" });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({
      message: "Complaint status updated successfully",
      complaint
    });
  } catch (error) {
    console.error("Complaint status update error:", error.message);
    res.status(500).json({ message: "Error updating complaint status" });
  }
});

app.get("/profile/:email", async (req, res) => {
   try {
     const user = await User.findOne({ email: req.params.email });

     if (!user) {
       return res.status(404).json({ message: "User not found" });
     }

     res.json({
       user: {
         id: user._id,
         name: user.name,
         email: user.email,
         mobile: user.mobile,
         address: user.address,
         gender: user.gender,
         personType: user.personType,
         profileImage: user.profileImage,
         role: user.role
       }
     });
   } catch (error) {
     console.error("Profile fetch error:", error.message);
     res.status(500).json({ message: "Error loading profile" });
   }
 });

app.patch("/profile/:email", async (req, res) => {
  try {
    const allowedFields = ["name", "mobile", "address", "gender", "personType", "profileImage"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      updates,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        gender: user.gender,
        personType: user.personType,
        profileImage: user.profileImage,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Profile update error:", error.message);
    res.status(500).json({ message: "Error updating profile" });
  }
});

 mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected");
    await createDefaultAdmin();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
