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
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

const wss = new WebSocketServer({ port: WEBSOCKET_PORT });

wss.on('connection', (ws: WebSocket) => {
  console.log('New WebSocket connection');

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Conexão com o serviço MQ
let mqSocket: WebSocket | null = null;

function connectToMQ() {
  mqSocket = new WebSocket(`ws://mq:8081`);

  mqSocket.on('open', () => {
    console.log('Connected to MQ service');
  });

  mqSocket.on('message', (message) => {
    console.log(`Message from MQ: ${message}`);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  mqSocket.on('close', () => {
    console.log('MQ WebSocket closed, reconnecting...');
    setTimeout(connectToMQ, 5000);
  });

  mqSocket.on('error', (err) => {
    console.error('MQ WebSocket error:', err);
  });
}

connectToMQ();

app.post('/api/messages', (req, res) => {
  const { message } = req.body;

  if (mqSocket && mqSocket.readyState === WebSocket.OPEN) {
    mqSocket.send(message);
    res.status(200).send('Message sent to MQ');
  } else {
    res.status(500).send('MQ connection not open');
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const response = await axios.get('http://api_storage:8082/api/messages');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send('Error fetching messages');
  }
});

app.listen(HTTP_PORT, () => {
  console.log(`BFF HTTP server running on port ${HTTP_PORT}`);
});

console.log(`WebSocket server running on port ${WEBSOCKET_PORT}`);
