// 'use client';
// import React, { createContext, useContext, useEffect, useRef } from 'react';
// import io, { Socket } from 'socket.io-client';

// interface WebSocketProviderProps {
//   children: React.ReactNode;
// }

// const WebSocketContext = createContext<Socket | null>(null);

// export const useSocket = () => useContext(WebSocketContext);

// export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
//   const socketRef = useRef<Socket | null>(null);

//   useEffect(() => {
//     socketRef.current = io('http://localhost:3001'); // Ensure this matches your Socket.IO server

//     socketRef.current.on('connect', () => {
//       console.log('Connected to WebSocket');
//     });

//     return () => {
//       socketRef.current?.disconnect();
//     };
//   }, []);

//   return (
//     <WebSocketContext.Provider value={socketRef.current}>
//       {children}
//     </WebSocketContext.Provider>
//   );
// };
