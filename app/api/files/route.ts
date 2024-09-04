import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { File } from '@/models/File';
import { Folder } from '@/models/Folder';
import mongoose from 'mongoose';
import multer from 'multer';
import { runCorsMiddleware } from '@/lib/corsMiddleware';
import cors from 'cors';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import fs from 'fs/promises';
import path from 'path';
// Connect to database

const uploadDir = join(process.cwd(), 'uploads');
mkdir(uploadDir, { recursive: true });

connectDB();
// Initialize multer
const upload = multer({ dest: 'uploads/' });

// Multer middleware wrapper
const runMiddleware = (req: any, res: any, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

// Config to disable default body parsing in Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};
// CORS Headers setup
function setCorsHeaders(response: NextResponse): void {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

const corsMiddleware = cors({ methods: ['POST', 'GET', 'HEAD'] });

// GET handler
export async function GET(req: NextRequest) {
  try {
    console.log("Received a GET request");

    // Extract search parameters from the request URL
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const folderName = searchParams.get('folder');

    // Validate required parameters
    if (!userId || !folderName) {
      console.log("Missing userId or folderName:", { userId, folderName });
      return NextResponse.json({ message: "User ID and Folder Name are required" }, { status: 400 });
    }

    // Validate and convert userId to ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log("Invalid User ID:", userId);
      return NextResponse.json({ message: "Invalid User ID" }, { status: 400 });
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find folder by name and userId
    const folder = await Folder.findOne({ name: folderName, userId: userObjectId });
    if (!folder) {
      console.log("Folder not found:", folderName);
      return NextResponse.json({ message: "Folder not found" }, { status: 400 });
    }

    // Fetch files associated with the folder
    const files = await File.find({ userId: userObjectId, folder: folder._id });

    console.log("Files fetched successfully:", files);
    return NextResponse.json({ files }, { status: 200 });

  } catch (error:any) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ message: 'Error fetching files', error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("Received a POST request");

    // Parse the FormData from the request
    const formData = await req.formData();

    // Extract the file, userId, and folderName from the FormData
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string;
    const folderName = formData.get('folder') as string;

    // Log extracted values
    console.log("Extracted values - file:", file, "userId:", userId, "folderName:", folderName);

    // Check if all required fields are present
    if (!file || !userId || !folderName) {
      console.log("Missing required fields:", { file, userId, folderName });
      return NextResponse.json({ message: 'File, User ID, and Folder Name are required' }, { status: 400 });
    }

    // Correct usage of ObjectId with 'new'
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find folder by name and user ID
    const folder = await Folder.findOne({ name: folderName, userId: userObjectId });
    if (!folder) {
      console.log("Folder not found:", folderName);
      return NextResponse.json({ message: "Folder not found" }, { status: 400 });
    }

    // Create the uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate a unique file path
    const filePath = path.join(uploadDir, file.name);

    // Log file path
    console.log("File path for upload:", filePath);

    // Write the file to the server
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(filePath, buffer);

    // Construct the URL for the uploaded file
    const url = `/uploads/${file.name}`;

    // Log URL
    console.log("File URL:", url);

    // Save file information to the database
    const newFile = new File({
      name: file.name,
      url,
      folder: folder._id, // Use folder._id for saving the file reference
      userId: userObjectId,
    });

    await newFile.save();

    // Log success and return response
    console.log("File saved successfully:", newFile);
    return NextResponse.json({ file: newFile }, { status: 201 });
  } catch (error:any) {
    console.error('Error processing POST request:', error);
    return NextResponse.json({ message: 'Error processing POST request', error: error.message }, { status: 500 });
  }
}

// DELETE handler

export async function DELETE(req: NextRequest) {
  try {
    console.log("Received a DELETE request");

    // Extract search parameters from the request URL
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('id');

    // Validate required parameter
    if (!fileId) {
      console.log("Missing fileId:", { fileId });
      return NextResponse.json({ message: "File ID is required" }, { status: 400 });
    }

    // Validate and convert fileId to ObjectId
    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      console.log("Invalid File ID:", fileId);
      return NextResponse.json({ message: "Invalid File ID" }, { status: 400 });
    }
    const fileObjectId = new mongoose.Types.ObjectId(fileId);

    // Find the file by ID
    const file = await File.findById(fileObjectId);
    if (!file) {
      console.log("File not found:", fileId);
      return NextResponse.json({ message: "File not found" }, { status: 400 });
    }

    // Delete the file from the server
    const filePath = path.join(process.cwd(), 'public/uploads', file.name);
    await fs.unlink(filePath);
    console.log("File deleted from server:", filePath);

    // Remove the file document from the database
    await file.deleteOne();

    console.log("File deleted successfully:", fileId);
    return NextResponse.json({ message: 'File deleted successfully' }, { status: 200 });

  } catch (error:any) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ message: 'Error deleting file', error: error.message }, { status: 500 });
  }
}