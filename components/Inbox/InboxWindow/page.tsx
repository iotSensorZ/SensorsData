import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Inbox, Star } from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface Message {
  id: string;
  _id: string;
  receiverId: string;
  receiverEmail: string;
  senderId: string;
  senderEmail: string;
  subject: string;
  message: string;
  sentAt: any;
  isStarred: boolean;
}

const InboxWindow: React.FC = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmails, setUserEmails] = useState<{ id: string, email: string }[]>([]);
  const [currentEmail, setCurrentEmail] = useState<string | 'All'>('All');
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const fetchUserEmails = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/email?userId=${user.id}`);
          const data = await response.json();
          console.log('data',data)
          if (response.ok) {
            setUserEmails(data.emails);
          } else {
            setError(data.error);
          }
        } catch (err) {
          console.error('Error fetching emails:', err);
          setError('Error fetching emails');
        } finally {
          setLoading(false);
        }
      };

    fetchUserEmails();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/inbox?userId=${user.id}&email=${currentEmail}`);
        const data = await response.json();
        console.log("data",data)
        if (response.ok) {
          setMessages(data.messages);
        } else {
          setError(data.error);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Error fetching messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user, currentEmail]);

  const handleEmailChange = (email: string) => {
    setCurrentEmail(email);
  };

  const handleMessageClick = (messageId: string) => {
    router.push(`/inbox?messageId=${messageId}`);
  };

  const handleStarClick = (messageId: string) => {
    setMessages(messages => messages.map(msg => msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg));
  };

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

  return (
    <div className='w-3/4'>
      <div className="bg-white h-screen rounded-2xl">
        <div className="relative overflow-hidden flex px-10 py-5 md:p-5 bg-slate-50 text-black">
          <div className="p-4 flex justify-between mx-auto w-full">
            <div>
            <h3 className="text-[#00A4EF] scroll-m-20 pb-2 text-3xl font-bold tracking-tight first:mt-0">Inbox</h3>
            </div>
            <div className="mb-4 text-right">
              <label htmlFor="emailSelect" className="mr-2">Select Email:</label>
              <select
                id="emailSelect"
                value={currentEmail || ''}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="p-2 border border-gray-300 rounded"
              >
                {userEmails.map((email) => (
                  <option key={email.id} value={email.email}>{email.email}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <ul className='mt-5'>
          {messages.map((message) => (
            <li
              key={message._id}
              className="grid grid-cols-5 gap-4 p-3 border-b hover:bg-slate-50 rounded cursor-pointer"
            >
                <Link href={`/private/inbox?messageId=${message._id}`} className="contents">
              <div className='flex items-center col-span-2'>
                <Star
                  className='w-5 h-5'
                  style={{ color: "gray", fill: message.isStarred ? 'gold' : 'white' }}
                  onClick={() => handleStarClick(message.id)}
                />
                <p className="ml-3 text-sm font-semibold text-gray-800">{message.senderEmail}</p>
              </div>
                <div className='col-span-2 flex items-center'>
                  <p className="text-slate-600">{message.subject}</p>
                </div>
                <div className='flex items-center justify-end col-span-1'>
                  <p className="text-sm text-gray-500">
                  {message.sentAt ? new Date(message.sentAt).toLocaleString() : 'No date'}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {messages.length === 0 &&
          <div className='mt-28 flex justify-center'>
            <Inbox className='w-10 h-10 text-slate-500' />
            <p className='text-3xl text-slate-500'>Your Inbox is Empty!!!</p>
          </div>
        }
      </div>
    </div>
  );
};

export default InboxWindow;
