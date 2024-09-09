import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Resources from '@/models/Resources';
import formidable, {IncomingForm, Fields, Files } from 'formidable';
import path from 'path';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to convert NextRequest to a Node.js Readable Stream
const convertNextRequestToReadable = async (req: NextRequest) => {
  const readable = new Readable();
  readable._read = () => {}; // No-op
  readable.push(await req.arrayBuffer());
  readable.push(null);
  return readable;
};

const parseForm = async (req: NextRequest): Promise<{ fields: Fields; files: Files }> => {
  const form = new formidable.IncomingForm({
    uploadDir: path.join(process.cwd(), '/public/uploads'), // Adjust path as needed
    keepExtensions: true,
  });

  const stream = await convertNextRequestToReadable(req);

  return new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    form.parse(stream, (err: Error | null, fields: Fields, files: Files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
};

// Handler for GET request
export async function GET(req: NextRequest) {
    await connectDB();
  
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
  
      if (id) {
        // Fetch a single resource by ID
        const resource = await Resources.findById(id);
        if (!resource) {
          return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }
        return NextResponse.json(resource, { status: 200 });
      }
  
      // Fetch all resources if no ID is provided
      const resources = await Resources.find({});
      return NextResponse.json(resources, { status: 200 });
    } catch (error) {
      console.error('Error fetching resources:', error);
      return NextResponse.json({ error: 'Error fetching resources' }, { status: 500 });
    }
  }

export async function POST(req: NextRequest) {
    await connectDB();
  
    try {
      const body = await req.json(); // Parse the request body as JSON
  
      // Create a new resource instance with all fields
      const newResource = new Resources({
        name: body.name,
        type: body.type,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        openingHours: body.openingHours,
        rating: body.rating,
        description: body.description,
        image: body.image, // Assuming this is the URL from Cloudinary
      });
  
      // Save the new resource to MongoDB
      await newResource.save();
  
      return NextResponse.json(newResource, { status: 201 });
    } catch (error) {
      console.error('Error adding resource:', error);
      return NextResponse.json({ error: 'Error adding resource' }, { status: 500 });
    }
  }

  export async function PUT(req: NextRequest) {
    await connectDB();
  
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
  
      if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
      }
  
      const body = await req.json(); // Assuming JSON body for updates
  console.log("body",body)
      const updatedResource = await Resources.findByIdAndUpdate(
        id,
        { ...body }, // Directly use the JSON body for updates
        { new: true }
      );
  
      if (!updatedResource) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
      }
  
      return NextResponse.json(updatedResource);
    } catch (error) {
      console.error('Error updating resource:', error);
      return NextResponse.json({ error: 'Error updating resource' }, { status: 500 });
    }
  }

  export async function DELETE(req: NextRequest) {
    await connectDB();
  
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
  
      if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
      }
  
      const deletedResource = await Resources.findByIdAndDelete(id);
  
      if (!deletedResource) {
        return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
      }
  
      return NextResponse.json({ message: 'Resource deleted successfully' }, { status: 200 });
    } catch (error) {
      console.error('Error deleting resource:', error);
      return NextResponse.json({ error: 'Error deleting resource' }, { status: 500 });
    }
  }