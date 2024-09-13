import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import Chat from './models/Chat';  // Ensure the model file exists
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path'
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Initialize Express
const app = express();
const server = http.createServer(app);

// Enable CORS
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend URL
  methods: ['GET', 'POST'],
}));

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: 'http://localhost:3000', // Frontend URL
    methods: ['GET', 'POST'],
  },
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL!).then(() => {
  console.log('Connected to MongoDB');
}).catch((err: Error) => {
  console.error('Failed to connect to MongoDB:', err);
});

app.use(cors());
app.use(express.json());

interface Message {
  senderId: string;
  receiverId: string;
  text: string;
  isRead: boolean;
}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('send-message', async (message: Message) => {
    console.log('Message received:', message);

    const chatId = [message.senderId, message.receiverId].sort().join('_');

    try {
      let chat = await Chat.findOne({ chatId });
      if (!chat) {
        chat = new Chat({
          chatId,
          participants: [message.senderId, message.receiverId],
          messages: [],
        });
      }

      chat.messages.push({
        senderId: message.senderId,
        receiverId: message.receiverId,
        text: message.text,
        isRead: false,
      });

      await chat.save();

      console.log('Message saved to MongoDB:', chat);
      io.emit('receive-message', message);
    } catch (error) {
      console.error('Error saving message to MongoDB:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
