import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Task from '@/models/Task';
import connectDB from '@/lib/db';
import { User } from '@/models/User';

// Connect to the database
connectDB();

export async function GET(req: Request) {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
  
    if (!userId) {
        return NextResponse.json({ message: 'UserId is required' }, { status: 400 });
    }
  
    try {
        await connectDB();
        const userTasks = await Task.findOne({ userId }).select('tasks');
  
        if (!userTasks || userTasks.tasks.length === 0) {
            return NextResponse.json([]); // Return an empty array if no tasks are found
        }
        return NextResponse.json(userTasks.tasks); // Return the tasks array
    } catch (error) {
        console.error('Error fetching tasks: ', error);
        return NextResponse.json({ message: 'Failed to fetch tasks' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    console.log("fhsle")
    try {
        const { userId, title, done } = await req.json();

        // Validate incoming data
        if (!userId || !title || done === undefined) {
            console.error('Validation error: Missing fields');
            return NextResponse.json({ message: 'UserId, title, and done status are required' }, { status: 400 });
        }

        console.log('Server received data:', { userId, title, done });

        await connectDB();

        // Check if the user already has a task document
        let userTasks = await Task.findOne({ userId });

        if (!userTasks) {
            console.log('No tasks found for user, creating a new document with:', { title, done });
            userTasks = new Task({
                userId,
                tasks: [{ title, done }]
            });
        } else {
            console.log('Adding task to existing user document...');
            userTasks.tasks.push({ title, done });
        }

        // Save the document and log the saved data
        const updatedTasks = await userTasks.save();
        console.log('Tasks updated successfully:', updatedTasks);

        return NextResponse.json(updatedTasks.tasks, { status: 200 });
    } catch (error: any) {
        console.error('Error adding task:', error);
        return NextResponse.json({ message: 'Internal server error', details: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    console.log('hello');
    try {
      const { id, title, done, userId } = await req.json();
  console.log("kfjlsad",id,title,done,userId)
      if (!id || !title || done === undefined || !userId) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
  
      await connectDB();
  
      // Log the request data for debugging
      console.log(`Updating task with id: ${id}`);
      console.log(`New title: ${title}`);
      console.log(`New done status: ${done}`);
  
      // Find the user's document
      const userDoc = await Task.findOne({ userId });
      
      if (!userDoc) {
        console.error('User document not found');
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
  
      // Find the specific task
      const task = userDoc.tasks.id(id);
      
      if (!task) {
        console.error('Task not found in the document');
        return NextResponse.json({ message: 'Task not found in the document' }, { status: 404 });
      }
  
      // Update the task
      task.title = title;
      task.done = done;
  
      await userDoc.save();
      console.log('Updated the task', userDoc);
  
      return NextResponse.json(task, { status: 200 });
    } catch (error: any) {
      console.error('Error updating task:', error);
      return NextResponse.json({ error: 'Failed to update task', details: error.message }, { status: 500 });
    }
  }

  export async function DELETE(req: Request) {
    console.log('Processing DELETE request...');
    try {
        const { id, userId } = await req.json();
  
      if (!id||!userId) {
        console.log('Missing task ID');
        return NextResponse.json({ error: 'Missing task ID' }, { status: 400 });
      }
  
      await connectDB();
  
      console.log(`Deleting task with id: ${id}`);
  
      const result = await Task.updateOne(
        { userId, 'tasks._id': id },
        { $pull: { tasks: { _id: id } } }
      );
  
  
      if (result.modifiedCount === 0) {
        console.error('Task not found');
        return NextResponse.json({ message: 'Task not found' }, { status: 404 });
      }
      console.log('Task deleted successfully');
      return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
    } catch (error: any) {
      console.error('Error deleting task:', error);
      return NextResponse.json({ error: 'Failed to delete task', details: error.message }, { status: 500 });
    }
  }