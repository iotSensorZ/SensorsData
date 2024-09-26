'use client';
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Avatar from "@/public/images/avatar.jpg";
import { useUser } from "@/context/UserContext";
import { useActivityTracker } from "@/context/ActivityTracker";
import { io, Socket } from 'socket.io-client';

const socket: Socket = io('http://localhost:3001');

const Profile = () => {
    const { user } = useUser();
    const [timeSpent, setTimeSpent] = useState(0);
    const [buttonClicks, setButtonClicks] = useState({});
    const { trackPageView, trackButtonClick } = useActivityTracker();
    const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
      if (!user) return;
  
      const activityData = {
          userId: user.id,
          pageUrl: window.location.pathname,
          buttonClicks: {},
          timeSpent: isNaN(timeSpent) ? 0 : timeSpent, // Set default to 0 if NaN
          cursorPosition,
          lastUpdated,
      };
  
      if (socket) {
          socket.emit('track-activity', activityData);
      }
  }, [user, timeSpent, cursorPosition, lastUpdated]);
  
    useEffect(() => {
        const startTime = Date.now();

        const handleMouseMove = (event: MouseEvent) => {
            setCursorPosition({ x: event.clientX, y: event.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            const endTime = Date.now();
            const spentTime = endTime - startTime;
            if (spentTime>=0) {
                setTimeSpent(spentTime);
            } else {
                console.error('Calculated time spent is NaN');
                setTimeSpent(0)
              }
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);
  

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
