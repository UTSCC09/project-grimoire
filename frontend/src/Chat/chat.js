import React, { useState, useEffect } from "react";
import { Button, TextField } from "@mui/material";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [groupId, setGroupId] = useState("");

  useEffect(() => {
    // Fetch chat messages from the server
    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/messages/:groupId");
        const json = await response.json();
        setMessages(json);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    // Call the fetchMessages function
    fetchMessages();
  }, []); 

  const sendMessage = async () => {
    try {
      const response = await fetch("/api/messages/:groupId", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newMessage }),
      });

      const json = await response.json();

      // Update the local state with the new message
      setMessages([...messages, json]);

      // Clear the input field after sending the message
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div>
      <h1>Chat</h1>
      <div>
        <ul>
          {messages.map((message) => (
            <li key={message._id}>{`${message.sender}: ${message.content}`}</li>
          ))}
        </ul>
      </div>
      <div>
        <TextField
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button onClick={sendMessage} disabled={!newMessage}>
          Send
        </Button>
      </div>
    </div>
  );
}

export default Chat;