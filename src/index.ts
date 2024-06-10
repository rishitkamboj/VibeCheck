import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
const cors = require('cors');
import { v4 as uuidv4 } from 'uuid';



interface CustomWebSocket extends WebSocket {
  id?: string;
  color?: string;
}

const port =process.env.PORT|| 8080;

const app = express();
app.use(cors());
const httpServer = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

const COLORS = [
  '#800000', '#800000', '#008000',
  '#C00000', '#8B0000', '#8B00FF',
  '#00008B', '#C71585', '#D2B48C',
  '#008080', '#FF4500', '#FF6347',
  '#2E8B57', '#4682B4', '#FF7F50',
  '#BA55D3', '#7B68EE', '#6495ED',
  '#B0E0E6', '#ADD8E6', '#F0FFF0',
  '#FFEFD5', '#FFF5EE', '#F0F8FF',
  '#FAEBD7', '#FAF0E6', '#FFF0F5',
  '#FFE4E1', '#FFDEAD', '#FFE4B5',
  '#FFDAB9', '#FFE4C4', '#F5F5DC',
  '#F5DEB3', '#FFB6C1', '#FFA07A',
  '#FFD700', '#DAA520', '#FFC0CB',
  '#FF69B4', '#FFE4E1', '#FFFF00',
  '#FFA07A',
];


let connectedUsers = 0;

const wss = new WebSocketServer({ server: httpServer });

wss.on('connection', (ws: CustomWebSocket) => {
  ws.on('error', console.error);

  connectedUsers++;
  broadcastConnectedUsers();

  ws.on('message', (data, isBinary) => {
    if (!ws.id) {
      ws.id = data.toString();
      ws.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      ws.send(JSON.stringify({ userId: 'server', message: `Welcome, ${ws.id}! ` }));
    } else {
      console.log(`Message received from ${ws.id}: ${data}`);
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          (client as CustomWebSocket).send(JSON.stringify({ userId: ws.id, message: data.toString(), color: ws.color }), { binary: isBinary });
        }
      });
    }
  });

  ws.on('close', () => {
    connectedUsers--;
    broadcastConnectedUsers();
  });
});

function broadcastConnectedUsers() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ connectedUsers }));
    }
  });
}
