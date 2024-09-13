import React, { useEffect, useState } from 'react';
import { FaRocketchat } from "@react-icons/all-files/fa/FaRocketchat";
import ChatList from '../chatlist/page';
import { useUser } from '@/context/UserContext';
import ChatWindow from '../chatwindow/page';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicUrl: string;
}

const ChatApp: React.FC = () => {
  const { user: currentUser } = useUser();  // Ensure user contains _id
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

//   useEffect(() => {
//     console.log('Selected User:', selectedUser);  // Log to ensure selectedUser is being set
//   }, [selectedUser]);

  // Ensure the user is authenticated and has _id
  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Chat List */}
      <ChatList setSelectedUser={setSelectedUser} />
      
      {/* Chat Window */}
      {selectedUser ? (
        <ChatWindow currentUser={currentUser} selectedUser={selectedUser} />
      ) : (
        <div className="flex gap-6 text-center align-middle items-center justify-center w-2/3 h-full">
          <FaRocketchat className="text-7xl text-gray-500" />
          <p className="text-gray-500">Select a conversation or start a new chat</p>
        </div>
      )}
    </div>
  );
};

export default ChatApp;
