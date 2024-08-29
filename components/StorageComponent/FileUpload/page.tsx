// components/FileUpload.tsx
"use client";
import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FaCloudUploadAlt } from "@react-icons/all-files/fa/FaCloudUploadAlt";
import { useUser } from '@/context/UserContext';

interface FileUploadProps {
  folder: string;
  onUploadComplete: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ folder, onUploadComplete }) => {
  const { user } = useUser();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) {
      toast.error('No file selected or user not authenticated');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', user.id);
    formData.append('folder', folder);

    try {
      await axios.post('/api/files', formData);
      toast.success('File uploaded successfully');
      onUploadComplete();
    } catch (error) {
      toast.error('Failed to upload file');
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className='m-5 text-center align-middle flex justify-end'>
      <div className="flex gap-5 align-middle">
        <label htmlFor="fileInput" className="cursor-pointer">
          <FaCloudUploadAlt size={50} className="text-[#4F46E5]" />
        </label>
        <input id="fileInput" type="file" onChange={handleFileChange} className="hidden" />
      </div>
      <Button variant="purple" className='rounded-lg m-5' onClick={handleUpload}>Upload</Button>
    </div>
  );
};

export default FileUpload;
