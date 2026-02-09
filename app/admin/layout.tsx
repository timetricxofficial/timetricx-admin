'use client'

import Sidebar from "../pages/admin/Sidebar"
import Navbar from "../pages/admin/Navbar"
import { useTheme } from '../../contexts/ThemeContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { theme } = useTheme()
  
  return (
    <div className={`min-h-screen transition-colors ${
      theme === 'dark' ? 'bg-[#000000]' : 'bg-gray-50'
    }`}>
      <Sidebar />
      
      <div className={`ml-28 w-[85%] relative border-b transition-colors ${
        theme === 'dark' ? 'border-blue-400/30' : 'border-blue-400/40'
      }`} style={{
            boxShadow: theme === 'dark' 
              ? `
                0 8px 48px rgba(59,130,246,0.15),
                0 16px 100px rgba(59,130,246,0.10)
              `
              : `
                0 8px 48px rgba(59,130,246,0.25),
                0 16px 100px rgba(59,130,246,0.15)
              `
          }}>

        {/* Top Glow Border Wrapper */}
        
          <Navbar />

        <main className={`p-6 min-h-screen transition-colors ${
          theme === 'dark' ? 'bg-[#000000]' : 'bg-gray-50'
        }`}>
          {children}
        </main>

      </div>
    </div>
  )
}
