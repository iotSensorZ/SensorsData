// app/api/changepassword/route.ts

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { User } from "@/models/User";
import { hash, compare } from "bcryptjs";

export async function POST(req: NextRequest) {
  await connectDB(); // Connect to the database

  const { email, currentPassword, newPassword } = await req.json(); // Parse the request body as JSON

  if (!email || !currentPassword || !newPassword) {
    return NextResponse.json({ message: "Please fill all fields" }, { status: 400 });
  }

  // Find the user by email
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // Verify the current password
  const isMatched = await compare(currentPassword, user.password);
  if (!isMatched) {
    return NextResponse.json({ message: "Current password is incorrect" }, { status: 401 });
  }

  // Hash the new password and update it
  const hashedNewPassword = await hash(newPassword, 12);
  user.password = hashedNewPassword; // Update the password
  await user.save(); // Save the updated user

  return NextResponse.json({ message: "Password changed successfully" }, { status: 200 });
}
