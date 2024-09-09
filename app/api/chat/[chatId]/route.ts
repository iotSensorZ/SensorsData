import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';

export async function GET(req: Request, { params }: { params: { chatId: string } }) {
  await connectDB();
console.log("get mai hai")
  try {
    const chatId = params.chatId;  // Expecting combined chat ID
    const chat = await Chat.findOne({ chatId });
console.log("chatid milgyi?")
if (!chat) {
  return NextResponse.json([], { status: 200 });
}

    return NextResponse.json(chat.messages, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching messages', error }, { status: 500 });
  }
}


export async function POST(req: Request, { params }: { params: { chatId: string } }) {
  await connectDB();
  const { senderId, receiverId, text } = await req.json();

  try {
    const chatId = params.chatId;
    let chat = await Chat.findOne({ participants: { $all: chatId.split('_') } });

    if (!chat) {
      chat = new Chat({ participants: chatId.split('_'), messages: [] });
    }

    chat.messages.push({ senderId, receiverId, text, createdAt: new Date(), isRead: false });
    await chat.save();

    return NextResponse.json({ message: 'Message sent' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error sending message', error }, { status: 500 });
  }
}
