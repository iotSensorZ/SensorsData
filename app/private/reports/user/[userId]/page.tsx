'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Label } from '@/components/ui/label';
import Avatar from '@/public/images/avatar.jpg'
import Image from 'next/image';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  birthday: string;
  bio: string;
  location: string;
  about: string;
  address: string;
  contact: string;
  occupation: string;
  profilePicUrl: string;
}
interface File {
  _id: string;
  name: string;
  url: string; // Assuming you have a URL field for files
}

interface Report {
  _id: string;
  title: string;
  createdAt: string;
  isPublic: boolean;
  userId: string;
}

const UserReports = () => {
  const router = useRouter();
  const { userId } = useParams<{ userId: string }>(); // Ensure correct typing for userId
  const [reports, setReports] = useState<Report[]>([]); // Define the type for reports
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    birthday: '',
    bio: '',
    location: '',
    about: '',
    address: '',
    contact: '',
    occupation: '',
    profilePicUrl: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  useEffect(() => {
    const fetchReports = async () => {
      if (!userId) {
        console.error('User ID is undefined');
        return; // Exit if userId is not defined
      }

      try {
        const response = await fetch(`/api/documents?userId=${userId}`); 
        
        if (!response.ok) {
          throw new Error('Failed to fetch reports');
        }
        
        const data = await response.json();
        setReports(data.reports); // Set reports based on the API response
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, [userId]);

  useEffect(() => {
    const fetchFiles = async () => {
      if (userId) {
        try {
          const response = await axios.get(`/api/files/${userId}`); // New route to fetch files
          if (response.status === 200) {
            setFiles(response.data.files);
          }
        } catch (error) {
          console.error('Error fetching files:', error);
        }
      }
    };

    fetchFiles();
  }, [userId]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userId) {
        try {
          const response = await axios.get(`/api/user/${userId}`);
          setUserProfile(response.data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <div>
      <div className="relative overflow-hidden flex p-10 bg-slate-200 text-slate-800">
        <div className="flex flex-col mx-auto w-full">

          <div className='flex'>
          <div className="m-2">
          {userProfile.profilePicUrl ? (
            <img src={userProfile.profilePicUrl} alt="Profile" className="h-12 w-12 rounded-full cursor-pointer" />
          ) : (
            <Image src={Avatar} alt="Profile" className="w-12 h-12 object-cover rounded-full" />
          )}
                </div>
            <div className="justify-center text-center align-middle" style={{alignContent:"center"}}>
            <p className='text-2xl text-black font-semibold'>
            {userProfile.firstName} {userProfile.lastName}
            </p>
          <p className="mx-10 text-slate-800 font-light">
            {userProfile.email}
          </p>
          </div>
            </div>
          </div>
         
      </div>

      <div className="flex h-screen">
      {/* User Profile Section */}
      <div className="w-1/5 p-4 border-r border-gray-200 bg-white h-full overflow-y-auto">
        <div className="mb-4 border-b">
          <Label>Bio</Label>
          <p className="font-light">{userProfile.bio}</p>
        </div>
        <div className="mb-4 border-b">
          <Label>Location</Label>
          <p className="font-light">{userProfile.location}</p>
        </div>
        <div className="mb-4 border-b">
          <Label>About</Label>
          <p className="font-light">{userProfile.about}</p>
        </div>
        <div className="mb-4 border-b">
          <Label>Address</Label>
          <p className="font-light">{userProfile.address}</p>
        </div>
        <div className="mb-4 border-b">
          <Label>Contact</Label>
          <p className="font-light">{userProfile.contact}</p>
        </div>
        <div className="mb-4 border-b">
          <Label>Occupation</Label>
          <p className="font-light">{userProfile.occupation}</p>
        </div>
      </div>

      {/* Reports Section */}
      <div className="p-4 border-r border-gray-200 overflow-y-auto">
        <h1 className="text-4xl font-medium mb-4">Reports</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {reports.length > 0 ? (
            reports.map((report) => (
              <Card key={report._id}>
                <CardHeader>
                  <CardTitle>{report.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Created At: {new Date(report.createdAt).toLocaleString()}</p>
                </CardContent>
                <CardFooter>
                  <Button variant='blue' onClick={() => router.push(`/private/reports/${report._id}`)}>
                    View Report
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <p>No reports found for this user.</p>
          )}
        </div>
      </div>

      {/* Related Files Section */}
      <div className="p-4 overflow-y-auto bg-slate-50">
        <h2 className="text-4xl font-semibold mb-4">Files</h2>
        <ul>
          {files.length > 0 ? (
            files.map(file => (
              <li key={file._id} className='mb-2 p-2 border-b-2'>
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-slate-600 font-medium hover:underline flex gap-3">
                  {file.name}
                </a>
              </li>
            ))
          ) : (
            <p>No files available for this user.</p>
          )}
        </ul>
      </div>
    </div>
    </div>
  );
};

export default UserReports;
