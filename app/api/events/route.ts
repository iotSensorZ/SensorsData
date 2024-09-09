import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Event from '@/models/Event';

// Fetch all events
export async function GET(request: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(request.url);
   const userId = searchParams.get('userId');
   if (!userId) {
    return NextResponse.json(
      { error: 'Missing or invalid userId' },
      { status: 400 }
    );
  }
  try {
    const events = await Event.find({ userId });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 400 });
  }
}

// Create a new event
export async function POST(request:any) {
  await connectDB();

  try {
    const eventData = await request.json();
    const newEvent = new Event(eventData)
    await newEvent.save();
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 400 });
  }
}
