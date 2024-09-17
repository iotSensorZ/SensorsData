// app/api/email/add/route.ts

import { NextResponse } from 'next/server';
import  { Email } from '@/models/Email'; 
import connectDB from '@/lib/db';
import { NextApiRequest, NextApiResponse } from 'next/types';

export async function GET(request: Request) {
    try {
      await connectDB()
  
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
  
      if (!userId) {
        return NextResponse.json({ message: 'userId is required' }, { status: 400 });
      }
  
      const emailDoc = await Email.findOne({ userId });
  
      if (!emailDoc) {
        return NextResponse.json({ message: 'No emails found for this user' }, { status: 404 });
      }
  
      return NextResponse.json({ emails: emailDoc.emails });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
  }


  export async function POST(request: Request) {
    try {
        await connectDB(); 
  
        const { userId, userEmail, newEmail } = await request.json();
        console.log("Received data:", userEmail, newEmail);
  
        if (!userId || !userEmail || !newEmail) {
            return NextResponse.json({ message: 'userId, userEmail, and newEmail are required' }, { status: 400 });
        }
  
        if (!userEmail.trim() || !newEmail.trim()) {
            return NextResponse.json({ message: 'Invalid email addresses' }, { status: 400 });
        }
  
        let emailDoc = await Email.findOne({ userId });
  
        if (!emailDoc) {
            emailDoc = new Email({
                userId,
                emails: [
                    {
                        email: userEmail,
                        verified: true,
                        addedAt: new Date(),
                        messages: []
                    },
                    {
                      email: newEmail,
                      verified: false, 
                      addedAt: new Date(),
                      messages: []
                  }
                ]
            });
        } else {
         
                emailDoc.emails.push({
                    email: newEmail,
                    verified: false, 
                    addedAt: new Date(),
                    messages: []
                });
        }
  
        await emailDoc.save();
  
        return NextResponse.json({ message: 'Emails updated successfully', emailDoc });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}