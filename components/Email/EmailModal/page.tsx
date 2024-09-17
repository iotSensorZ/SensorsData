import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/context/UserContext';
import { Textarea } from '@headlessui/react';
import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify'; // Make sure you have react-toastify installed

interface EmailModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

interface UserEmail {
  id: string;
  email: string;
}

interface EmailFormData {
  receiverId: string;
  subject: string;
  message: string;
}

const EmailModal: React.FC<EmailModalProps> = ({ isOpen, closeModal }) => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EmailFormData>();
  const [users, setUsers] = useState<UserEmail[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserEmail[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [emailNotFound, setEmailNotFound] = useState(false);
  const { user } = useUser();
  const [senderEmails, setSenderEmails] = useState<UserEmail[]>([]);
  const [selectedSenderEmail, setSelectedSenderEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchUserEmails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/email?userId=${user.id}`);
        const data = await response.json();
        console.log('Fetched emails:', data.emails);
        if (response.ok) {
          setUsers(data.emails);
          setSenderEmails(data.emails);
          if (data.emails.length > 0) {
            setSelectedSenderEmail(data.emails[0].email);
          }
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
  }, [user]);

  const onSubmit: SubmitHandler<EmailFormData> = async (data) => {
    console.log("Selected Sender Email before sending:", selectedSenderEmail);
    console.log("Form data:", data);
    try {
        if (!user) return;
        console.log("kdfsa",user.id, selectedSenderEmail, data.receiverId, data.subject, data.message );

      const response = await fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId:user.id,
          senderEmail: selectedSenderEmail,
          receiverEmail: data.receiverId,
          subject: data.subject,
          body: data.message
        })
      });

      if (response.ok) {
        toast.success("Message Sent");
        reset();
        closeModal();
      } else {
        const errorData = await response.json();
        console.error('Error sending email:', errorData);
        toast.error('Error sending email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Error sending email');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchEmail(value);
    if (value.trim() === '') {
      setFilteredUsers([]);
      setEmailNotFound(false);
      return;
    }
    const filtered = users.filter((user) =>
      user.email.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
    setEmailNotFound(filtered.length === 0);
  };

  const handleSelectEmail = (email: string) => {
    setSearchEmail(email);
    setValue('receiverId', email);
    setSelectedSenderEmail(email);
    setFilteredUsers([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-medium">Send Email</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="senderEmail" className="text-right">
                From:
              </Label>
              <div className="col-span-3">
                <select
                  id="senderEmail"
                  value={selectedSenderEmail}
                  onChange={(e) => setSelectedSenderEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  {senderEmails.map((email, index) => (
                    <option key={index} value={email.email}>{email.email}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="receiverId" className="text-right">
                To:
              </Label>
              <div className="col-span-3 relative">
                <Input
                  id="receiverId"
                  {...register('receiverId', { required: true })}
                  // value={searchEmail}
                  // onChange={handleSearch}
                  className="w-full"
                />
                {/* {filteredUsers.length > 0 && (
                  <ul className="absolute z-10 bg-white border border-gray-300 rounded mt-1 w-full max-h-40 overflow-y-auto">
                    {filteredUsers.map((user) => (
                      <li
                        key={user.id}
                        onClick={() => handleSelectEmail(user.email)}
                        className="cursor-pointer p-2 hover:bg-gray-200"
                      >
                        {user.email}
                      </li>
                    ))}
                  </ul>
                )} */}
                {/* {emailNotFound && <p className="text-red-500">Email not found</p>} */}
              </div>
              {errors.receiverId && <span className="text-red-500">This field is required</span>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Subject:
              </Label>
              <Input
                id="subject"
                {...register('subject', { required: true })}
                className="col-span-3"
              />
              {errors.subject && <span className="text-red-500 col-span-4 text-right">This field is required</span>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="message" className="text-right">
                Description:
              </Label>
              <Textarea
                id="message"
                {...register('message', { required: true })}
                className="col-span-3"
                rows={3}
              />
              {errors.message && <span className="text-red-500 col-span-4 text-right">This field is required</span>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="blue" type="submit">Send</Button>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailModal;
