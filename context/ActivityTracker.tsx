'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

interface ActivityTrackerContextType {
  trackPageView: (pageUrl: string) => void;
  trackButtonClick: (buttonName: string) => void;
  setCursorPosition: (x: number, y: number) => void; // New function to track cursor position
}

const ActivityTrackerContext = createContext<ActivityTrackerContextType | undefined>(undefined);

export const ActivityTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pageData, setPageData] = useState<{ [key: string]: { visitCount: number; buttonClicks: { [key: string]: number }; timeSpent: number; cursorPosition: { x: number; y: number }; lastUpdated: Date } }>({});
  const { user } = useUser();
  const [startTime, setStartTime] = useState<number | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const trackPageView = (url: string) => {
    if (!user) return;
  
    const currentData = pageData[url] || { visitCount: 0, buttonClicks: {}, timeSpent: 0, cursorPosition: { x: 0, y: 0 }, lastUpdated: new Date() };
    const newVisitCount = currentData.visitCount + 1;
    
    setPageData(prev => ({
      ...prev,
      [url]: {
        ...currentData,
        visitCount: newVisitCount,
        lastUpdated: new Date(),
      },
    }));
  
    let timeSpent = 0;
    if (startTime) {
      timeSpent = Math.floor((Date.now() - startTime) / 1000); 
    }
      socket.emit('track-activity', {
        userId: user.id,
        pageUrl: url,
        buttonClicks: {},
        timeSpent: isNaN(timeSpent) ? 0 : timeSpent,
        cursorPosition,
      });
  
    setStartTime(Date.now()); // Reset start time for the next session
  };
  
  const trackButtonClick = (buttonName: string) => {
    if (!user) return;
  
    const currentPage = window.location.pathname;
    const currentData = pageData[currentPage] || { visitCount: 0, buttonClicks: {}, timeSpent: 0, cursorPosition: { x: 0, y: 0 }, lastUpdated: new Date() };
  
    const updatedButtonClicks = {
      ...currentData.buttonClicks,
      [buttonName]: (currentData.buttonClicks[buttonName] || 0) + 1,
    };
  
    setPageData(prev => ({
      ...prev,
      [currentPage]: {
        ...currentData,
        buttonClicks: updatedButtonClicks,
        lastUpdated: new Date(),
      },
    }));
  
    let timeSpent = 0;
    if (startTime) {
      timeSpent = Math.floor((Date.now() - startTime) / 1000); // Time in seconds
    }
  
    socket.emit('track-activity', {
      userId: user.id,
      pageUrl: currentPage,
      buttonClicks: updatedButtonClicks, // Send updated button clicks
      timeSpent: isNaN(timeSpent) ? 0 : timeSpent, 
      cursorPosition,
    });
  };
  
  

  const updateCursorPosition = (x: number, y: number) => {
    setCursorPosition({ x, y });
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      updateCursorPosition(event.clientX, event.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <ActivityTrackerContext.Provider value={{ trackPageView, trackButtonClick, setCursorPosition: updateCursorPosition }}>
      {children}
    </ActivityTrackerContext.Provider>
  );
};

export const useActivityTracker = () => {
  const context = useContext(ActivityTrackerContext);
  if (!context) throw new Error('useActivityTracker must be used within an ActivityTrackerProvider');
  return context;
};
