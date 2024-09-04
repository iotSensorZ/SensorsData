"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FaTrash } from "@react-icons/all-files/fa/FaTrash";
import { toast } from "sonner";

interface FileListProps {
  folder: string;
}

const FileList: React.FC<FileListProps> = ({ folder }) => {
  const { data: session, status } = useSession(); // Get session data from NextAuth
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Session data:", session);

    if (status === "authenticated" && session?.user?.id) {
      console.log("User is authenticated with userId:", session.user.id);
      fetchFiles(session.user.id);
    } else if (status === "unauthenticated") {
      setLoading(false);
      setError("User not authenticated.");
      toast.error("User not authenticated.");
    }
  }, [session, status]);

  const fetchFiles = async (userId: string) => {
    try {
      console.log("Fetching files for userId:", userId);
      const response = await axios.get(`/api/files?userId=${userId}&folder=${folder}`);
      setFiles(response.data.files);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching files:", error);
      setError("Error fetching files");
      toast.error("Error fetching files");
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await axios.delete(`/api/files?id=${fileId}`);
      fetchFiles(session!.user.id);
      toast.success("File deleted successfully");
    } catch (error) {
      toast.error("Error deleting file");
    }
  };

  if (loading) return <div>Loading files...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Files in {folder}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file) => (
          <div key={file.id} className="p-4 bg-white shadow-md rounded flex items-center justify-between">
            <span>{file.name}</span>
            <Button onClick={() => handleDeleteFile(file.id)}>
              <FaTrash />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;
