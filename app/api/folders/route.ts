import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Folder } from '@/models/Folder';

connectDB();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url); 
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ message: "User ID is required" }, { status: 400 });
  }

  try {
    const folders = await Folder.find({ userId });
    return NextResponse.json({ folders });
  } catch (error) {
    console.error("Error fetching folders:", error);
    return NextResponse.json({ message: "Error fetching folders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json(); 
    const { userId, folderName } = body;

    if (!userId || !folderName) {
      return NextResponse.json({ message: "User ID and folder name are required" }, { status: 400 });
    }

    const existingFolder = await Folder.findOne({ userId, name: folderName });
    if (existingFolder) {
      return NextResponse.json({ message: "Folder already exists" }, { status: 400 });
    }

    const folder = new Folder({ userId, name: folderName });
    await folder.save();
    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error("Error creating folder:", error);
    return NextResponse.json({ message: "Error creating folder" }, { status: 500 });
  }
}
