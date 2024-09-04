import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Document } from '@/models/Document';
import { runCorsMiddleware } from '@/lib/corsMiddleware';

connectDB();

export async function GET(req: NextRequest) {
    
    const res = NextResponse.next(); 
    await runCorsMiddleware(req, res);
  
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
  
      console.log('Received ID:', id); // Debugging log
  
      if (!id) {
        console.log('No ID provided'); // Debugging log
        return NextResponse.json({ message: 'No ID provided' }, { status: 400 });
      }
  
      const report = await Document.findById(id);
  
      if (!report) {
        console.log('Report not found'); // Debugging log
        return NextResponse.json({ message: 'Report not found' }, { status: 404 });
      }
  
      console.log('Report found:', report); // Debugging log
      return NextResponse.json({ report }, { status: 200 });
    } catch (error) {
      console.error('Error fetching report:', error);
      return NextResponse.json({ message: 'Error fetching report' }, { status: 500 });
    }
  }
  

  export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const { id } = params;
      const { isPublic } = await req.json();
  
      const updatedReport = await Document.findByIdAndUpdate(
        id,
        { isPublic },
        { new: true }
      );
  
      if (!updatedReport) {
        return NextResponse.json({ message: 'Report not found' }, { status: 404 });
      }
  
      return NextResponse.json({ report: updatedReport }, { status: 200 });
    } catch (error) {
      console.error('Error updating report visibility:', error);
      return NextResponse.json({ message: 'Error updating report visibility' }, { status: 500 });
    }
  }
