"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { FaTrash } from "@react-icons/all-files/fa/FaTrash";
import { FaDownload } from "@react-icons/all-files/fa/FaDownload";
import { useUser } from '@/context/UserContext';

const FolderPage = ({ params }: { params: { folder: string } }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useUser(); 
  const folderName = params.folder; 

  useEffect(() => {
    const fetchFiles = async () => {
      if (!user || !user.id) { 
        console.error("User not found or missing _id");
        return;
      }

      console.log("User object before API call:", user);
      console.log("Using user._id for request:", user.id);

      try {
        const response = await axios.get(`/api/files?userId=${user.id}&folder=${folderName}`);
        console.log("API response data:", response.data);
        setFiles(response.data.files);
      } catch (error) {
        console.error("Error fetching files:", error);
        toast.error('Error fetching files');
        setError("Failed to fetch files.");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [user, folderName]);

  const handleDeleteFile = async (fileId: string) => {
    try {
      await axios.delete(`/api/files?id=${fileId}`);
      setFiles(files.filter(file => file._id !== fileId));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error('Failed to delete file');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user || !user.id) {
      toast.error('Please select a file and ensure you are logged in.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('userId', user.id);
    formData.append('folderId', folderName);

    try {
      const response = await axios.post('/api/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setFiles([...files, response.data]); // Add the new file to the list
        setSelectedFile(null); // Clear the selected file
        toast.success('File uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Files in {folderName}</h2>

      {/* File Upload Section */}
      <div className="mb-4">
        <input type="file" onChange={handleFileChange} />
        <Button onClick={handleUpload}>Upload File</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map(file => (
          <div key={file._id} className="p-4 bg-white shadow-md rounded flex items-center justify-between">
            <span>{file.name}</span>
            <div className="flex gap-2">
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <FaDownload />
                </Button>
              </a>
              <Button variant="destructive" onClick={() => handleDeleteFile(file._id)}>
                <FaTrash />
              </Button>
            </div>
          </div>
        ))}
        {files.length === 0 && <p className='text-gray-500'>No files uploaded yet.</p>}
      </div>
    </div>
  );
};

export default FolderPage;
