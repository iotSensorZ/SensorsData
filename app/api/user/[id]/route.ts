// app/api/user/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/db';
import { User } from '@/models/User';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  
  try {
    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching user data', error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  
  try {
    const body = await req.json();
    const updatedUser = await User.findByIdAndUpdate(params.id, body, { new: true });
    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    console.log("upda",updatedUser)
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating user data', error }, { status: 500 });
  }
}
