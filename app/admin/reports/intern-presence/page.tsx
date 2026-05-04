'use client'

import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import InternsList from '../components/InternsList'
import FaceVerificationReport from '../components/FaceVerificationReport'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function InternPresencePage() {
  const { theme } = useTheme()
  const [selectedUser, setSelectedUser] = useState<any>(null)

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#0f1117] text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm mb-2 opacity-60">
          <span>Admin</span>
          <ChevronRight size={14} />
          <Link href="/admin/reports" className="hover:underline">
            Reports
          </Link>
          <ChevronRight size={14} />
          <span 
            className={`cursor-pointer hover:underline ${!selectedUser ? 'font-bold opacity-100' : ''}`}
            onClick={() => setSelectedUser(null)}
          >
            Intern Presence
          </span>
          {selectedUser && (
            <>
              <ChevronRight size={14} />
              <span className="font-bold opacity-100">Details</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/reports"
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
            }`}
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">
            {selectedUser ? `${selectedUser.name}'s Presence Report` : 'Interns Presence Reports'}
          </h1>
        </div>
      </div>

      {!selectedUser ? (
        <InternsList onViewDetail={(user: any) => setSelectedUser(user)} />
      ) : (
        <FaceVerificationReport 
          user={selectedUser} 
          onBack={() => setSelectedUser(null)} 
        />
      )}
    </div>
  )
}
