// next-auth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    role?: string; 
  }

  interface Session {
    user: {
      id: string;
      role?: string; 
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string; 
  }
}


declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      profilePicUrl?: string;
    };
  }

  interface User {
    id: string;
    role: string;
    profilePicUrl?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    profilePicUrl?: string;
  }
}
