import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  chatId: {
    type: String,
    required: true,
    unique: true,
  },
  participants: [String],
  messages: [{
    senderId: String,
    receiverId: String,
    text: String,
    createdAt: { type: Date, default: Date.now },
    isRead: { type: Boolean, default: false },
  }],
});

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
