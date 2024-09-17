import { NextRequest, NextResponse } from 'next/server';
import { Email } from '@/models/Email'; // Adjust the import path as needed
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const email = url.searchParams.get('email');

    if (!userId) {
      return NextResponse.json({ message: 'userId is required' }, { status: 400 });
    }

    // Construct the filter
    const filter: any = { userId };
    if (email && email !== 'All') {
      filter['emails.email'] = email; // Filter for email inside the emails array
    }
console.log("fileter",filter)
    // Aggregate to fetch messages
    const emailDoc = await Email.aggregate([
      { $match: filter },
      { $unwind: '$emails' },
      { $match: { 'emails.email': email || { $exists: true } } },
      { $unwind: '$emails.messages' },
      { $replaceRoot: { newRoot: '$emails.messages' } },
      { $sort: { sentAt: -1 } }
    ]);
console.log("emialdoc",emailDoc)
    return NextResponse.json({ messages: emailDoc });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
      await connectDB();
      console.log('ercefine',request.json)
      const { userId, senderEmail, receiverEmail, subject, body } = await request.json();

      console.log("Received Data:", { userId,senderEmail, receiverEmail, subject, body });

      if (!userId || !senderEmail || !receiverEmail || !subject || !body) {
        return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
      }
  console.log("userid",userId)
      const emailDoc = await Email.findOne({ userId });
  console.log('emaildoc',emailDoc)
      if (!emailDoc) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
  
        // Find the receiver's email document
        const receiverEmailDoc = await Email.findOne({ 'emails.email': receiverEmail });
        if (!receiverEmailDoc) {
          return NextResponse.json({ message: 'Receiver email not found' }, { status: 404 });
        }
    
        // Find the receiver's email object
        const receiverEmailObj = receiverEmailDoc.emails.find((e: { email: string }) => e.email === receiverEmail);
        if (!receiverEmailObj) {
          return NextResponse.json({ message: 'Receiver email object not found' }, { status: 404 });
        }
    
      const senderEmailObj = emailDoc.emails.find((e: { email: string }) => e.email === senderEmail);
      // const receiverEmailObj = emailDoc.emails.find((e: { email: string }) => e.email === receiverEmail);
  console.log("sender",senderEmailObj)
  console.log("receiver",receiverEmailObj)
      if (!senderEmailObj || !receiverEmailObj) {
        return NextResponse.json({ message: 'Sender or receiver email not found' }, { status: 404 });
      }
  
      // Create the message object
      const message = {
        _id: new mongoose.Types.ObjectId(),
        subject,
        body,
        senderEmail,
        receiverEmail,
        sentAt: new Date(),
        read: false,
        isSentByMe: true, 
      };
      console.log("Message to be saved:", message);
  console.log('msg',message)
      receiverEmailObj.messages.push(message);
  
      await emailDoc.save();
      await receiverEmailDoc.save();
      console.log('Message added successfully:', message);

      return NextResponse.json({ message: 'Message sent successfully', emailDoc });
    } catch (error) {
      console.error('Error sending message:', error);
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }
















