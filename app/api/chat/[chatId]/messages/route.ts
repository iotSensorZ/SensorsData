import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';

export async function POST(req: Request, { params }: { params: { chatId: string } }) {
  await connectDB();
  const { senderId, receiverId, text } = await req.json();
  const chatId = params.chatId;  // Expecting combined chat ID

  try {
    let chat = await Chat.findOne({ chatId });

    if (!chat) {
      chat = new Chat({ chatId, participants: chatId.split('_'), messages: [] });
    }

    chat.messages.push({ senderId, receiverId, text, createdAt: new Date(), isRead: false });
    await chat.save();

    return NextResponse.json({ message: 'Message sent' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error sending message', error }, { status: 500 });
  }
}
