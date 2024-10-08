"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Button } from "../button";
import { FaHome } from '@react-icons/all-files/fa/FaHome';
import { FaFileAlt } from '@react-icons/all-files/fa/FaFileAlt';
import { FaUsers } from '@react-icons/all-files/fa/FaUsers';
import { FaCog } from '@react-icons/all-files/fa/FaCog';
import { FaSignOutAlt } from '@react-icons/all-files/fa/FaSignOutAlt';
import { FaKey } from '@react-icons/all-files/fa/FaKey';
import { FaBars } from '@react-icons/all-files/fa/FaBars';
import { FaRegBell } from '@react-icons/all-files/fa/FaRegBell';
import { FaCalendarAlt } from '@react-icons/all-files/fa/FaCalendarAlt';
import { FaInbox } from "@react-icons/all-files/fa/FaInbox";
import { FaTasks} from "@react-icons/all-files/fa/FaTasks";
import { FaPhone} from "@react-icons/all-files/fa/FaPhone";
import { FaRocketchat } from "@react-icons/all-files/fa/FaRocketchat";
import { FaUserAlt } from  "@react-icons/all-files/fa/FaUserAlt";
import {  FaRegWindowRestore } from "@react-icons/all-files/fa/FaRegWindowRestore";
import { FaFileSignature } from "@react-icons/all-files/fa/FaFileSignature";
import { Globe, Loader2, User } from 'lucide-react';
import Avatar from '@/public/images/avatar.jpg'
import Loading from '@/public/images/spinner.gif'
import Image from "next/image";
import { useUser } from "@/context/UserContext";

