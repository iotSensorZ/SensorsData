import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import Chat from './models/Chat';  // Ensure the model file exists
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path'
import UserActivity from './models/UserActivity';
dotenv.config({ path: path.resolve(__dirname, '.env.local') });
import { debounce } from 'lodash';
const app = express();
const server = http.createServer(app);

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePicUrl: string;
  firstName: string;
  lastName: string;
}

interface ActivityData {
  userId: User; // Keep userId as type User
  pageUrl: string;
  buttonClicks: Record<string, number>;
  timeSpent: number; 
  cursorPosition: { x: number; y: number };
  lastUpdated: Date;
}


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


  const handleActivityTracking = async (activityData: ActivityData) => {
    const { userId, pageUrl, buttonClicks, timeSpent, cursorPosition } = activityData;
  
    try {
      const existingActivity = await UserActivity.findOne({ userId });
  
      if (existingActivity) {
        const pageData = existingActivity.pageData.get(pageUrl);
  
        if (pageData) {
          pageData.visitCount += 1;
  
          Object.entries(buttonClicks).forEach(([button, count]) => {
            pageData.buttonClicks.set(button, (pageData.buttonClicks.get(button) || 0) + count);
          });
  
          pageData.timeSpent += timeSpent;
  
          pageData.cursorPosition = cursorPosition;
  
          pageData.lastUpdated = new Date();
        } else {
          existingActivity.pageData.set(pageUrl, {
            pageUrl,
            visitCount: 1,
            buttonClicks: new Map(Object.entries(buttonClicks)), // Convert to Map
            timeSpent,
            cursorPosition,
            lastUpdated: new Date(),
          });
        }
  
        await existingActivity.save();
      } else {
        const activity = new UserActivity({
          userId,
          pageData: new Map([[pageUrl, { 
            pageUrl, 
            visitCount: 1, 
            buttonClicks: new Map(Object.entries(buttonClicks)), 
            timeSpent,
            cursorPosition,
            lastUpdated: new Date(),
          }]]),
        });
        await activity.save();
      }
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };
  
 
  socket.on('track-activity', handleActivityTracking);
  
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
