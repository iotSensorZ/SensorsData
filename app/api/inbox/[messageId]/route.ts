import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Email } from '@/models/Email';



export async function GET(request: Request, { params }: { params: { messageId: string } }) {
  const { messageId } = params;
console.log("messageid",messageId)
  if (!messageId || typeof messageId !== 'string') {
    return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
  }

  try {
    await connectDB();

    // Find the email document by message ID
    const emailDoc = await Email.findOne({ 'emails.messages._id': new mongoose.Types.ObjectId(messageId) })
      .select('emails.$'); // Only return the matched email object

    if (!emailDoc) {
      return NextResponse.json({ message: 'Message not found' }, { status: 404 });
    }

    // Find the message within the email document
    const message = emailDoc.emails.flatMap(email => email.messages).find(message => message._id.toString() === messageId);

    if (!message) {
      return NextResponse.json({ message: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
