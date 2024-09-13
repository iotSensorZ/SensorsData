// ChatWindow.tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Avatar from '@/public/images/avatar.jpg';
import io, { Socket } from 'socket.io-client';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import Loading from "@/public/images/spinner.gif"
import { FaRegSmile } from '@react-icons/all-files/fa/FaRegSmile';


interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profilePicUrl: string;
}

interface Message {
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  isRead: boolean;
}

interface ChatWindowProps {
  currentUser: { id: string };
  selectedUser: User;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, selectedUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = useRef<Socket | null>(null);
  const [emoji, setEmoji] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState<boolean>(false); 
  
  
  useEffect(() => {
    socket.current = io('http://localhost:3001');

    socket.current.on('receive-message', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.current?.disconnect();
    };
  }, []);


  const fetchMessages = async () => {
    const chatId = [currentUser.id, selectedUser._id].sort().join('_');
    try {
      const response = await axios.get(`/api/chat/${chatId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedUser]);



  // Sending new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    const chatId = [currentUser.id, selectedUser._id].sort().join('_');

    const message:Message = {
      senderId: currentUser.id,
      receiverId: selectedUser._id,
      text: newMessage,
      createdAt: new Date().toISOString(),
      isRead:false
    };

    
    // Optimistic UI update
    setMessages((prevMessages) => [...prevMessages, message]);
    setNewMessage(''); 
    // Emit the message via Socket.IO
    // socket.current?.emit('send-message', message);
    try {
      await axios.post(`/api/chat/${chatId}/messages`, message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };


    // Handle emoji picker visibility
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage((prevMessage) => prevMessage + emojiData.emoji);
    setEmoji(false);
  };

  return (
    <div className="text-gray-500 w-3/4 h-full flex flex-col">
      <div className="border-b border-slate-300 relative flex px-5 py-5 md:p-5 bg-slate-50 text-slate-800">
        <div className="flex gap-4 mx-auto w-full">
          {selectedUser.profilePicUrl ? (
            <img src={selectedUser.profilePicUrl} alt="Profile" className="h-12 w-12 rounded-full cursor-pointer" />
          ) : (
            <Image src={Avatar} alt="User Avatar" className="rounded-full h-10 w-10 cursor-pointer" />
          )}
          <p className="content-center text-slate-700 font-semibold">
            {selectedUser.firstName} {selectedUser.lastName}
          </p>
        </div>
      </div>

      <div className="flex-grow p-4 overflow-y-auto mb-28">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`mb-2 ${msg.senderId === currentUser.id ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-2 rounded ${msg.senderId === currentUser.id ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}>
                {msg.text}
              </div>
              <div className="text-xs text-gray-500 mt-1">{new Date(msg.createdAt).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>


       {emoji && (
        <div ref={emojiPickerRef} className="z-50" style={{ width: 'fit-content' }}>
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
           <div style={{ width: '-webkit-fill-available' }} className="fixed bottom-0 p-2 overflow-hidden bg-gray-200 flex items-center gap-5">
           <button onClick={() => setEmoji(!emoji)}><FaRegSmile /></button>
        <textarea
           value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
           className="w-full p-2 border border-gray-300 rounded"
           rows={1}
         />
         <Button variant="blue" onClick={handleSendMessage}>Send</Button>
       </div>
    </div>
  );
};

export default ChatWindow;
