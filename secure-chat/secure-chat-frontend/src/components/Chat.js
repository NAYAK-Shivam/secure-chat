import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import {
  encryptAES,
  decryptAES,
  signMessage,
  generateAESKey,
} from "../utils/cryptoUtils";

const socket = io("http://localhost:5000");

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const userId = localStorage.getItem("userId");
  const privateKey = localStorage.getItem("privateKey") || "";

  useEffect(() => {
    if (!userId) return;

    // ✅ Fetch users as soon as the chat page loads
    axios
      .get(`http://localhost:5000/api/auth/users/${userId}`)
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error fetching users:", err));
  }, [userId]); // ✅ Runs only when `userId` changes

  useEffect(() => {
    if (!userId || !selectedUser) return;

    let privateKey = localStorage.getItem("privateKey");
    if (!privateKey) {
      alert("Upload your private key to continue.");
      return;
    }

    const sharedKey = generateAESKey(userId, selectedUser._id);

    axios
      .get(`http://localhost:5000/api/chat/${userId}/${selectedUser._id}`)
      .then((res) => {
        const decryptedMessages = res.data.map((msg) => ({
          sender: msg.sender.username,
          text: decryptAES(msg.encryptedMessage, sharedKey),
        }));
        setMessages(decryptedMessages);
      })
      .catch((err) => console.error("Error fetching messages:", err));

    socket.on("receiveMessage", (data) => {
      console.log("Received Message:", data); // ✅ Debugging log

      const receivedKey = generateAESKey(userId, data.sender);
      const decryptedMessage = decryptAES(data.encryptedMessage, receivedKey);

      console.log("Decrypted Message:", decryptedMessage); // ✅ Debugging log
      if (decryptedMessage === "Decryption failed!") {
        console.error("Message could not be decrypted!");
        return;
      }

      setMessages((prev) => [
        ...prev,
        { sender: data.sender, text: decryptedMessage },
      ]);
    });

    return () => socket.off("receiveMessage");
  }, [userId, selectedUser]); // ✅ No longer blocks user fetching

  const sendMessage = async () => {
    if (!selectedUser) {
      alert("Select a user to chat with!");
      return;
    }

    let privateKey = localStorage.getItem("privateKey");
    if (!privateKey) {
      privateKey = prompt("Enter your private key to proceed:");
      if (!privateKey) {
        alert("Private key is required!");
        return;
      }
      localStorage.setItem("privateKey", privateKey); // Store it for future use
    }

    const sharedKey = generateAESKey(userId, selectedUser._id);
    const encryptedMsg = encryptAES(message, sharedKey);

    if (!encryptedMsg) {
      alert("Encryption failed!");
      return;
    }

    const digitalSignature = signMessage(privateKey, encryptedMsg);
    if (!digitalSignature) {
      alert("Message signing failed!");
      return;
    }

    await axios.post("http://localhost:5000/api/chat/send", {
      sender: userId,
      receiver: selectedUser._id,
      message: encryptedMsg,
      digitalSignature,
    });

    socket.emit("sendMessage", {
      sender: userId,
      receiver: selectedUser._id,
      encryptedMessage: encryptedMsg,
    });

    setMessage("");
  };

  return (
    <div>
      <h2>Secure Chat</h2>
      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
        style={{ float: "right", background: "red", color: "white" }}
      >
        Logout
      </button>

      <h3>Select a user to chat with:</h3>
      {users.length > 0 ? (
        <ul>
          {users.map((user) => (
            <li key={user._id} onClick={() => setSelectedUser(user)}>
              {user.username} {selectedUser?._id === user._id ? "✅" : ""}
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading users...</p> // ✅ Show a loading message instead of "No users available"
      )}

      <h3>Chat with {selectedUser ? selectedUser.username : "..."}</h3>
      <div>
        {messages.map((msg, index) => (
          <p key={index}>
            <b>{msg.sender}</b>: {msg.text}
          </p>
        ))}
      </div>
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
