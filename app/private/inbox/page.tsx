'use client'
import React from 'react';
import { useSearchParams } from 'next/navigation';
// import MessageDetail from './[messageId]/page';
import InboxList from '@/components/Inbox/InboxList/page';
import InboxWindow from '@/components/Inbox/InboxWindow/page';
import MessageDetail from './[messageId]/page';

const Inbox: React.FC = () => {
  const searchParams = useSearchParams();
  const messageId = searchParams.get('messageId');

  return (
    <div className="flex h-screen overflow-hidden">
      <InboxList />
      {messageId ? <MessageDetail messageId={messageId} /> : <InboxWindow />}
    </div>
  );
};

export default Inbox;
