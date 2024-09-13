// routes/api/contacts/route.ts
import { NextResponse } from 'next/server';
import UserContacts from '@/models/Contacts';
import connectDB from '@/lib/db'; // Assumes you have a utility for DB connection

// GET: Fetch contacts for a user
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
  
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
  
    try {
      await connectDB();
      const userContacts = await UserContacts.findOne({ userId });
  
    //   if (!userContacts) {
    //     return NextResponse.json({ error: 'No contacts found for this user' }, { status: 404 });
    //   }
  
      return NextResponse.json(userContacts.contacts); // Return the contacts array
    } catch (error) {
      console.error('Error fetching contacts:', error);
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }
  }
  

// POST or PUT: Add or update contacts for a user
export async function POST(request: Request) {
    try {
      const { contacts, userId } = await request.json();
  
      if (!userId || !contacts || !Array.isArray(contacts)) {
        return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
      }
  
      await connectDB();
  
      // Find the user by userId and update or create the contacts array
      const userContacts = await UserContacts.findOneAndUpdate(
        { userId }, // Find the user's contacts document
        { $set: { contacts } }, // Update or create contacts array
        { new: true, upsert: true } // Create the document if it doesn't exist
      );
  
      return NextResponse.json(userContacts, { status: 201 });
    } catch (error) {
      console.error('Error in POST /api/contacts:', error);
      return NextResponse.json({ error: 'Failed to save contacts' }, { status: 500 });
    }
  }
  
  
  

// PUT: Update a contact for a user
export async function PUT(req: Request) {
    try {
      const { contact, userId } = await req.json();
  
      if (!contact || !contact._id || !userId) {
        return new Response(JSON.stringify({ message: 'Invalid request data' }), { status: 400 });
      }
  
      // Update the specific contact within the contacts array
      const result = await UserContacts.updateOne(
        { userId, 'contacts._id': contact._id }, 
        { $set: { 'contacts.$.Name': contact.Name, 'contacts.$.Email': contact.Email, 'contacts.$.Phone': contact.Phone } }
      );
  
      if (result.matchedCount === 0) {
        return new Response(JSON.stringify({ message: 'Contact not found' }), { status: 404 });
      }
  
      return new Response(JSON.stringify({ message: 'Contact updated successfully' }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
    }
  }
  
  
  

// DELETE: Delete a contact for a user
export async function DELETE(req: Request) {
    const url = new URL(req.url);
    const contactId = url.searchParams.get('id');  
    const userId = url.searchParams.get('userId'); 
  
    if (!contactId || !userId) {
      return new Response(JSON.stringify({ message: 'Invalid request' }), { status: 400 });
    }
  
    try {
      const result = await UserContacts.updateOne(
        { userId },
        { $pull: { contacts: { _id: contactId } } }
      );
  
      if (result.modifiedCount === 0) {
        return new Response(JSON.stringify({ message: 'Contact not found' }), { status: 404 });
      }
  
      return new Response(JSON.stringify({ message: 'Contact deleted successfully' }), { status: 200 });
    } catch (error) {
      return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
    }
  }
  