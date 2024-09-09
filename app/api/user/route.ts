// app/api/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db'; // Your custom DB connection file
import { User } from '@/models/User'; // Import your User model

// Fetch all users
export async function GET(req: NextRequest) {
  await connectDB();
console.log("hello eefsk")
try {
      console.log("efsk")
    // Fetch all users from the MongoDB collection
    const users = await User.find({});
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching users', error }, { status: 500 });
  }
}
