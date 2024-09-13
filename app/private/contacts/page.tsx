'use client'
import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { FaRegSmile } from "@react-icons/all-files/fa/FaRegSmile";
import { motion } from "framer-motion"
import { useUser } from '@/context/UserContext';

interface Contact {
  _id?: string;
  Name: string;
  Phone: string;
  Email: string;
}

const fadeInAnimationsVariants = {
  initial: {
    opacity: 0,
    y: 100
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * index
    }
  })
}

const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [editContactId, setEditContactId] = useState<string | null>(null); // Track the ID of the contact being edited
  const [editContact, setEditContact] = useState<Contact | null>(null); // Track the details of the contact being edited
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserContacts();
    }
  }, [user]);

  const fetchUserContacts = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/contacts?userId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      const contacts = await response.json();
      setContacts(contacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      Papa.parse(file, {
        header: true,
        complete: (results) => {
          console.log('Parsed Results:', results.data);

          const parsedContacts = results.data.map((row: any, index: number) => ({
            _id: `${Date.now()}-${index}`, // Assign a unique ID for each contact
            Name: row['First Name'] || row['Last Name'] || row['Middle Name'],
            Phone: row['Phone 1 - Value'] ? Number(row['Phone 1 - Value']).toString() : '',
            Email: row['E-mail 1 - Value'] || '',
          }));

          setContacts(parsedContacts);
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
        }
      });
    }
  };

  const handleSaveContacts = async () => {
    if (!user || contacts.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts, userId: user.id })
      });

      if (response.ok) {
        const savedContacts = await response.json();
        console.log('Contacts saved successfully:', savedContacts);
        fetchUserContacts();
      } else {
        const error = await response.json();
        console.error('Failed to save contacts:', error);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error saving contacts:', error);
      setLoading(false);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditContactId(contact._id!); // Set the ID of the contact being edited
    setEditContact(contact); // Set the contact details for editing
  };

  const handleUpdateContact = async () => {
    if (!user || !editContact || !editContactId) return;
  
    console.log("Updating contact:", editContact, "For user:", user.id);
  
    try {
      const response = await fetch('/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: editContact, userId: user.id }), // Ensure contact and userId are sent
      });
  
      if (response.ok) {
        setEditContactId(null); // Clear the edit state
        setEditContact(null); // Clear the edited contact state
        fetchUserContacts(); // Refresh the list after updating
      } else {
        const error = await response.json();
        console.error('Failed to update contact:', error);
      }
    } catch (error) {
      console.error('Error updating contact:', error);
    }
  };
  

  const handleDeleteContact = async (contactId: string) => {
    if (!user || !contactId) return;

    try {
      await fetch(`/api/contacts?id=${contactId}&userId=${user.id}`, {
        method: 'DELETE'
      });
      fetchUserContacts(); // Refresh contacts after deletion
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  return (
    <div className="">
      <motion.div
        variants={fadeInAnimationsVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        custom={2}
        className="relative overflow-hidden flex px-10 py-10 md:p-10 text-slate-200 bg-black"
      >
        <div className="flex flex-col mx-auto w-full">
          <div>
            <h3 className="scroll-m-20 pb-2 text-3xl font-bold tracking-tight first:mt-0">
              Import Contacts
            </h3>
          </div>
          <div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="mb-4"
              ref={fileInputRef}
            />
            <Button
              onClick={handleSaveContacts}
              disabled={loading || contacts.length === 0}
              variant="blue"
            >
              {loading ? 'Saving...' : 'Save Contacts'}
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={fadeInAnimationsVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        custom={10}
        className="mt-4"
      >
        <h2 className="text-xl font-semibold m-5">Contacts</h2>
        <ul>
          {contacts.map((contact, index) => (
            <li
              key={index}
              className="border-b justify-between p-4 items-center bg-white border-gray-300 hover:bg-gray-100"
            >
              {editContactId === contact._id ? (
                <div className="flex flex-col ">
                    <div className="flex justify-between align-middle" style={{alignItems:"center"}}>
                  <input
                    type="text"
                    value={editContact?.Name || ''}
                    onChange={(e) =>
                      setEditContact({ ...editContact!, Name: e.target.value })
                    }
                    placeholder="Name"
                    className="mb-2"
                  />
                    <Button onClick={handleUpdateContact} variant="blue">
                    Update
                  </Button>
                  </div>
                  <input
                    type="text"
                    value={editContact?.Email || ''}
                    onChange={(e) =>
                      setEditContact({ ...editContact!, Email: e.target.value })
                    }
                    placeholder="Email"
                    className="mb-2"
                  />
                  <input
                    type="text"
                    value={editContact?.Phone || ''}
                    onChange={(e) =>
                      setEditContact({ ...editContact!, Phone: e.target.value })
                    }
                    placeholder="Phone"
                    className="mb-2"
                  />
                
                </div>
              ) : (
                <>
                  <div className="">
                    <div className=" justify-between flex gap-5 align-middle font-normal text-lg" style={{alignItems:"center"}}>
                    <div className="flex gap-5 align-middle" style={{alignItems:"center"}}>
                        <FaRegSmile />
                    {contact.Name}
                        </div>
                    <div className="flex gap-2 justify-end">
                    <Button
                      onClick={() => handleEditContact(contact)}
                      variant="outline"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteContact(contact._id!)}
                      variant="default"
                    >
                      Delete
                    </Button>
                    </div>
                    </div>

                    <div className='mx-10 font-light'>
                    {contact.Phone ? '  ' + contact.Phone : ''}
                    </div>
                    <div className='mx-10 font-mono'>
                    {contact.Email ? '  ' + contact.Email : ''}
                    </div>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};

export default Contacts;
