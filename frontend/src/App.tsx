import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const App: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    socketRef.current = new WebSocket("ws://localhost:3002");

    socketRef.current.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
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
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      const newMessage = input;
      setInput("");

      // Adicionar a nova mensagem imediatamente à lista local
      setMessages((prev) => [...prev, newMessage]);

      axios
        .post("http://localhost:3001/api/messages", {
          message: newMessage,
          sender_id: 1,
          receiver_id: 2,
        })
        .then((response) => {
          console.log('Message sent successfully:', response.data);
        })
        .catch((error) => {
          console.error("Error sending message:", error);
        });
    }
  };

  useEffect(() => {
    // Rolagem automática para a última mensagem
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div>
      <div ref={messageContainerRef} style={{ height: '300px', overflowY: 'scroll' }}>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default App;
