'use client'

import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import Swal from 'sweetalert2'
import Cookies from 'js-cookie'

// Window-based socket storage (survives HMR)
const getGlobalSocket = (): Socket | null => {
  if (typeof window === 'undefined') return null
  return (window as any).__adminSocket || null
}

const setGlobalSocket = (socket: Socket | null) => {
  if (typeof window !== 'undefined') {
    (window as any).__adminSocket = socket
  }
}

export const useSocket = () => {
  const [connected, setConnected] = useState(false)
  const [adminData, setAdminData] = useState<any>(null)

  useEffect(() => {
    // Prevent double initialization in Strict Mode
    if ((window as any).__socketInitStarted) return
    ;(window as any).__socketInitStarted = true

    // Get admin data from cookie
    const adminUserCookie = Cookies.get('adminUser')
    let parsedAdmin: any = null
    if (adminUserCookie) {
      try {
        parsedAdmin = JSON.parse(adminUserCookie)
        setAdminData(parsedAdmin)
        console.log('Admin data loaded from cookie:', parsedAdmin)
      } catch (e) {
        console.error('Error parsing adminUser cookie:', e)
      }
    } else {
      console.error('No adminUser cookie found')
    }

    // Check if socket already exists
    let socket = getGlobalSocket()
    
    if (socket) {
      // Socket exists, sync state
      setConnected(socket.connected)
      if (socket.connected) return // Already connected, nothing to do
    }

    // Initialize socket
    const init = async () => {
      try {
        await fetch('/api/socket')
        
        // Check again after fetch
        if (getGlobalSocket()) return

        // Use env variable for socket server URL, fallback to current origin
        const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || window.location.origin
        
        socket = io(socketServerUrl, {
          path: '/api/socket',
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 2000,
        })

        socket.on('connect', () => {
          console.log('Admin Socket Connected:', socket?.id)
          setConnected(true)
          
          // Join room
          const adminId = parsedAdmin?.id || parsedAdmin?._id
          if (adminId) {
            console.log('Admin joining room:', adminId)
            socket?.emit('join_room', adminId)
          } else {
            console.error('No adminId found to join room')
          }
        })

        socket.on('disconnect', () => {
          console.log('Admin Socket Disconnected')
          setConnected(false)
        })

        socket.on('user_presence_result', (data) => {
          console.log('user_presence_result received:', data)
          const { status, score, userName, userId } = data
          
          if (status === 'verified') {
            // ✅ Green success - Human present + Face verified
            Swal.fire({
              title: '✅ User Verified',
              html: `<b>${userName || 'User'}</b> is present and verified<br>Match: <b>${Math.round((score || 0) * 100)}%</b>`,
              icon: 'success',
              confirmButtonColor: '#22c55e',
              timer: 5000,
              showConfirmButton: true
            })
          } else if (status === 'partial_match') {
            // ⚠️ Yellow warning - Human present but face partially matched
            Swal.fire({
              title: '⚠️ Partial Match',
              html: `<b>${userName || 'User'}</b> is in front of camera with partial match<br>Match: <b>${Math.round((score || 0) * 100)}%</b>`,
              icon: 'warning',
              confirmButtonColor: '#f59e0b',
              timer: 5000,
              showConfirmButton: true
            })
          } else if (status === 'present_but_failed') {
            // ⚠️ Yellow warning - Human present but face didn't match
            Swal.fire({
              title: '⚠️ Verification Failed',
              html: `<b>${userName || 'User'}</b> is in front of camera but face did <b>NOT</b> match<br>Match: <b>${Math.round((score || 0) * 100)}%</b>`,
              icon: 'warning',
              confirmButtonColor: '#f59e0b',
              timer: 5000,
              showConfirmButton: true
            })
          } else if (status === 'not_present') {
            // ❌ Red error - No one in front of camera
            Swal.fire({
              title: '❌ User Not Present',
              html: `<b>${userName || 'User'}</b> is <b>NOT</b> in front of camera<br>No face detected.`,
              icon: 'error',
              confirmButtonColor: '#ef4444',
              timer: 5000,
              showConfirmButton: true
            })
          } else {
            // Fallback for any other status
            Swal.fire({
              title: 'Verification Result',
              text: `${userName || 'User'}: ${status}`,
              icon: 'info',
              confirmButtonColor: '#4f46e5'
            })
          }
        })

        setGlobalSocket(socket)
      } catch (err) {
        console.error('Socket init error:', err)
      }
    }

    init()
  }, [])

  const checkPresence = useCallback((userId: string) => {
    const socket = getGlobalSocket()
    
    // Always read fresh from cookie
    let freshAdminData: any = null
    try {
      const adminUserCookie = Cookies.get('adminUser')
      if (adminUserCookie) {
        freshAdminData = JSON.parse(adminUserCookie)
        console.log('Fresh admin data from cookie:', freshAdminData)
      } else {
        console.error('No adminUser cookie found')
      }
    } catch (e) {
      console.error('Error parsing adminUser cookie:', e)
    }
    
    // Fallback to stored adminData if fresh read failed
    const effectiveAdminData = freshAdminData || adminData
    const adminId = effectiveAdminData?.id || effectiveAdminData?._id
    
    console.log('checkPresence called:', { userId, adminId, socketConnected: socket?.connected, effectiveAdminData })
    
    if (socket?.connected && adminId) {
      socket.emit('admin_request_presence', { userId, adminId })
      console.log('admin_request_presence emitted successfully')
      return true
    }
    
    console.error('checkPresence failed:', { hasSocket: !!socket, socketConnected: socket?.connected, hasAdminId: !!adminId })
    return false
  }, [adminData])

  // Get real-time connected status from global socket
  const isConnected = getGlobalSocket()?.connected || false

  return { connected: isConnected, checkPresence, adminData }
}
