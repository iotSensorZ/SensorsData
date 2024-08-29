import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/getSession";
import { redirect } from "next/navigation";
import { motion } from "framer-motion"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Avatar from "@/public/images/avatar.jpg"
import Loading from "@/public/images/spinner.gif"
import { UserCog } from 'lucide-react';
import { Mail } from 'lucide-react';
import { useEffect } from "react";
import { useUser } from "@/context/UserContext";
import Profile from "@/components/DashComponent/ProfilePic/page";
import CardNum from "@/components/DashComponent/CardNum/page";

const Dashboard = async () => {
const session = await getSession();
const user = session?.user;
if(!user)return redirect('/login');
// const {user} = useUser();
  console.log("User in DashboardPage:", user);

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

if (!user) {
  return(
 <div className="flex justify-center items-center mt-4">
 <Image src={Loading} alt='' width={200} height={200}
 />
   </div>
  )
   }


  return (
    <div className="">
           <div 
           className="relative overflow-hidden flex px-16 py-20 md:p-16 bg-white text-slate-800">
        <div className="flex flex-col lg:flex-row gap-4 mx-auto w-full">
<Profile/>
          <div className='flex flex-col gap-4 '>
            <div style={{alignItems:"center"}} className='flex flex-col lg:flex-row justify-between'>
            <h1 className="scroll-m-20 text-2xl font-bold tracking-tight lg:text-4xl">
              Welcome Back, {user.name} !
            </h1>
            <div className='flex gap-4'>
              <Link href='messanger'>
          <Button className='justify-end rounded-full gap-2' >
             <Mail />
             Messages</Button>
              </Link>
              <Link href='myprofile'>
          <Button className='justify-end gap-2' variant='purple'>
            <UserCog/>
            Profile</Button>
              </Link>
            </div>
            </div>
          <div className='flex'>
            <p className="leading-7 [&:not(:first-child)]:mt-6 text-slate-500">
              Comprehensive analysis of environmental readings, highlighting temperature, humidity, and air quality trends.
            </p>
          </div>

          </div>
        </div>
      </div>

      <CardNum/>

      </div>
  );
};

export default Dashboard;