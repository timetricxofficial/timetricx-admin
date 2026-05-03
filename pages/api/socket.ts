import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as ServerIO } from 'socket.io'
import { NextApiResponseServerIO } from '@/types/next'

export const config = {
  api: {
    bodyParser: false,
  },
}

const socketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    console.log('New Socket.io server... initializing')
    const httpServer: NetServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_ENV === 'production' 
          ? ['https://ttadmin.cybershoora.com', 'https://timetricx.cybershoora.com']
          : ['http://localhost:3000', 'http://localhost:3002', 'https://ttadmin.cybershoora.com', 'https://timetricx.cybershoora.com'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
    })

    io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id)

      socket.on('join_room', (roomId) => {
        socket.join(roomId)
        console.log(`Socket ${socket.id} joined room: ${roomId}`)
      })

      socket.on('admin_request_presence', (data) => {
        const { userId, adminId } = data
        console.log(`Admin ${adminId} requesting presence for User ${userId}`)
        // Forward to the specific user's room
        io.to(userId).emit('trigger_face_verification', { adminId })
      })

      socket.on('verification_result', (data) => {
        const { userId, adminId, status, score, userName } = data
        console.log(`Verification result received:`, { userId, adminId, status, score, userName })
        
        // Debug: Show all rooms
        const rooms = Array.from(io.sockets.adapter.rooms.keys())
        console.log(`Active rooms:`, rooms)
        console.log(`Attempting to emit to admin room: ${adminId}`)
        
        // Forward back to the admin's room
        io.to(adminId).emit('user_presence_result', { userId, status, score, userName })
        console.log(`Emitted user_presence_result to room ${adminId}`)
      })

      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id)
      })
    })

    res.socket.server.io = io
  }
  res.end()
}

export default socketHandler
