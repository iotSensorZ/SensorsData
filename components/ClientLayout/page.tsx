'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from "@/components/ui/auth/Navbar"
import io, { Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

let socket: Socket;

const ClientSideLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const noLayout = ['/login', '/register'].includes(pathname);
  const router = useRouter();

  const { data: session,status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (session?.user) {
      if (noLayout) {
        router.push("/private/dashboard");
      }
    } else if (!session?.user && !noLayout) {
      router.push('/login');
    }
  }, [router, session, noLayout]);

  return noLayout ? <>{children}</> : <Navbar>{children}</Navbar>;
};

export default ClientSideLayout;
