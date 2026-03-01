'use client';

import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, LogOut, Settings, User } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';


export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Fetch admin profile for profile picture
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const res = await fetch('/api/admin/profile')
        const data = await res.json()
        if (data.success) {
          setAdminProfile(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch admin profile:', error)
      }
    }

    fetchAdminProfile()
  }, [])

  /* ================= CLICK OUTSIDE ================= */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    if (showProfile) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfile]);

  return (
    <>
      <div className={`${theme === 'dark' ? 'bg-[#000000]' : 'bg-white'} shadow-sm transition-colors relative `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo Section */}
            <div className="flex items-center">
              <img
                src="/Timetricx logo.svg"
                alt="Timetricx Admin"
                className="h-8 w-auto mr-3"
              />
              <span className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Admin
              </span>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* <div className="mb-30">
          <Link
            href="/settings"
            className={`
              w-12 h-12 rounded-xl 
              flex items-center justify-center
              transition-all duration-300

              ${pathname === "/settings"
                ? "bg-indigo-500 text-white shadow-[0_0_20px_#6366f1]"
                : theme === 'dark'
                  ? "text-gray-300 hover:bg-gray-700"
                  : "text-gray-900 hover:bg-gray-200"
              }
            `}
          >
            <Settings size={22} />
          </Link>
        </div> */}
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg ${theme === 'dark'
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } transition-colors`}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Admin Profile */}
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center space-x-2 p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all"
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-white flex items-center justify-center">
                    {adminProfile?.profilePicture ? (
                      <Image
                        src={adminProfile.profilePicture}
                        alt={adminProfile.name || 'Admin'}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-bold text-blue-500">
                        {adminProfile?.name?.charAt(0) || 'A'}
                      </span>
                    )}
                  </div>
                  {/* <span className="text-sm font-medium">Admin</span> */}
                </button>

                {/* Profile Dropdown */}
                {showProfile && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    } border z-50`}>

                    <div className={`p-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                        {adminProfile?.name || 'Admin'}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {adminProfile?.email || ''}
                      </p>
                    </div>

                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowProfile(false);
                          router.push('/admin/profile');
                        }}
                        className={`w-full flex items-center space-x-2 px-3 py-2 text-sm ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                          } transition-colors`}>
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </button>

                      <button
                        onClick={async () => {
                          setShowProfile(false);
                          const result = await Swal.fire({
                            title: 'Logout?',
                            text: 'Are you sure you want to logout?',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonColor: '#ef4444',
                            cancelButtonColor: '#6b7280',
                            confirmButtonText: 'Yes, Logout'
                          });
                          if (result.isConfirmed) {
                            localStorage.removeItem('user');
                            router.push('/');
                          }
                        }}
                        className={`w-full flex items-center space-x-2 px-3 py-2 text-sm ${theme === 'dark' ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'
                          } transition-colors`}>
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Blue Glow Border Below Navbar */}
      <div
        className="relative h-6 w-full"
        style={{
          background: `
      radial-gradient(circle at 20% 50%, rgba(37,99,235,0.45), transparent 60%),
      radial-gradient(circle at 50% 50%, rgba(30,64,175,0.40), transparent 65%),
      radial-gradient(circle at 80% 50%, rgba(29,78,216,0.45), transparent 60%)
    `,
          filter: 'blur(30px)'
        }}
      >
      </div>

    </>
  );
}
