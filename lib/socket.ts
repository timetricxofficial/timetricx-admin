// import { io, Socket } from 'socket.io-client'

// export function createSocketClient(): Socket {
//   // For development: always use localhost:3002 regardless of env variable
//   // For production: use env variable or default to production URL
//   let socketServerUrl = 'https://timetricx.cybershoora.com'

//   if (typeof window !== 'undefined') {
//     // Check if we're in development (localhost domain)
//     const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    
//     if (isDev) {
//       socketServerUrl = 'http://localhost:3002'
//     } else {
//       // Production: try env variable first, then default
//       socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'https://timetricx.cybershoora.com'
//     }
//   }

//   console.log('🔗 Socket Factory:')
//   console.log(`   - URL: ${socketServerUrl}`)
//   console.log(`   - Hostname: ${typeof window !== 'undefined' ? window.location.hostname : 'server-side'}`)
//   console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`)
//   console.log(`   - NEXT_PUBLIC_SOCKET_SERVER_URL: ${process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'not set'}`)

//   return io(socketServerUrl, {
//     path: '/api/socket',
//     transports: ['polling', 'websocket'],
//     withCredentials: true,
//     reconnection: true,
//     reconnectionAttempts: 10,
//     reconnectionDelay: 1000,
//     reconnectionDelayMax: 5000,
//     randomizationFactor: 0.5,
//     secure: socketServerUrl.includes('https'),
//     rejectUnauthorized: false,
//     extraHeaders: {
//       'Access-Control-Allow-Credentials': 'true',
//     },
//   })
// }
import { io, Socket } from "socket.io-client";

export function createSocketClient(): Socket {

  const socketServerUrl =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
      ? "http://localhost:3002"
      : "https://timetricx-testing.vercel.app";

  console.log("🔗 Socket URL:", socketServerUrl);

  return io(socketServerUrl, {
    path: "/api/socket",
    transports: ["polling", "websocket"],
    withCredentials: true,

    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });
}