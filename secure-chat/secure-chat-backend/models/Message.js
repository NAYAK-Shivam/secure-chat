const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  encryptedMessage: { type: String, required: true }, // AES Encrypted
  digitalSignature: { type: String, required: true }, // RSA-Signed
});

module.exports = mongoose.model("Message", MessageSchema);
