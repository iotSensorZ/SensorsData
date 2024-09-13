import mongoose, { Schema, Document } from 'mongoose';

interface IContact {
  Name: string;
  Phone: string;
  Email: string;
}

interface IUserContacts extends Document {
  userId: string;
  contacts: IContact[]; // Array of contacts associated with the user
}

const ContactSchema: Schema = new Schema({
  Name: { type: String, required: true },
  Phone: { type: String, required: true },
  Email: { type: String, required: true },
});

const UserContactsSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true }, // One document per user
    contacts: [ContactSchema], // Store contacts as an array
  },
  { timestamps: true }
);

export default mongoose.models.UserContacts || mongoose.model<IUserContacts>('UserContacts', UserContactsSchema);