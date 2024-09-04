import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Document } from '@/models/Document';

// Connect to the database
connectDB();

export async function GET(req: NextRequest) {
    try {
      const reports = await Document.find({}).lean();
      return NextResponse.json({ reports }, { status: 200 });
    } catch (error) {
      console.error('Error fetching reports:', error);
      return NextResponse.json({ message: 'Error fetching reports' }, { status: 500 });
    }
}
export async function POST(req: NextRequest) {
  try {
    const { title, content, userId, isPublic } = await req.json();

    if (!title || !content || !userId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newDocument = new Document({ title, content, userId, isPublic });
    await newDocument.save();

    return NextResponse.json({ message: 'Document saved successfully', document: newDocument }, { status: 201 });
  } catch (error) {
    console.error('Error saving document:', error);
    return NextResponse.json({ message: 'Error saving document' }, { status: 500 });
  }
}