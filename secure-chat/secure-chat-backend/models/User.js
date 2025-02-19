const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rsaPublicKey: { type: String, required: true }, // Stores the user's RSA public key
});

module.exports = mongoose.model("User", UserSchema);