const Sidebar: React.FC<{ children: React.ReactNode }> = ({children}) => {
  const { data: session, status } = useSession();
  const { user } = useUser();
  console.log("js",user)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const [activeLink, setActiveLink] = useState<string>('');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (status === "authenticated") {
      setLoading(false);
    } else if (status === "unauthenticated") {
      setLoading(false); 
    }
  }, [status]);


  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarItemClick = (href: string) => {
    setActiveLink(href);
  };

  const isLinkActive = (href: string) => {
    return activeLink === href ? 'bg-slate-800 text-white font-semibold rounded-lg' : '';
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  if (loading) {
    return (
<div className="flex justify-center items-center mt-4">
<Image src={Loading} alt='' width={200} height={200}
/>
  </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`bg-black text-slate-100 h-full flex flex-col transition-width duration-300 ${isSidebarOpen ? 'w-64' : 'w-24'} `}
        style={{ overflow: "overlay", scrollbarWidth: "none" }}>
        <div className="p-4 flex justify-end">
          <button onClick={handleToggleSidebar}>
            <FaBars className='text-2xl' />
          </button>
        </div>
        <nav className="flex-grow">
          <ul className='p-4'>
          {/* {isSidebarOpen && (
          <li className={` mb-2 text-slate-400 font-light font-xs mt-2 text-center `}>
           <p className='font-medium text-sm text-white text-center'>{user?.email}</p>
          {user?.name}
          </li>) } */}
          {/* <li className={`p-4 mb-2 justify-center flex items-center`}>
          {userProfile ? (
                    <img src={userProfile} alt="Profile" className=" h-12 w-12 rounded-full cursor-pointer" 
                    onClick={handleAvatarClick}   loading="lazy"/>
            ):(
              <Image
              src={Avatar}
              alt="User Avatar"
              className="rounded-full h-10 w-10 cursor-pointer"
              onClick={handleAvatarClick}
            />
            )}
            </li> */}
          <li className='my-5'>
          <span className="font-semibold text-sm my-10 text-[#6BC9F7]">
            <Link href='/private/dashboard' prefetch={true}>
              {isSidebarOpen ? "Dashboard" : ("")} 
            </Link>
          </span>
          </li>
            <li className={`text-sm text-gray-300 p-4 mb-2 hover:bg-slate-800 hover:text-white hover:font-medium hover:rounded-lg flex items-center ${isLinkActive('/storage')}`}>
              <Link href="/private/storage" prefetch={true} className="flex items-center w-full" onClick={() => handleSidebarItemClick('/storage')}>
                <FaUsers className="mr-2" />
                {isSidebarOpen && "Storage Space"}
              </Link>
            </li>
            <li className={`text-sm text-gray-300 p-4 mb-2 hover:bg-slate-800 hover:text-white hover:font-medium hover:rounded-lg flex items-center ${isLinkActive('/reports')}`}>
            <Link href="/private/reports" prefetch={true}className="flex items-center w-full" onClick={() => handleSidebarItemClick('/reports')}>
                  <FaFileAlt className="mr-2" />
                  {isSidebarOpen && "Reports"}
              </Link>
            </li>
            <li className={`text-sm text-gray-300 p-4 mb-2 hover:bg-slate-800 hover:text-white hover:font-medium hover:rounded-lg flex items-center ${isLinkActive('/writereport')}`}>
            <Link href="/private/writereport" prefetch={true} className="flex items-center w-full" onClick={() => handleSidebarItemClick('/writereport')}>
                  <FaFileSignature className="mr-2" />
                  {isSidebarOpen && "Write Report"}
              </Link>
            </li>
            <li className={`text-sm text-gray-300 p-4 mb-2 hover:bg-slate-800 hover:text-white hover:font-medium hover:rounded-lg flex items-center ${isLinkActive('/codeeditor')}`}>
            <Link href="/private/codeeditor" prefetch={true} className="flex items-center w-full" onClick={() => handleSidebarItemClick('/codeeditor')}>
                  <FaFileSignature className="mr-2" />
                  {isSidebarOpen && "Code Editor"}
              </Link>
            </li>
            <li className={`text-sm text-gray-300 p-4 mb-2 hover:bg-slate-800 hover:text-white hover:font-medium hover:rounded-lg flex items-center ${isLinkActive('/resources')}`}>
            <Link href="/private/resources" prefetch={true} className="flex items-center w-full" onClick={() => handleSidebarItemClick('/resources')}>
                  <Globe className="mr-2" />
                  {isSidebarOpen && "Resources"}
              </Link>
            </li>
            <li className='my-5'>
          <span className="font-semibold text-sm my-10 text-[#6BC9F7]">     
              {isSidebarOpen ? "Applications" : ("")} 
          </span>
          </li>
            <li className={`text-sm text-gray-300 p-4 mb-2 hover:bg-slate-800 hover:text-white hover:font-medium hover:rounded-lg flex items-center ${isLinkActive('/mycalendar')}`}>
            <Link href="/private/mycalendar" prefetch={true} className="flex items-center w-full" onClick={() => handleSidebarItemClick('/mycalendar')}>
                  <FaCalendarAlt className="mr-2" />
                  {isSidebarOpen && "My Calendar"}
              </Link>
            </li>
            <li className={`text-sm text-gray-300 p-4 mb-2 hover:bg-slate-800 hover:text-white hover:font-medium hover:rounded-lg flex items-center ${isLinkActive('/inbox')}`}>
            <Link href="/private/inbox" prefetch={true}className="flex items-center w-full" onClick={() => handleSidebarItemClick('/inbox')}>
                  <FaInbox className="mr-2" />
                  {isSidebarOpen && "My Inbox"}
              </Link>
            </li>
            <li className={`text-sm text-gray-300 p-4 mb-2 hover:bg-slate-800 hover:text-white hover:font-medium hover:rounded-lg flex items-center ${isLinkActive('/messanger')}`}>
            <Link href="/private/messanger" prefetch={true} className="flex items-center w-full" onClick={() => handleSidebarItemClick('/messanger')}>
                  <FaRocketchat className="mr-2" />
                  {isSidebarOpen && "Messanger"}
              </Link>
            </li>
            <li className={`text-sm text-gray-300 p-4 mb-2 hover:bg-slate-800 hover:text-white hover:font-medium hover:rounded-lg flex items-center ${isLinkActive('/contacts')}`}>
            <Link href="/private/contacts" prefetch={true} className="flex items-center w-full" onClick={() => handleSidebarItemClick('/contacts')}>
                  <FaPhone className="mr-2" />
                  {isSidebarOpen && "Contacts"}
              </Link>
            </li>
            <li className={`text-sm text-gray-300 p-4 mb-2 hover:bg-slate-800 hover:text-white hover:font-medium hover:rounded-lg flex items-centerss ${isLinkActive('/notes')}`}>
            <Link href="/private/notes" prefetch={true} className="flex items-center w-full" onClick={() => handleSidebarItemClick('/notes')}>
                  < FaRegWindowRestore className="mr-2" />
                  {isSidebarOpen && "Notes"}
              </Link>
            </li>
            <li className={`text-sm text-gray-300 p-4 mb-2 hover:bg-slate-800 hover:text-white hover:font-medium hover:rounded-lg flex items-center ${isLinkActive('/tasks')}`}>
            <Link href="/private/tasks" prefetch={true} className="flex items-center w-full" onClick={() => handleSidebarItemClick('/tasks')}>
                  <FaTasks className="mr-2" />
                  {isSidebarOpen && "Tasks"}
              </Link>
            </li>
            <li className='my-5'>
          <span className="font-semibold text-sm my-10 text-[#6BC9F7]">     
              {isSidebarOpen ? "Settings" : ("")} 
          </span>
          </li>
            <li className={`text-sm text-gray-300 p-4 mb-2 hover:bg-slate-800 hover:text-white hover:font-medium hover:rounded-lg flex items-center ${isLinkActive('/myprofile')}`}>
            <Link href="/private/myprofile" prefetch={true} className="flex items-center w-full" onClick={() => handleSidebarItemClick('/myprofile')}>
                  <FaUserAlt className="mr-2" />
                  {isSidebarOpen && "My Profile"}
              </Link>
            </li>
          
            <li className={`text-sm text-gray-300 p-4 mb-2 hover:bg-slate-800 hover:text-white hover:font-medium hover:rounded-lg flex items-center ${isLinkActive('/changepassword')}`}>
            <Link href="/changepassword" prefetch={true} className="flex items-center w-full" onClick={() => handleSidebarItemClick('/changepassword')}>
                  <FaKey className="mr-2" />
                  {isSidebarOpen && "Change Password"}
              </Link>
            </li>
            <li className={`text-sm text-gray-300 p-4 mb-2 hover:bg-slate-800 hover:text-white hover:font-medium hover:rounded-lg flex items-center ${isLinkActive('/logout')}`}>
            <Link href="/logout" className="flex items-center w-full" onClick={handleLogout}>
                  <FaSignOutAlt className="mr-2" />
                  {isSidebarOpen && "Logout"}
              </Link>
            </li>
          </ul>
   <div className=" bg-slate-800 text-slate-200   transition-width duration-300 bottom-0 w-64 sticky ">
    
{isSidebarOpen && (

       <>
       <div>
               <div className={`ml-2 flex items-center gap-3`}>
          {user?.profilePicUrl  ? (
                    <img src={user?.profilePicUrl } alt="Profile" className=" h-12 w-12 rounded-full cursor-pointer" 
                    // onClick={handleAvatarClick} 
                      loading="lazy"/>
            ):(
              <Image
              src={Avatar}
              alt="User Avatar" 
              className="rounded-full h-10 w-10 cursor-pointer"
              // onClick={handleAvatarClick}
            />
            )}
          {user?.firstName} {user?.lastName}
          </div>
          <p className='font-medium text-sm text-slate-200 ml-14'>{user?.email}</p>
            {/* )} */}
            </div>
          <div className={` text-white font-light font-xs mt-1 text-center `} style={{alignContent:"center"}}>
          {/* {user?.name} */}
          </div>
           {/* <p className='font-medium text-sm text-slate-200 text-center'>{user?.email}</p> */}
  </>
          ) }
   </div>
        </nav>

      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center z-50">
          {/* <div className="text-lg font-medium text-slate-600">Welcome, {userName}</div> */}
          <div className="hidden md:flex lg:flex items-center gap-2 text-xl text-slate-500 border border-slate-200">
          <Link href='/private/dashboard' className='p-2 hover:bg-slate-200'>
          <FaHome/>
          </Link>
          <Link href='/private/storage' className='p-2 hover:bg-slate-200'>
          <FaUsers/>
          </Link>
          <Link href='/private/mycalendar' className='p-2 hover:bg-slate-200'>
          <FaCalendarAlt/>
          </Link>
          <Link href='/private/writereport' className='p-2 hover:bg-slate-200'>
          <FaFileSignature/>
          </Link>
          <Link href='/private/reports' className='p-2 hover:bg-slate-200'>
          <FaFileAlt/>
          </Link>
          <Link href='/private/resources' className='p-2 hover:bg-slate-200'>
          <Globe/>
          </Link>
            </div>
          <div className="flex justify-end items-center gap-4 border border-slate-200">
          <Link href='/private/messanger' className='p-2 hover:bg-slate-200'>
          <div 
            className='p-2 hover:bg-slate-200 flex text-xl' 
            // onClick={resetUnreadCount}
          >
          <FaRegBell/>         
               {/* {unreadCount>0 ?  */}
               <div className="bg-yellow-500 text-white rounded-full h-3 w-3 flex align-center text-center justify-center"></div>
                {/* } */}
          </div>
          </Link>
            <div>
            </div>



            {user?.profilePicUrl ? (
                    <img src={user.profilePicUrl} alt="Profile" className=" h-12 w-12 rounded-full cursor-pointer"   loading="lazy"
                    // onClick={handleAvatarClick}
                    />
            ):(
              <Image
              src={Avatar}
              alt="User Avatar"
              className="rounded-full h-10 w-10 cursor-pointer"
              // onClick={handleAvatarClick}
            />
            )}

            {user ? (
        <div className="flex items-center">
          {/* Display the user's name and email */}
          <div className="mr-4">
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
      ) : (
        <Link href="/login">
          <span className="text-lg font-bold cursor-pointer">Login</span>
        </Link>
      )}
          </div>
        </header>
        {/* {showEmailCard && (
          <div className=' fixed right-5 top-12 p-5 z-50'>
            <EmailManagement onClose={handleCloseCard} />
          </div>
        )} */}
        <main className="p flex-grow overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Sidebar;
