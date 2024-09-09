import { Server } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

interface SocketServerResponse extends NextApiResponse {
  socket: any;
}

let io: Server | undefined;

export default function handler(req: NextApiRequest, res: SocketServerResponse) {
  if (!io) {
    // Initialize the WebSocket server if it's not already initialized
    console.log('Starting Socket.io server...');
    io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      console.log('A user connected', socket.id);

      // Listen for incoming messages
      socket.on('sendMessage', (messageData) => {
        console.log('Received message:', messageData);
        // Broadcast the message to all clients
        io?.emit('newMessage', messageData);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('A user disconnected');
      });
    });
  }

  res.end(); // Ensure the response is sent
}
