import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Document } from '@/models/Document';

connectDB();

export async function GET(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        if (!userId) {
          console.log('No user ID provided'); // Debugging log
          return NextResponse.json({ message: 'No user ID provided' }, { status: 400 });
      }

      const reports = await Document.find({});
      const filteredReports = reports.filter(report => report.isPublic || report.userId.toString() === userId);
      return NextResponse.json({ reports:filteredReports }, { status: 200 });
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
    

    const documentUrl = `https://yourdomain.com/user/reports/${userId}`; 


//     const documentUrl = `${req.nextUrl.origin}/reports/${userId}`;
console.log('docurl',documentUrl)
    return NextResponse.json({ 
      message: 'Document saved successfully', 
      document: newDocument ,
      url: documentUrl,
    }, 
      { status: 201 });
  } catch (error) {
    console.error('Error saving document:', error);
    return NextResponse.json({ message: 'Error saving document' }, { status: 500 });
  }
}