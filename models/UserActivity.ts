
import mongoose from 'mongoose';

const userActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pageData: {
    type: Map,
    of: new mongoose.Schema({
      pageUrl: { type: String, required: true },
      visitCount: { type: Number, default: 0 },
      buttonClicks: { type: Map, of: Number, default: {} },
      cursorPosition: { 
        x: { type: Number, default: 0 }, 
        y: { type: Number, default: 0 }
      },
      timeSpent: { type: Number, default: 0 }, // in milliseconds
      lastUpdated: { type: Date, default: Date.now },
    }),
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.UserActivity || mongoose.model('UserActivity', userActivitySchema);
