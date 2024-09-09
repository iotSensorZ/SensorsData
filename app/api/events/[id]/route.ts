import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';

interface Params {
  id: string;
}

export async function PUT(request: NextRequest, { params }: { params: Params }) {
  await connectDB();

  const { id } = params;
  const eventData = await request.json();

  try {
    const event = await Event.findByIdAndUpdate(id, eventData, { new: true });
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();
  
    const { id } = params;
  
    try {
      const event = await Event.findByIdAndDelete(id);
      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
      return NextResponse.json({ message: 'Event deleted successfully' });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 400 });
    }
  }