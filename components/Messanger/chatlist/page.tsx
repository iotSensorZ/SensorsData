import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Avatar from '@/public/images/avatar.jpg';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicUrl: string;
}

interface ChatListProps {
  setSelectedUser: (user: User) => void;
}

const ChatList: React.FC<ChatListProps> = ({ setSelectedUser }) => {
  const [users, setUsers] = useState<User[]>([]);

  // Fetch users from the API
  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/user');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const users = await response.json();
      setUsers(users);
      console.log("users",users); // Handle the users (e.g., update state)
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  useEffect(() => {
    fetchAllUsers();
  }, []);
  

  return (
    <div className="w-1/4 pr-1 bg-white overflow-y-auto">
      <h2 className="text-[#4F46E5] border-b text-xl mt-10 p-2 font-medium my-4">Chats</h2>
      {users.map((user) => (
        <div
          key={user._id}
          className="pl-3 p-3 border-b cursor-pointer hover:bg-gray-200 flex justify-between items-center"
          onClick={() => setSelectedUser(user)}
        >
          <div className="flex gap-4">
            {user.profilePicUrl ? (
              <img src={user.profilePicUrl} alt="Profile" className="h-12 w-12 rounded-full cursor-pointer" />
            ) : (
              <Image
                src={Avatar}
                alt="User Avatar"
                className="rounded-full h-10 w-10 cursor-pointer"
              />
            )}
            <div>
              <div>{user.firstName} {user.lastName}</div>
              <p>{user.email}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
