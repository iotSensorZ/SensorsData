"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FaFolder } from "@react-icons/all-files/fa/FaFolder";
import { FaRegFolderOpen } from "@react-icons/all-files/fa/FaRegFolderOpen";
import { FaPlus } from "@react-icons/all-files/fa/FaPlus";
import { FaInfoCircle } from "@react-icons/all-files/fa/FaInfoCircle";
import { toast } from "sonner";

interface FolderListProps {
    onFolderSelect: (folder: string) => void;
  }


  const FolderList: React.FC<FolderListProps> = ({ onFolderSelect }) => {
  const { data: session,status } = useSession();
  const [folders, setFolders] = useState<any[]>([]); // Updated type to `any[]` to reflect folder objects
  const [newFolderName, setNewFolderName] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") { 
      console.log("Session data in FolderList:", session); 
      fetchFolders();
    }
  }, [session, status]);

  const fetchFolders = async () => {
    if (!session?.user?.id) {
        console.error("User ID is undefined");
        return;
      }
    try {
      const response = await axios.get(`/api/folders?userId=${session?.user.id}`);
      setFolders(response.data.folders); 
      console.log("Fetched folders:", response.data.folders);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast.error("Error fetching folders");
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name cannot be empty");
      return;
    }

    try {
      console.log("Creating folder with name:", newFolderName);
      const response = await axios.post("/api/folders", { userId: session?.user.id, folderName: newFolderName });
      if (response.status === 201) {
        console.log("Folder created successfully:", response.data);
        setNewFolderName("");
        fetchFolders();
        toast.success("Folder created successfully");
      } else {
        console.error("Error creating folder: Unexpected response status", response.status);
        toast.error("Error creating folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Error creating folder");
    }
  };

  const handleFolderClick = (folderName: string) => {
    router.push(`/private/storage/${folderName}`);
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-end gap-4">
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder="New folder name"
          className="p-2 border rounded-lg"
        />
        <Button onClick={handleCreateFolder}>
          <FaPlus /> Create Folder
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {folders.map((folder) => (
          <div
            key={folder._id}  
            className="p-2 bg-white shadow-md rounded-lg cursor-pointer"
            onClick={() => handleFolderClick(folder.name)}  // Pass folder.name to handleFolderClick
          >
            <div className="flex justify-end text-slate-500">
            <FaInfoCircle  />
            </div>
            <div className="flex justify-center items-center text-slate-300 text-7xl text-right">
            <FaRegFolderOpen  />
            </div>
            <div className=" mt-2 text-center">
            <span className=" text-slate-700">{folder.name}</span>  {/* Render folder.name instead of the entire folder object */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FolderList;
