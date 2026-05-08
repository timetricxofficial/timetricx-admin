'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { Search, Eye, CheckCircle2, AlertCircle, Clock, Video } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSocket } from '@/hooks/useSocket'
import Swal from 'sweetalert2'

export default function InternsList({ onViewDetail }: { onViewDetail: (user: any) => void }) {
  const { theme } = useTheme()
  const { checkPresence, connected } = useSocket()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/reports/face-verification')
      const data = await res.json()
      if (data.success) setUsers(data.data)
    } catch (error) {
      console.error('Fetch users error:', error)
    } finally {
      setLoading(false)
    }
  }

   const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCheckPresence = (user: any) => {
    if (!connected) {
      Swal.fire({
        title: 'Connection Error',
        text: 'Socket is not connected. Please refresh the page.',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      })
      return
    }

    const success = checkPresence(user._id || user.id)
    if (success) {
      Swal.fire({
        title: 'Presence Check Sent',
        text: `Camera trigger request sent to ${user.name}`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      })
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      <style jsx>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -27;
          }
        }
      `}</style>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={18} />
        <input 
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-10 pr-4 py-2 rounded-xl border ${
            theme === 'dark' 
              ? 'bg-[#1a1c23] border-gray-800' 
              : 'bg-white border-gray-200'
          }`}
        />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 ">
        {filteredUsers.map((user, index) => (
          
          <motion.div
            key={user.email}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative overflow-hidden group"
          >

            {/* 🔥 SHAPE BACKGROUND */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
              <defs>
                <clipPath id={`clip-${user.email}`}>
<path d="
M 5 0 
H 95 
Q 100 0 100 5 

V 55 
Q 100 60 95 60 

H 5 
Q 0 60 0 55 

V 13 

Q 0 17 5 17 
H 15 

Q 20 17 20 13 
V 5 

Q 20 0 14 0 
Z
" />
                </clipPath>
                <filter id={`glow-${user.email}`}>
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <rect
                x="0"
                y="0"
                width="100"
                height="60"
                fill={theme === 'dark' ? '#1a1c23' : 'white'}
                clipPath={`url(#clip-${user.email})`}
              />
              <path
                d="
M 5 0 
H 95 
Q 100 0 100 5 

V 55 
Q 100 60 95 60 

H 5 
Q 0 60 0 55 

V 13 

Q 0 17 5 17 
H 15 

Q 20 17 20 13 
V 5 

Q 20 0 14 0 
Z
"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.5"
                strokeDasharray="2 25"
                className="animate-[dash_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                filter={`url(#glow-${user.email})`}
              />
            </svg>

            {/* 🔥 CONTENT */}
            <div className="relative z-10 ">

              {/* TOP */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  
                  <div className="relative w-15 h-15 mt-2 ml-2 flex items-center justify-center">
                    {/* Rotating Laser Light Effect */}
                    <div className="absolute w-[200%] h-[200%] bg-conic-gradient from-transparent via-indigo-500/40 to-transparent animate-[spin_4s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"></div>
                    
                    {/* Scatter Glow Effect */}
                    <div className="absolute -inset-2 bg-indigo-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="absolute inset-0 rounded-xl border-2 border-indigo-500/20 shadow-[0_0_10px_rgba(79,70,229,0.2)]"></div>
                    <div className="absolute inset-0.5 rounded-xl bg-indigo-500/10 flex items-center justify-center overflow-hidden shadow relative z-10">
                      {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-indigo-500 font-bold text-lg">{user.name[0]}</span>
                      )}
                    </div>
                  </div>

                  <div className="ml-5">
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-xs opacity-50">{user.email}</p>
                  </div>
                </div>

                <div className="flex gap-2 p-5">
                  <button 
                    onClick={() => user.isCheckedIn && handleCheckPresence(user)}
                    disabled={!user.isCheckedIn}
                    className={!user.isCheckedIn ? 'opacity-30 cursor-not-allowed' : ''}
                  >
                    <Video size={20} className={user.isCheckedIn ? 'text-green-500' : 'text-gray-400'} />
                  </button>
                  <button onClick={() => onViewDetail(user)}>
                    <Eye size={20} className="text-indigo-500" />
                  </button>
                </div>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-2 gap-3 p-5">
                <div className="p-3 rounded-xl bg-gray-800/40 text-center">
                  <div className="flex justify-center gap-1 text-green-500 text-xs mb-1">
                    <CheckCircle2 size={14} />
                    Success
                  </div>
                  <p className="font-bold">{user.todayStats.success}</p>
                </div>

                <div className="p-3 rounded-xl bg-gray-800/40 text-center">
                  <div className="flex justify-center gap-1 text-red-500 text-xs mb-1">
                    <AlertCircle size={14} />
                    Suspicious
                  </div>
                  <p className="font-bold">{user.todayStats.suspicious}</p>
                </div>
              </div>

              {/* FOOTER */}
              <div className="mt-4 flex justify-between text-xs opacity-60 p-5">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  Today’s Activity
                </div>
                <div>{user.todayStats.total} Sessions</div>
              </div>


            </div>

          </motion.div>

        ))}
      </div>
    </div>
  )
}