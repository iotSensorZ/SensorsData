import { useUser } from '@/context/UserContext';
import React, { useState } from 'react';

const AddEmail: React.FC = () => {
  const {user }= useUser();
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);

  const handleAddEmail = async () => {
    if (!user || !email) {
      setMessage('User ID and Email are required');
      return;
    }
console.log("adding",user.email)
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId:user.id,userEmail:user.email,newEmail :email }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(result.message);
        setEmail('');
      } else {
        setMessage('Error adding email');
      }
    } catch (error) {
      setMessage('Error adding email');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-md shadow-md">
      <h2 className="text-lg font-bold mb-4">Add New Email</h2>

      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
        <input
          id="email"
          type="email"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button
        type="button"
        onClick={handleAddEmail}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#00A4EF] hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Add Email
      </button>
      {message && <p className="mt-4 text-sm text-red-500">{message}</p>}
    </div>
  );
};

export default AddEmail;
