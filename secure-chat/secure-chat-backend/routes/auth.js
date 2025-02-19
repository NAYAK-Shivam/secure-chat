const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../config");

const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
  try {
    const { username, password, rsaPublicKey } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
      rsaPublicKey,
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      userId: user._id,
      rsaPublicKey: user.rsaPublicKey,
    }); // ✅ Ensure this is always returned
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/users/:userId", async (req, res) => {
  try {
    console.log("Fetching users excluding:", req.params.userId);
    const users = await User.find(
      { _id: { $ne: req.params.userId } },
      "username _id"
    );
    console.log("Users found:", users); // ✅ Debugging line

    if (users.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }

    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
