"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { FaTrash } from "@react-icons/all-files/fa/FaTrash";
import { FaDownload } from "@react-icons/all-files/fa/FaDownload";
import { FaCloudUploadAlt } from "@react-icons/all-files/fa/FaCloudUploadAlt";
import { useUser } from '@/context/UserContext';
import { motion } from "framer-motion"
import { FaFileAlt } from "@react-icons/all-files/fa/FaFileAlt";


const fadeInAnimationsVariants={
  initial:{
    opacity:0,
    y:100
  },
  animate: (index:number) => ({
    opacity:1,
    y:0,
    transition:{
      delay:0.05*index
    }
  }
)
}

const FolderPage = ({ params }: { params: { folder: string } }) => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useUser(); 
  const folderName = params.folder; 

  console.log("mila", user ? user.id : 'User not loaded yet');

  const fetchFiles = async () => {
    if (!user || !user.id) { 
      console.error("User not found or missing _id");
      return;
    }

    console.log("User object before API call:", user);  // Debugging log
    console.log("Using user._id for request:", user.id); // Debugging log

    try {
      const response = await axios.get(`/api/files?userId=${user.id}&folder=${folderName}`);
      console.log("API response data:", response.data); // Debugging log
      setFiles(response.data.files);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error('Error fetching files');
      setError("Failed to fetch files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    console.log("upload ke andr")
    if (!selectedFile || !user) {
      toast.error('No file selected or user not authenticated');
      return;
    }
  
    const folderId = folderName; // This should now be the ObjectId of the folder

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('userId', user.id);
    formData.append('folder', folderId); 

    // Debugging logs
    console.log("FormData being sent:", {
      file: selectedFile,
      userId: user.id,
      folder: folderId,
    });
  
    try {
      console.log("try ke andr")
      const response = await axios.post('/api/files', formData);
      console.log("response?")
      toast.success('File uploaded successfully');
      setSelectedFile(null);
      fetchFiles(); // Refresh the file list
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };
  


  // if (loading) {
  //   return <div className="text-center">Loading...</div>;
  // }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  return (
    <div className="">
           <motion.div variants={fadeInAnimationsVariants}
    initial="initial" whileInView="animate"
    viewport={{once:true}}
    custom={2} className="relative overflow-hidden flex  px-10 py-10 md:p-10 bg-slate-800 text-white">
        <div className="flex flex-col  mx-auto w-full">
          <div>
            <h3 className="scroll-m-20 pb-1 text-3xl font-bold tracking-tight first:mt-0">
            {folderName}
            </h3>
          </div>
        </div>
      </motion.div>

      <div className='m-5 text-center justify-end flex align-middle items-center gap-1'>
          <input type="file" onChange={handleFileChange} />
          <Button onClick={handleUpload} variant="blue">
            <FaCloudUploadAlt /> Upload
          </Button>
        </div>


      <motion.div variants={fadeInAnimationsVariants}
    initial="initial" whileInView="animate"
    viewport={{once:true}}
    custom={10} className="p-4">

      <div className="p-4 rounded-xl font-medium grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4  bg-slate-200">
        {files.map((file) => (
            <div key={file._id} className="p-4 bg-white shadow-md rounded-lg items-center justify-between">
              <div className="flex justify-center items-center text-slate-300 text-7xl text-right">
            <FaFileAlt  />
            </div>
            <div className=" mt-2 text-center">
            <span className=" text-slate-700">{file.name}</span>  
            </div>
            <div className="flex justify-between mt-4">
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <FaDownload />
                </Button>
              </a>
              <Button variant="outline" onClick={() => handleDeleteFile(file._id)}>
                <FaTrash />
              </Button>
            </div>
          </div>
        ))}
        {files.length==0&&<p className='text-slate-500'> No files uploaded </p>}
      </div>
    </motion.div>

    </div>
  );
};

export default FolderPage;
