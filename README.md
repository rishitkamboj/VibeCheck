# WebSocket Chat Server

This project is a WebSocket-based chat server built with Node.js, Express, and the `ws` library. It manages WebSocket connections, handles incoming messages, assigns random colors to users, and broadcasts the number of connected users.

## Features

- WebSocket server for real-time communication
- Assigns a random color to each connected user
- Broadcasts the count of connected users to all clients
- Handles user messages and broadcasts them to all connected clients

## Setup

### Prerequisites

- Node.js
- npm (or yarn)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/websocket-chat-server.git
    cd websocket-chat-server
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory to specify environment variables. For example:

    ```plaintext
    PORT=8080
    ```

### Running the Server

1. Start the server:

    ```bash
    npm start
    ```

2. The server will start and listen on the specified port (default is 8080). You should see a message like:

    ```bash
    Server is listening on port 8080
    ```

## Code Explanation

### Server Initialization

The server is initialized using Express and `ws`. CORS is enabled to allow cross-origin requests:

```typescript
import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
const cors = require('cors');
import { v4 as uuidv4 } from 'uuid';

interface CustomWebSocket extends WebSocket {
  id?: string;
  color?: string;
}

const port = process.env.PORT || 8080;

const app = express();
app.use(cors());
const httpServer = app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

const COLORS = [/* array of color codes */];
```

### WebSocket Connection Handling

When a new WebSocket connection is established, a user ID and random color are assigned. The server listens for messages and broadcasts them to all connected clients:

```typescript
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
      ws.send(JSON.stringify({ userId: 'server', message: `Welcome, ${ws.id}!` }));
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
```

### Broadcasting Connected Users

The number of connected users is broadcast to all clients whenever a connection is opened or closed:

```typescript
function broadcastConnectedUsers() {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ connectedUsers }));
    }
  });
}
```

## Environment Variables

### PORT

Specify the port on which the server should listen. If not set, the default port is 8080.

```plaintext
PORT=8080
```

## Deployment

To deploy the server, ensure your production environment has Node.js installed and the necessary environment variables set. Then, start the server using the appropriate process manager (e.g., `pm2`, `forever`, or a service like Heroku).

### Example with `pm2`

1. Install `pm2` globally:

    ```bash
    npm install -g pm2
    ```

2. Start the server with `pm2`:

    ```bash
    pm2 start dist/index.js --name websocket-chat-server
    ```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Acknowledgements

- [Express](https://expressjs.com/)
- [ws](https://github.com/websockets/ws)
- [CORS](https://www.npmjs.com/package/cors)
- [uuid](https://www.npmjs.com/package/uuid)

---

Feel free to update the repository URL and any other details specific to your project.
