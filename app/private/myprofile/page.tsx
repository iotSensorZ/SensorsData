import ProfilePage from "@/components/ProfilePage/page";
import Image from "next/image";
import Ship from '@/public/images/cover.jpg';

const MyProfile = () => {
    return (
        <div>
            
            <div className="relative overflow-hidden flex  px-40 py-10 md:p-40 bg-slate-200 text-black">
    
          <Image src={Ship} alt=''  layout="fill"
                quality={100} className="w-30 h-screen absolute inset-0 pointer-events-none"/>
       
            </div>
            <ProfilePage/>
        </div>
      )
};

export default MyProfile;