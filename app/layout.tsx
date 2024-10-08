import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/auth/Navbar";
import { SessionProvider } from "next-auth/react";
import ClientSideLayout from "@/components/ClientLayout/page";
import { UserProvider } from "@/context/UserContext";
import { ActivityTrackerProvider } from "@/context/ActivityTracker";
// import { WebSocketProvider } from "@/context/WebSocketContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
<SessionProvider>
  <UserProvider>
    {/* <WebSocketProvider> */}
    <ActivityTrackerProvider>
  <ClientSideLayout>
        {children}
  </ClientSideLayout>
    </ActivityTrackerProvider>
    {/* </WebSocketProvider> */}
  </UserProvider>
</SessionProvider>
        </body>
    </html>
  );
}
