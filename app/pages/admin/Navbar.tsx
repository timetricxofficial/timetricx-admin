'use client';

import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, LogOut, Settings, User } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import Link from 'next/link';
import Dialog from '../../../components/ui/Dialog';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
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
      <div className={`${theme === 'dark' ? 'bg-[#000000]' : 'bg-white'} shadow-sm transition-colors relative`}>
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
                  className="flex items-center space-x-2 p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-all font-medium"
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
                </button>

                {/* Profile Dropdown */}
{showProfile && (
  <div className="absolute right-0 mt-3 w-72 z-50">
    
    {/* Glow */}
    <div className="absolute inset-0 rounded-3xl bg-transparent"></div>

    <div
      className={`
        relative overflow-hidden rounded-3xl border backdrop-blur-2xl
        shadow-[0_10px_50px_rgba(0,0,0,0.35)]
        transition-all duration-300
        ${
          theme === 'dark'
            ? 'bg-[#0f172a]/95 border-white/10'
            : 'bg-white/90 border-slate-200'
        }
      `}
    >
      
      {/* TOP PROFILE SECTION */}
      <div className="relative px-5 pt-5 pb-4">

        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>

        <div className="relative flex items-start gap-4">

          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className={`
                w-14 h-14 rounded-2xl
                flex items-center justify-center
                text-lg font-bold
                shadow-lg
                ${
                  theme === 'dark'
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
                }
              `}
            >
              {(adminProfile?.name || 'A')
                .charAt(0)
                .toUpperCase()}
            </div>

            {/* Online Dot */}
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#0f172a] bg-emerald-400"></span>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">

            <div className="flex items-center gap-2">
              <h3
                className={`
                  text-lg font-bold truncate
                  ${
                    theme === 'dark'
                      ? 'text-white'
                      : 'text-slate-800'
                  }
                `}
              >
                {adminProfile?.name || 'Admin'}
              </h3>

              <span
                className={`
                  px-2 py-0.5 rounded-full text-[10px]
                  font-bold uppercase tracking-wider
                  ${
                    theme === 'dark'
                      ? 'bg-blue-500/15 text-blue-300'
                      : 'bg-blue-100 text-blue-600'
                  }
                `}
              >
                Admin
              </span>
            </div>

            <p
              className={`
                text-sm mt-1 truncate
                ${
                  theme === 'dark'
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }
              `}
            >
              {adminProfile?.email || ''}
            </p>

            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>

              <span
                className={`
                  text-xs font-medium
                  ${
                    theme === 'dark'
                      ? 'text-emerald-300'
                      : 'text-emerald-600'
                  }
                `}
              >
                Active Session
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div
        className={`h-px w-full ${
          theme === 'dark'
            ? 'bg-white/5'
            : 'bg-slate-200'
        }`}
      />

      {/* MENU */}
      <div className="p-3 space-y-2">

        {/* PROFILE */}
        <button
          onClick={() => {
            setShowProfile(false);
            router.push('/admin/profile');
          }}
          className={`
            group w-full flex items-center justify-between
            px-4 py-3 rounded-2xl
            transition-all duration-300
            active:scale-[0.98]
            ${
              theme === 'dark'
                ? 'hover:bg-white/5 text-slate-200'
                : 'hover:bg-slate-100 text-slate-700'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div
              className={`
                w-10 h-10 rounded-xl
                flex items-center justify-center
                transition-all duration-300
                ${
                  theme === 'dark'
                    ? 'bg-blue-500/10 text-blue-300 group-hover:bg-blue-500/20'
                    : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                }
              `}
            >
              <User className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            </div>

            <div className="text-left">
              <p className="text-sm font-semibold">
                Profile
              </p>

              <p
                className={`
                  text-xs
                  ${
                    theme === 'dark'
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }
                `}
              >
                Manage admin profile
              </p>
            </div>
          </div>

          <span
            className={`
              text-lg transition-all duration-300
              group-hover:translate-x-1
              ${
                theme === 'dark'
                  ? 'text-slate-500'
                  : 'text-slate-400'
              }
            `}
          >
            →
          </span>
        </button>

        {/* LOGOUT */}
        <button
          onClick={() => {
            setShowProfile(false);
            setShowLogoutDialog(true);
          }}
          className={`
            group w-full flex items-center justify-between
            px-4 py-3 rounded-2xl
            transition-all duration-300
            active:scale-[0.98]
            ${
              theme === 'dark'
                ? 'hover:bg-red-500/10 text-red-300'
                : 'hover:bg-red-50 text-red-600'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div
              className={`
                w-10 h-10 rounded-xl
                flex items-center justify-center
                transition-all duration-300
                ${
                  theme === 'dark'
                    ? 'bg-red-500/10 text-red-300 group-hover:bg-red-500/20'
                    : 'bg-red-50 text-red-500 group-hover:bg-red-100'
                }
              `}
            >
              <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
            </div>

            <div className="text-left">
              <p className="text-sm font-semibold">
                Logout
              </p>

              <p
                className={`
                  text-xs
                  ${
                    theme === 'dark'
                      ? 'text-slate-500'
                      : 'text-slate-400'
                  }
                `}
              >
                End current session
              </p>
            </div>
          </div>

          <span
            className={`
              text-lg transition-all duration-300
              group-hover:translate-x-1
              ${
                theme === 'dark'
                  ? 'text-red-400'
                  : 'text-red-500'
              }
            `}
          >
            →
          </span>
        </button>
      </div>
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
            radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.45), transparent 60%),
            radial-gradient(circle at 50% 50%, rgba(30, 64, 175, 0.40), transparent 65%),
            radial-gradient(circle at 80% 50%, rgba(29, 78, 216, 0.45), transparent 60%)
          `,
          filter: 'blur(30px)'
        }}
      >
      </div>

      <Dialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        title="Logout Confirmation"
        message="Are you sure you want to logout from your admin account?"
        type="warning"
        confirmLabel="Logout"
        onConfirm={() => {
          localStorage.removeItem('user');
          document.cookie = 'adminToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'adminUser=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          router.push('/admin-auth');
        }}
      />
    </>
  );
}
