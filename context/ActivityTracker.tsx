'use client'
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useUser } from './UserContext';
import { io } from 'socket.io-client';
import { debounce } from 'lodash';

const socket = io('http://localhost:3001');

interface ActivityTrackerContextType {
  trackPageView: (pageUrl: string) => void;
  trackButtonClick: (buttonName: string) => void;
}

const ActivityTrackerContext = createContext<ActivityTrackerContextType | undefined>(undefined);

export const ActivityTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pageData, setPageData] = useState<{ [key: string]: { visitCount: number; buttonClicks: { [key: string]: number } } }>({});
  const { user } = useUser();

  const trackPageView = (url: string) => {
    setPageData((prev) => {
      const existingPage = prev[url] || { visitCount: 0, buttonClicks: {} };
      return {
        ...prev,
        [url]: { visitCount: existingPage.visitCount + 1, buttonClicks: existingPage.buttonClicks },
      };
    });
  };

  const trackButtonClick = (buttonName: string) => {
    setPageData((prev) => {
      const existingPage = prev[window.location.pathname] || { visitCount: 0, buttonClicks: {} };
      const existingButtonCount = existingPage.buttonClicks[buttonName] || 0;
      return {
        ...prev,
        [window.location.pathname]: {
          ...existingPage,
          buttonClicks: {
            ...existingPage.buttonClicks,
            [buttonName]: existingButtonCount + 1,
          },
        },
      };
    });
  };

  const handleActivityTracking = () => {
    if (!user) return;
  
    const userId = user.id;
  
    // Ensure pageData includes the pageUrl and its properties
    const activityData = {
      userId,
      pageData: {
        [window.location.pathname]: {
          pageUrl: window.location.pathname, // Include the pageUrl here
          visitCount: 1, // This should be incremented based on actual visits
          buttonClicks: {}, // This should include any button click counts
        },
      },
    };
  
    socket.emit('track-activity', activityData);
    setPageData({}); // Reset after sending
  };
  
  useEffect(() => {
    const debouncedTracking = debounce(handleActivityTracking, 2000);
    return () => {
      debouncedTracking();
    };
  }, [pageData, user]);

  return (
    <ActivityTrackerContext.Provider value={{ trackPageView, trackButtonClick }}>
      {children}
    </ActivityTrackerContext.Provider>
  );
};

export const useActivityTracker = (): ActivityTrackerContextType => {
  const context = useContext(ActivityTrackerContext);
  if (!context) {
    throw new Error('useActivityTracker must be used within an ActivityTrackerProvider');
  }
  return context;
};
