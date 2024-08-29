// components/FolderModal.tsx
"use client";
import { useState } from 'react';
import axios from 'axios';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from '@/components/ui/dialog';

interface FolderModalProps {
  open: boolean;
  onClose: () => void;
}

const FolderModal: React.FC<FolderModalProps> = ({ open, onClose }) => {
  const [folderName, setFolderName] = useState('');
  const {user} = useUser();

  const handleCreateFolder = async () => {
    if (!user) {
      toast.error('User not logged in');
      return;
    }

    try {
      await axios.post('/api/folders', {
        userId: user.id,
        folderName,
      });
      toast.success('Folder created successfully');
      onClose();
    } catch (error) {
      toast.error('Error creating folder');
      console.error('Error creating folder:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay className="bg-black bg-opacity-10 fixed inset-0" onClick={onClose} />
      <DialogContent className="bg-white p-6 rounded shadow-md">
        <DialogTitle className="text-lg font-bold mb-4">Create New Folder</DialogTitle>
        <Input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Folder Name"
          className="mb-4"
        />
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose} className="mr-2">Cancel</Button>
          <Button variant="purple" className='rounded-lg' onClick={handleCreateFolder}>Create</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FolderModal;
