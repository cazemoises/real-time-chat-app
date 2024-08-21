import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./styles.css"

const App: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:8081");
  
    socketRef.current.onopen = () => {
      console.log('Connected to MQ WebSocket server');
    };
  
    socketRef.current.onmessage = (event) => {
      console.log('Message received from MQ:', event.data);
      setMessages((prev) => [...prev, event.data]);
    };
  
    socketRef.current.onerror = (error) => {
      console.error('MQ WebSocket error:', error);
    };
  
    socketRef.current.onclose = () => {
      console.log('MQ WebSocket connection closed');
    };
  
    return () => {
      socketRef.current?.close();
    };
  }, []);
  

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/messages", {
        headers: {
          "Content-Type": "application/json",
        },

      })
      .then((response) => {
        setMessages(response.data.map((msg: any) => msg.content));
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });

      console.log(messages)
  }, []);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);  

  const sendMessage = () => {
    if (input.trim()) {
      axios.post("http://localhost:3001/api/messages", {
        message: input,
        sender_id: 1,
        receiver_id: 2,
      });
      setInput("");
    }
  };

  return (
    <div className="chat-container">
      <div className="messages" ref={messageContainerRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${index % 2 === 0 ? 'received' : 'sent'}`}>{msg}</div>
        ))}
      </div>
      <div className="input-container">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default App;
