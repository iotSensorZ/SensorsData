"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from 'axios'
interface UserContextType {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      profilePicUrl?:string;
      firstName?: string; 
      lastName?: string;  
    } | null;
      refreshUserData: () => Promise<void>;
  }

  const UserContext = createContext<UserContextType | undefined>(undefined);

  export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<UserContextType["user"]>(null);
  
    const fetchUserProfile = useCallback(async () => {
      if (status === "authenticated" && session?.user) {
        try {
          const response = await axios.get(`/api/user/${session.user.id}`);
          setUser({
            ...response.data, // Ensure all fields including profilePicUrl are set
          });
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    }, [session, status]);
  
    useEffect(() => {
      fetchUserProfile();
    }, [fetchUserProfile]);
  
    // Expose the fetchUserProfile as refreshUserData to be used outside
    return <UserContext.Provider value={{ user, refreshUserData: fetchUserProfile }}>
      {children}
      </UserContext.Provider>;
  };
  
  export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
      throw new Error("useUser must be used within a UserProvider");
    }
    return context;
  };