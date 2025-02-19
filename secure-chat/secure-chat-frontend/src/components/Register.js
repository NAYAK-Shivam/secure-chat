import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { generateRSAKeyPair } from "../utils/cryptoUtils";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { privateKey, publicKey } = generateRSAKeyPair();

      // Save private key in a downloadable file
      const blob = new Blob([privateKey], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "privateKey.pem"; // Users must save this file
      link.click();

      await axios.post("http://localhost:5000/api/auth/register", {
        username,
        password,
        rsaPublicKey: publicKey, // Store only the public key in backend
      });

      alert("User Registered! Please keep your private key safe.");
      navigate("/"); // Redirect to login
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      setError("Registration failed. Try again.");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <a href="/">Login here</a>
      </p>
    </div>
  );
};

export default Register;
