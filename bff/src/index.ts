import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import axios from 'axios';

const app = express();
const HTTP_PORT = 3001;
const WEBSOCKET_PORT = 3002;

const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const wss = new WebSocketServer({ port: WEBSOCKET_PORT });

wss.on('connection', (ws) => {
  console.log('New frontend client connected');
  
  ws.on('message', (message) => {
    console.log(`Message from frontend: ${message}`);

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });

    axios.post('http://api_storage:8082/api/store', {
      message: message.toString(),
      sender_id: 1,
      receiver_id: 2,
    }).then(() => {
      console.log('Message stored in API storage');
    }).catch(err => {
      console.error('Error storing message:', err);
    });
  });

  ws.on('close', () => {
    console.log('Frontend client disconnected');
  });
});

app.listen(HTTP_PORT, () => {
  console.log(`BFF HTTP server running on port ${HTTP_PORT}`);
});

console.log(`BFF WebSocket server running on port ${WEBSOCKET_PORT}`);