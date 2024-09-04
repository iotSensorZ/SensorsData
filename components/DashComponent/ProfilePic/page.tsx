// components/Profile.tsx
'use client'
import React, { useEffect } from "react";
import Image from "next/image";
import Avatar from "@/public/images/avatar.jpg";
import { useUser } from "@/context/UserContext";



const Profile = () => {
    const { user } = useUser();
  return (
    <div className="flex items-center gap-2 justify-center">
      {user?.profilePicUrl ? (
        <img
          src={user.profilePicUrl}
          alt="Profile"
          className="h-20 w-20 rounded-full"
          loading="lazy"
        />
      ) : (
        <Image
          src={Avatar}
          alt="User Avatar"
          className="rounded-full h-10 w-10"
        />
      )}
    </div>
  );
};

export default Profile;
