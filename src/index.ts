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
  '#FF5733', '#FF33E9', '#E9FF33',
  '#FF0000', '#800000', '#FF8000', '#800000', '#FF8000', '#008000',
  '#C00000', '#FFC000', '#00C000', '#C0C000',
  '#0000C0', '#8B0000', '#FF8B00', '#8B00FF',
  '#00008B', '#A9A9A9', '#D3D3D3', '#F0F0F0', '#90EE90', 
  '#FF00FF', '#00CED1', '#9400D3', '#FFD700', '#FFA500',  
  '#C71585', '#DA70D6', '#EEE8AA', '#4169E1', '#EE82EE',  
  '#D2B48C', '#008080', '#F08080', '#FF1493', '#DC143C',  
  '#FF6347', '#2E8B57', '#4682B4', '#F4A460', '#FA8072',  
  '#FF4500', '#32CD32', '#00FFFF', '#FF69B4', '#7CFC00',  
  '#FF7F50', '#BA55D3', '#7B68EE', '#6495ED', '#B0E0E6',  
  '#ADD8E6', '#FFDAB9', '#F0FFF0', '#FFEFD5', '#FFF5EE',  
  '#F0F8FF', '#FAEBD7', '#FAF0E6', '#FFF0F5', '#FFE4E1',  
  '#FFDEAD', '#FFE4B5', '#FFDAB9', '#FFE4C4', '#F5F5DC',  
  '#F5DEB3', '#FFB6C1', '#FFA07A', '#FFD700', '#DAA520',  
  '#FFC0CB', '#FF69B4', '#FFE4E1', '#FFFF00', '#FFA07A'
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
