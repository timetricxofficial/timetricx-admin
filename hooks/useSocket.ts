'use client'

import { useEffect, useState, useCallback } from 'react'
import { Socket } from 'socket.io-client'
import Swal from 'sweetalert2'
import Cookies from 'js-cookie'
import { createSocketClient } from '@/lib/socket'

// Window-based socket storage (survives HMR)
const getGlobalSocket = (): any => {
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
  const [lastPresenceResult, setLastPresenceResult] = useState<any>(null)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

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
        if (getGlobalSocket()) return

        const socket = createSocketClient()
        
        // Store immediately
        setGlobalSocket(socket)

        socket.on('connect', () => {
          console.log('✅ Admin Socket Connected:', socket?.id)
          setConnected(true)
          setConnectionError(null)
          setRetryCount(0)
          
          // Join room
          const adminId = parsedAdmin?.id || parsedAdmin?._id
          if (adminId) {
            console.log('👤 Admin joining room:', adminId)
            socket?.emit('join_room', { adminId, role: 'admin' })
          } else {
            console.error('❌ No adminId found to join room')
          }
        })

        socket.on('disconnect', (reason) => {
          console.log('❌ Admin Socket Disconnected:', reason)
          console.log('   - Socket State:', {
            connected: socket?.connected,
            disconnected: socket?.disconnected,
            id: socket?.id
          })
          setConnected(false)
          setConnectionError(`Disconnected: ${reason}`)
        })

        socket.on('connect_error', (err: any) => {
          const errMsg = err?.message || String(err)
          console.error('❌ Socket connect_error:', errMsg)
          console.error('   - Full Error:', err)
          console.error('   - Socket State:', {
            connected: socket?.connected,
            disconnected: socket?.disconnected
          })
          setConnectionError(errMsg)
          setRetryCount(prev => prev + 1)
        })

        socket.on('error', (err: any) => {
          const errMsg = err?.message || String(err)
          console.error('❌ Socket error event:', errMsg)
          console.error('   - Full Error:', err)
          setConnectionError(errMsg)
        })

        socket.on('user_presence_result', (data) => {
          console.log('📨 user_presence_result received:', data)
          setLastPresenceResult(data)

          const { status, score, userName, message } = data
          const headline = status === 'verified'
            ? '✅ User Verified'
            : status === 'partial_match'
            ? '⚠️ Partial Match'
            : status === 'present_but_failed'
            ? '⚠️ Verification Failed'
            : status === 'not_present'
            ? '❌ User Not Present'
            : 'Verification Result'

          const detail = message
            ? `${message}`
            : `${userName || 'User'} — Match: ${Math.round((score || 0) * 100)}%`

          Swal.fire({
            title: headline,
            html: `<b>${userName || 'User'}</b><br>${detail}`,
            icon: status === 'verified' ? ('success' as any)
              : status === 'partial_match' ? ('warning' as any)
              : status === 'present_but_failed' ? ('warning' as any)
              : status === 'not_present' ? ('error' as any)
              : ('info' as any),
            confirmButtonColor: status === 'verified' ? '#22c55e' : '#ef4444',
            timer: 5000,
            showConfirmButton: true
          })

          window.setTimeout(() => setLastPresenceResult(null), 12000)
        })

        console.log('🔌 Socket client initialized, waiting for connection...')
        console.log('   - Socket ID (before connect):', socket?.id)
        console.log('   - Socket Connected:', socket?.connected)
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        console.error('❌ Socket init error:', errMsg)
        console.error('   - Full Stack:', err)
        setConnectionError(errMsg)
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

  return { connected, checkPresence, adminData, lastPresenceResult, connectionError, retryCount }
}
