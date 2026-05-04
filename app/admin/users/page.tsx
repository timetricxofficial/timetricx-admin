'use client'

import { useState } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import User from './pages/user'
import Admin from './pages/admin'

export default function UsersPage() {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<'users' | 'admin'>('users')

  return (
    <div className="p-6">
      {/* TOGGLE SWITCH */}
      <div className="mb-6 flex items-center justify-center">
        <div 
          className={`relative flex items-center rounded-full p-1 w-64 h-12 cursor-pointer transition-all duration-300 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
          }`}
        >
          {/* Sliding Background */}
          <div 
            className={`absolute h-10 w-[calc(50%-4px)] rounded-full bg-blue-600 transition-all duration-300 ease-in-out ${
              activeTab === 'users' ? 'left-1' : 'left-[calc(50%+1px)]'
            }`}
          />
          
          {/* Users Button */}
          <button
            onClick={() => setActiveTab('users')}
            className={`relative z-10 flex-1 h-10 rounded-full text-sm font-medium transition-colors duration-300 ${
              activeTab === 'users' ? 'text-white' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Users
          </button>
          
          {/* Admin Button */}
          <button
            onClick={() => setActiveTab('admin')}
            className={`relative z-10 flex-1 h-10 rounded-full text-sm font-medium transition-colors duration-300 ${
              activeTab === 'admin' ? 'text-white' : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* CONTENT */}
      {activeTab === 'users' ? <User /> : <Admin />}
    </div>
  )
}
