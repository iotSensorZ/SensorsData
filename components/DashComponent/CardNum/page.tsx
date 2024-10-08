"use client";

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FaMailBulk } from "@react-icons/all-files/fa/FaMailBulk";
import Image from 'next/image';
import Reportsvg from '@/public/images/reports.svg';
import eventsvg from '@/public/images/events.svg';
import filesvg from '@/public/images/files.svg';
import inboxsvg from '@/public/images/inbox.svg';
import { Grip } from 'lucide-react';
import Avatar from '@/public/images/avatar.jpg'
import { motion } from "framer-motion"
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { UserCog } from 'lucide-react';
import { useSession } from "next-auth/react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import Link from 'next/link';
import EmailModal from '@/components/Email/EmailModal/page';
import axios from 'axios';
import { toast } from 'sonner';
import { FaRegFolderOpen } from '@react-icons/all-files/fa/FaRegFolderOpen';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
const CardNum = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [reponum, setReponum] = useState<any>('0');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInbox, setCurrentInbox] = useState<string | null>(null);
  // const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // const [userProfile, setuserProfile] = useState('')
  const [folders, setFolders] = useState<any[]>([]); // Updated type to `any[]` to reflect folder objects
  const router = useRouter();
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [folderCount, setFolderCount] = useState<number>(0);
  const [reportCount, setReportCount] = useState<number>(0);
  const [eventCount, setEventCount] = useState<number>(0);
  const [taskCount, setTaskCount] = useState<number>(0);

  const { data: session,status } = useSession();


  interface Report {
    _id: string; 
    title: string;
    createdAt: string;
    isPublic: boolean;
    userId: string;
    url: string;
  }

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


  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);


  const fetchFolders = async () => {
    if (!session?.user?.id) {
        console.error("User ID is undefined");
        return;
      }
    try {
      const response = await axios.get(`/api/folders?userId=${session?.user.id}`);
      const folders = response.data.folders;
      setFolders(folders.slice(0,5));
      setFolderCount(folders.length);  
      console.log("Fetched folders:", response.data.folders);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast.error("Error fetching folders");
    }
  };

  useEffect(() => {
    if (status === "authenticated") { 
      console.log("Session data in FolderList:", session); 
      fetchFolders();
    }
  }, [session, status]);

  const handleFolderClick = (folderName: string) => {
    router.push(`/private/storage/${folderName}`);
  };
  const handleEventClick = (eventName: string) => {
    router.push(`/private/mycalendar`);
  };



  const {user} = useUser();

  useEffect(() => {
  
    if (user) { // Ensure user is not null
      const fetchReports = async () => {
        try {
          const response = await axios.get('/api/documents', { params: { userId: user.id } });
          const allReports = response.data.reports;
          setReports(allReports);

        //   user && user.id === report.ownerId 
          setFilteredReports(allReports.slice(0,5));
      setReportCount(allReports.length);  

        } catch (error) {
          console.error('Error fetching reports:', error);
        }
      };

      fetchReports();
    }
  }, [user]);


  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      if (!user) return;

      const response = await fetch(`/api/events?userId=${user.id}` );
      const data = await response.json();
      setEvents(data);
      setEventCount(data.length);  

    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };


  useEffect(() => {
    const fetchTasks = async () => {
        if (!user) return;
        try {
            const response = await fetch(`/api/tasks?userId=${user.id}`);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setTaskCount(data.length);
        } catch (error) {
            toast.error('Failed to fetch tasks');
            console.error('Error fetching tasks: ', error);
        }
    };
    
    fetchTasks();
  }, [user]);


  return (
    <div className="">

   {/* { loading?  (
        <div className='grid grid-cols-4 p-4 animate-pulse rounded-lg  gap-4 mt-4'>
                <div className='h-52 bg-slate-300 animate-pulse rounded-lg'>

                </div>
                <div className='h-52 bg-slate-300 animate-pulse rounded-lg'>

                </div>
                <div className='h-52 bg-slate-300 animate-pulse rounded-lg'>

                </div>
                <div className='h-52 bg-slate-300 animate-pulse rounded-lg'>

                </div>
                
                </div>
           ) :
 */}

       <motion.div 
        initial={{opacity:0,y:-50}}
        animate={{opacity:1,y:0}}
        transition={{duration:1}} 
       className='p-4 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 mt-4'>
      <div className="shadow-md justify-evenly bg-white flex gap-4 rounded-lg p-4">
      <div className='flex justify-center items-center'>
              <Image src={Reportsvg} alt='repo' width={60} height={60} />
            </div>
      <div className='text-xl font-medium text-center'>{reportCount}
              <p className='text-lg '>Reports</p>
              <CardDescription className='font-medium'>written</CardDescription>
            </div>
      <div className='flex text-end'><Grip className='' /></div>
      </div>

      <div className="shadow-md justify-evenly bg-white flex gap-4 rounded-lg p-4">
      <div className='flex justify-center items-center'>
             <Image src={filesvg} alt='repo' width={60} height={60} />
            </div>
      <div className='text-xl font-medium text-center'>{folderCount}
              <p className='text-lg '>Folders</p>
              <CardDescription className='font-medium'>gallery</CardDescription>
            </div>
      <div className='flex text-end'><Grip className='' /></div>
      </div>

      <div className="shadow-md justify-evenly bg-white flex gap-4 rounded-lg p-4">
      <div className='flex justify-center items-center'>
      <Image src={eventsvg} alt='repo' width={60} height={60} />
            </div>
      <div className='text-xl font-medium text-center'>{eventCount}
              <p className='text-lg '>Events</p>
              <CardDescription className='font-medium'>due</CardDescription>
            </div>
      <div className='flex text-end'><Grip className='' /></div>
      </div>

      <div className="shadow-md justify-evenly bg-white flex gap-4 rounded-lg p-4">
      <div className='flex justify-center items-center'>
      <Image src={inboxsvg} alt='repo' width={60} height={60} />
            </div>
      <div className='text-xl font-medium text-center'>{taskCount}
              <p className='text-lg '>Tasks</p>
              <CardDescription className='font-medium'>pending</CardDescription>
            </div>
      <div className='flex text-end'><Grip className='' /></div>
      </div>
      
   </motion.div>

   


            <div className='m-4'>
                <div className="bg-white font-medium p-3 text-lg w-full">
                    Your Activities
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='text-center'>Folders</TableHead>
                      <TableHead className='text-center'>Reports</TableHead>
                      <TableHead className='text-center'>Events</TableHead>
                      {/* <TableHead>Date</TableHead> */}
                    </TableRow>
                  </TableHeader>

                  <TableBody className=''>
                    <TableRow>
                  <TableCell>
                  {folders.map((folder) => (
                        <div
                        key={folder._id}  
                        className="text-center bg-white p-2 m-2 shadow-md rounded-lg cursor-pointer"
                        onClick={() => handleFolderClick(folder.name)} 
                        >
            <span className=" m-2 text-slate-700">{folder.name}</span>  
          </div>
        ))}
        </TableCell>
<TableCell>

{filteredReports.map((report, index) => (
                        <div
                        key={index}  
                        className="text-center bg-white p-2 m-2 shadow-md rounded-lg cursor-pointer"
                        onClick={() => router.push(`/private/reports/${report._id}`)}
                        >
            <span className=" m-2 text-slate-700">{report.title}</span>  {/* Render folder.name instead of the entire folder object */}
          </div>
        ))}
        </TableCell>
<TableCell>


         {events.map((event) => (
                        <div
                        key={event._id}  
                        className="text-center bg-white p-2 m-2 shadow-md rounded-lg cursor-pointer"
                        onClick={() => handleEventClick(event.title)} 
                        >
            <span className=" m-2 text-slate-700">{event.title}</span>  {/* Render folder.name instead of the entire folder object */}
          </div>
        ))}
        </TableCell>
                    </TableRow>
                   
                  </TableBody>
                </Table>
            </div>
        


      <button
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-6 rounded-full shadow-lg hover:bg-blue-700"
        onClick={openModal}
      >
        <FaMailBulk className='text-lg' />
      </button>
      <EmailModal isOpen={isModalOpen} closeModal={closeModal} />
    </div>
  );
};

export default CardNum;
