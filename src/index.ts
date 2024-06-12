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
   "#800000", "#800000", "#C00000", "#8B0000", "#00008B", "#C71585", "#4682B4", 
  "#BA55D3", "#7B68EE", "#6495ED", "#F5DEB3", "#FFB6C1", "#FFA07A", "#FFD700", 
  "#DAA520", "#FFC0CB", "#FF69B4", "#4B0082", "#2F4F4F", "#9932CC", "#8A2BE2", 
  "#556B2F", "#8B4513", "#483D8B", "#8B4513", "#9932CC", "#556B2F", "#8B4513", "#483D8B"
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
