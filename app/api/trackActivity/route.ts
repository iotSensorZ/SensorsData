// app/api/trackActivity/route.ts
import { NextResponse } from 'next/server';
import UserActivity from '@/models/UserActivity';
import connectDB from '@/lib/db';

export async function POST(req: Request) {
  try {
    await connectDB();

    const { userId, pageUrl, clicks={}, buttonClicks={}, timeSpent } = await req.json();

    // Check if an activity record already exists for this user and page
    const existingActivity = await UserActivity.findOne({ userId, pageUrl });

    if (existingActivity) {
      // Update existing activity
      existingActivity.clicks = {
        ...existingActivity.clicks.toObject(), // Convert to plain object
        ...clicks, // Merge new clicks
      };
      existingActivity.timeSpent += timeSpent; // Accumulate time spent
      await existingActivity.save();
    } else {
      // Create a new activity record
      const activity = new UserActivity({  userId, pageUrl, clicks, buttonClicks, timeSpent  });
      await activity.save();
    }

    return NextResponse.json({ message: 'Activity tracked successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error tracking activity:', error);
    return NextResponse.json({ message: 'Error tracking activity' }, { status: 500 });
  }
}
