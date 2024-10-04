// File: pages/api/files/[userId].ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { File } from '@/models/File'; // Assuming you have a File model

connectDB();

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;

  if (!userId) {
    return NextResponse.json({ message: 'No User ID provided' }, { status: 400 });
  }

  try {
    const files = await File.find({ userId }); // Fetch files related to userId
    return NextResponse.json({ files }, { status: 200 });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({ message: 'Error fetching files' }, { status: 500 });
  }
}
