import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date },
  allDay: { type: Boolean, required: true },
  type: { type: String, enum: ['event', 'meeting'], required: true },
  email: { type: String, required: true }, 
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

export default Event;
