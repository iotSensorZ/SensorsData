import mongoose, { Schema, Document } from 'mongoose';

interface IResource extends Document {
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  rating: number;
  description: string;
  image: string;
}

const ResourceSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  address: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  openingHours: { type: String, required: true },
  rating: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
});

export default mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);
