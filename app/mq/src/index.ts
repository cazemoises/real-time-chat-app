import { WebSocketServer } from 'ws';
import axios from 'axios';

const WEBSOCKET_PORT = 8081;

const wss = new WebSocketServer({ port: WEBSOCKET_PORT });

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', async (message) => {
    console.log(`Received message: ${message}`);
    
    try {
      const response = await axios.post('http://api_storage:8082/api/store', {
        message: message.toString(),
        sender_id: 1,
        receiver_id: 2
      });
  
      console.log('Message stored in API storage:', response.data);
    } catch (error) {
      console.error('Error storing message in API storage:', error);
    }
  
    console.log('Broadcasting message to all connected clients');
    wss.clients.forEach(client => {
      if (client.readyState === ws.OPEN) {
        client.send(message.toString());
        console.log('Message sent to client:', message.toString());
      }
    });
  });
  

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log(`MQ WebSocket server running on port ${WEBSOCKET_PORT}`);
