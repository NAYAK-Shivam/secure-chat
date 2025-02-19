import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handlePrivateKeyUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        localStorage.setItem("privateKey", e.target.result); // Store in localStorage
        alert("Private key uploaded successfully!");
      };
      reader.readAsText(file);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });

      if (!res.data) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem("publicKey", res.data.rsaPublicKey);

      // Check if private key is available
      let privateKey = localStorage.getItem("privateKey");
      if (!privateKey) {
        alert("Upload your private key to continue.");
        return;
      }

      navigate("/chat"); // Redirect to chat page
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      setError("Invalid username or password");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>
      <h3>Upload Private Key:</h3>
      <input type="file" accept=".pem" onChange={handlePrivateKeyUpload} />
      <p>
        Don't have an account?{" "}
        <button onClick={() => navigate("/register")}>Register</button>
      </p>
    </div>
  );
};

export default Login;
