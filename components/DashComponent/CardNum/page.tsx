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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
import Link from 'next/link';
const CardNum = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [reponum, setReponum] = useState<any>('0');
  const [filenum, setFilenum] = useState<any>('0');
  const [eventnum, setEventnum] = useState<any>('0');
  const [inboxnum, setInboxnum] = useState<any>('0');
  const [error, setError] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentInbox, setCurrentInbox] = useState<string | null>(null);
  // const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // const [userProfile, setuserProfile] = useState('')

  const [userName, setUserName] = useState<string | null>(() => localStorage.getItem('userName'));
  const [userProfile, setuserProfile] = useState<string | null>(() => localStorage.getItem('userProfile'));
  const [loadingProfile, setLoadingProfile] = useState(true);


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
       <motion.div variants={fadeInAnimationsVariants}
   initial="initial" whileInView="animate"
  //  viewport={{once:true}}
   custom={5}>
          <Card className='text-center text-blue-600'><Grip className='' />
            <CardHeader className='flex justify-center items-center'>
              <Image src={Reportsvg} alt='repo' width={60} height={60} />
            </CardHeader>
            <CardTitle className='text-6xl '>{reponum}
              <p className='text-lg '>Reports</p>
              <CardDescription className='font-medium'>written</CardDescription>
            </CardTitle>
            <CardContent>
            </CardContent>
          </Card>
          </motion.div>
        


       <motion.div variants={fadeInAnimationsVariants}
   initial="initial" whileInView="animate"
  //  viewport={{once:true}}
   custom={5}>
          <Card className='text-center text-yellow-600 '><Grip className='' />
            <CardHeader className='flex justify-center items-center'>
              <Image src={filesvg} alt='repo' width={60} height={60} />
            </CardHeader>
            <CardTitle className='text-6xl '>{filenum}
              <p className='text-lg '>Files</p>
              <CardDescription className='font-medium'>uploaded</CardDescription>
            </CardTitle>
            <CardContent>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeInAnimationsVariants}
   initial="initial" whileInView="animate"
  //  viewport={{once:true}}
   custom={5}>
          <Card className='text-center text-violet-600 '><Grip className='' />
            <CardHeader className='flex justify-center items-center'>
              <Image src={inboxsvg} alt='repo' width={60} height={60} />
            </CardHeader>
            <CardTitle className='text-6xl '>{inboxnum}
              <p className='text-lg '>Inbox</p>
              <CardDescription className='font-medium'>received</CardDescription>
            </CardTitle>
            <CardContent>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
            {/* } */}


            <div className='m-4'>
                <div className="bg-white font-medium p-3 text-lg w-full">
                    Your Activities
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody className='bg-white'>
                    <TableRow>
                      <TableCell>John Doe</TableCell>
                      <TableCell>john@example.com</TableCell>
                      <TableCell>Pro</TableCell>
                      <TableCell>2024-04-16</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>John Doe</TableCell>
                      <TableCell>john@example.com</TableCell>
                      <TableCell>Pro</TableCell>
                      <TableCell>2024-04-16</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>John Doe</TableCell>
                      <TableCell>john@example.com</TableCell>
                      <TableCell>Pro</TableCell>
                      <TableCell>2024-04-16</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>John Doe</TableCell>
                      <TableCell>john@example.com</TableCell>
                      <TableCell>Pro</TableCell>
                      <TableCell>2024-04-16</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>John Doe</TableCell>
                      <TableCell>john@example.com</TableCell>
                      <TableCell>Pro</TableCell>
                      <TableCell>2024-04-16</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>John Doe</TableCell>
                      <TableCell>john@example.com</TableCell>
                      <TableCell>Pro</TableCell>
                      <TableCell>2024-04-16</TableCell>
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
      {/* <EmailModal isOpen={isModalOpen} closeModal={closeModal} /> */}
    </div>
  );
};

export default CardNum;
