import mongoose from 'mongoose';

// Define the structure for a single note
const singleNoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Make sure this field is required
  },
  content: {
    type: String,
    required: true, // Make sure this field is required
  },
  labels: {
    type: [String],
    required: false, // Labels are optional
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically generate a date
  },
});

// Define the Note schema to store all notes for a specific user
const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  notes: [singleNoteSchema], // Array of note objects
});

// Export the model
export const Note = mongoose.models.Note || mongoose.model('Note', noteSchema);
