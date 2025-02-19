require("dotenv").config();
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
//const socketIo = require("socket.io");
const { Server } = require("socket.io");
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(cors());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // ✅ Allow frontend access
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("sendMessage", (data) => {
    io.emit("receiveMessage", data); // Broadcast message to all users
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error:", err));

server.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
});
