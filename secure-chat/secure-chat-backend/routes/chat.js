const express = require("express");
const Message = require("../models/Message");

const router = express.Router();

// Send Encrypted Message
router.post("/send", async (req, res) => {
  try {
    const { sender, receiver, message, digitalSignature } = req.body;

    if (!sender || !receiver || !message || !digitalSignature) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newMessage = new Message({
      sender,
      receiver,
      encryptedMessage: message,
      digitalSignature,
    });
    await newMessage.save();

    res.json({ message: "Message sent securely!" });
  } catch (err) {
    console.error("Message send error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:userId/:chatPartnerId", async (req, res) => {
  try {
    const { userId, chatPartnerId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: chatPartnerId },
        { sender: chatPartnerId, receiver: userId },
      ],
    }).populate("sender", "username");

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
