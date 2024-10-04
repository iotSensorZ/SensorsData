// pages/api/documents/[id].ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Document } from '@/models/Document';

connectDB();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ message: 'No ID provided' }, { status: 400 });
  }

  try {
    const report = await Document.findById(id);

    if (!report) {
      return NextResponse.json({ message: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ report }, { status: 200 });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ message: 'Error fetching report' }, { status: 500 });
  }
}
