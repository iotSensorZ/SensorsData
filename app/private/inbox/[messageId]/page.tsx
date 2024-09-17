'use client';
import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';

interface MessageDetailProps {
  messageId: string;
}

const MessageDetail: React.FC<MessageDetailProps> = ({ messageId }) => {
  const [message, setMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser(); 

  useEffect(() => {
    if (!messageId){
      console.log('mesageid',messageId)
      return;
    }
    const fetchMessage = async () => {
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      
      try {
        console.log("idm",messageId)
        const response = await fetch(`/api/inbox/${messageId}`);
        
        if (!response.ok) {
          throw new Error('Message not found');
        }
        
        const data = await response.json();
        setMessage(data);
      } catch (err) {
        console.error('Error fetching message:', err);
        setError('Error fetching message');
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [messageId, user]);

  if (loading) {
    return (
      <div className="text-gray-500 h-full flex-col w-3/4 flex justify-center items-center mt-4">
        <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-8 h-8 animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!message) {
    return <p>No message found</p>;
  }

  return (
    <div className='w-3/4 '>
      <div className="h-screen rounded-2xl">
        <div className="relative overflow-hidden flex px-10 py-5 md:p-5 text-black">
          <div className="flex flex-col mx-auto w-full">
            <h3 className="text-[#00A4EF] scroll-m-20 pb-2 text-3xl font-light tracking-tight first:mt-0"></h3>
          </div>
        </div>
        <div className="relative overflow-hidden flex px-10 py-5 md:p-5 bg-white text-black">
          <div className="flex flex-col mx-auto w-full">
            <h3 className="text-[#00A4EF] pb-2 text-3xl mx-3">{message.subject}</h3>
          </div>
        </div>
        <div className="m-4 bg-white h-full rounded-lg p-5">
          <p><strong>From:</strong> {message.senderEmail}</p>
          <p><strong>To:</strong> {message.receiverEmail}</p>
          <div className='mt-5 bg-slate-50 h-full p-3 rounded-lg'>
            <p>{message.body}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetail;
