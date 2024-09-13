import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Note } from '@/models/Note';

// Get all notes for a specific user
export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ message: 'UserId is required' }, { status: 400 });
  }

  try {
    await connectDB();
    const userNotes = await Note.findOne({ userId }).select('notes');

    if (!userNotes || userNotes.notes.length === 0) {
        return NextResponse.json([]); // Return an empty array if no notes are found
      }
    return NextResponse.json(userNotes.notes); // Return the notes array
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'An unknown error occurred' }, { status: 500 });
  }
}


// Add a new note
export async function POST(req: Request) {
    try {
      const { userId, title, content, labels } = await req.json();
  
      // Validate incoming data
      if (!userId || !title || !content) {
        console.error('Validation error: Missing fields');
        return NextResponse.json({ message: 'UserId, title, and content are required' }, { status: 400 });
      }
  
      console.log('Server received data:', { userId, title, content, labels });
  
      await connectDB();
  
      // Check if the user already has a note document
      let userNotes = await Note.findOne({ userId });
  
      if (!userNotes) {
        console.log('No user notes found, creating a new document with:', { title, content, labels });
        userNotes = new Note({
          userId,
          notes: [{ title, content, labels }],
        });
      } else {
        console.log('Adding note to existing user document...');
        userNotes.notes.push({ title, content, labels });
      }
  
      // Save the document and log the saved data
      const savedNotes = await userNotes.save();
      console.log('Notes saved successfully:', savedNotes);
  
      return NextResponse.json(savedNotes.notes, { status: 201 });
    } catch (error:any) {
      console.error('Error adding note:', error);
      return NextResponse.json({ message: 'Internal server error', details: error.message }, { status: 500 });
    }
  }
  
  
  
  

// Update a note
export async function PUT(req: Request) {
    try {
      const { id, title, content, labels, userId } = await req.json();
  
      // Validate required fields
      if (!id || !title || !content || !userId) {
        console.error('Validation error: Missing fields');
        return NextResponse.json({ message: 'id, title, content, and userId are required' }, { status: 400 });
      }
  
      // Log received data
      console.log('Server received data:', { id, title, content, labels, userId });
  
      await connectDB();
  
      // Find the user's notes document
      const noteDoc = await Note.findOne({ userId });
      
      if (!noteDoc) {
        console.error('User document not found');
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
  
      // Find and update the specific note
      const note = noteDoc.notes.id(id);
      if (!note) {
        console.error('Note not found in the document');
        return NextResponse.json({ message: 'Note not found in the document' }, { status: 404 });
      }
  
      note.title = title;
      note.content = content;
      note.labels = labels || []; // Ensure labels is always an array
  
      await noteDoc.save();
      console.log('Note updated successfully:', noteDoc);
  
      return NextResponse.json(note, { status: 200 });
    } catch (error: any) {
      console.error('Error updating note:', error);
      return NextResponse.json({ message: 'Internal server error', details: error.message }, { status: 500 });
    }
  }


// Delete a note
export async function DELETE(req: Request) {
    try {
        const { id, userId } = await req.json();

        // Validate required fields
        if (!id || !userId) {
            console.error('Validation error: Missing fields');
            return NextResponse.json({ message: 'id and userId are required' }, { status: 400 });
        }

        // Log received data
        console.log('Server received data:', { id, userId });

        await connectDB();

        // Find and remove the specific note
        const result = await Note.updateOne(
            { userId: userId, 'notes._id': id },
            { $pull: { notes: { _id: id } } }
        );

        if (result.modifiedCount === 0) {
            console.error('Note not found or not deleted');
            return NextResponse.json({ message: 'Note not found or not deleted' }, { status: 404 });
        }

        console.log('Note deleted successfully');

        return NextResponse.json({ message: 'Note deleted successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Error deleting note:', error);
        return NextResponse.json({ message: 'Internal server error', details: error.message }, { status: 500 });
    }
}

