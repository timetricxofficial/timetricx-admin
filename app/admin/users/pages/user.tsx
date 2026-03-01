'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Eye, Edit, Ban, Trash2, CheckCircle } from 'lucide-react'
import { useTheme } from '../../../../contexts/ThemeContext'
import { useToast } from '../../../../contexts/ToastContext'
import EditUser from './components/edit'
import ViewUser from './components/view'
import Swal from 'sweetalert2'
import Loading from '@/components/ui/Loading'

interface UserProps {
  onEdit?: (email: string) => void
  onView?: (email: string) => void
}

interface CurrentAdmin {
  email: string
  edit: boolean
}

export default function User({ onEdit, onView }: UserProps) {
  const { theme } = useTheme()
  const { success, error } = useToast()

  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedEmail, setSelectedEmail] = useState('')

  const [openEdit, setOpenEdit] = useState(false)
  const [openView, setOpenView] = useState(false)
  const [currentAdmin, setCurrentAdmin] = useState<CurrentAdmin | null>(null)

  // 🔥 Get current admin from API (fresh data from DB)
  useEffect(() => {
    const fetchCurrentAdmin = async () => {
      try {
        const res = await fetch('/api/admin/get-current')
        const data = await res.json()
        
        if (data.success && data.data) {
          setCurrentAdmin({
            email: data.data.email,
            edit: data.data.edit
          })
        }
      } catch (err) {
        console.error('Failed to fetch current admin', err)
        setCurrentAdmin(null)
      }
    }
    
    fetchCurrentAdmin()
  }, [])

  // Permission check - only check edit flag
  const canEdit = () => currentAdmin?.edit === true
  const canDelete = () => currentAdmin?.edit === true
  const canToggle = () => currentAdmin?.edit === true

  // 🔥 Infinite Scroll
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const limit = 10

  /* ================= FETCH (Infinite Scroll) ================= */
  const fetchUsers = useCallback(async (pageNum: number, append: boolean = false) => {
    if (loading) return
    setLoading(true)
    
    try {
      const res = await fetch(`/api/admin/users/get-all-users?page=${pageNum}&limit=${limit}`)
      const data = await res.json()

      if (data.success) {
        // Filter only non-admin users
        const nonAdminUsers = data.data.filter((u: any) => u.role !== 'admin' && !u.email.includes('admin'))
        
        if (append) {
          setUsers(prev => {
            const existingIds = new Set(prev.map((u: any) => u._id))
            const newUsers = nonAdminUsers.filter((u: any) => !existingIds.has(u._id))
            return [...prev, ...newUsers]
          })
        } else {
          setUsers(nonAdminUsers)
        }
        setHasMore(data.pagination.hasMore)
      }
    } catch {
      error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [loading, error])

  // Initial load
  useEffect(() => {
    fetchUsers(1, false)
  }, [])

  // Auto load more on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return
      
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight
      
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        const nextPage = page + 1
        setPage(nextPage)
        fetchUsers(nextPage, true)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loading, hasMore, page, fetchUsers])

  /* ================= SEARCH ================= */
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.mobileNumber?.includes(search)
  )

  /* ================= ACTIONS ================= */

  // TOGGLE ENABLE/DISABLE
  const toggleUserStatus = async (email: string, isActive: boolean) => {
    const action = isActive ? 'Disable' : 'Enable'
    const result = await Swal.fire({
      title: `${action} User?`,
      text: isActive 
        ? 'User will not be able to login.' 
        : 'User will be able to login.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${action}`
    })

    if (!result.isConfirmed) return

    try {
      await fetch('/api/admin/users/disable-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      success(`User ${action.toLowerCase()}d successfully`)
      setPage(1)
      fetchUsers(1, false)
    } catch {
      error(`Failed to ${action.toLowerCase()} user`)
    }
  }

  // DELETE
  const deleteUser = async (email: string) => {
    const result = await Swal.fire({
      title: 'Delete User?',
      text: 'This action cannot be undone!',
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#2563eb',
      confirmButtonText: 'Yes, Delete'
    })

    if (!result.isConfirmed) return

    try {
      await fetch('/api/admin/users/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      success('User deleted successfully')
      setPage(1)
      fetchUsers(1, false)
    } catch {
      error('Failed to delete user')
    }
  }

  // EDIT
  const handleEdit = (email: string) => {
    if (onEdit) {
      onEdit(email)
    } else {
      setSelectedEmail(email)
      setOpenEdit(true)
    }
  }

  // VIEW
  const handleView = (email: string) => {
    if (onView) {
      onView(email)
    } else {
      setSelectedEmail(email)
      setOpenView(true)
    }
  }

  return (
    <div>
      {/* SEARCH */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search name, email, mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-lg border cursor-pointer
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300'
              }`}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className={`rounded-xl shadow overflow-x-auto
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>

        <table className="w-full">
          <thead className={theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-50'}>
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Mobile</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user, index) => (
              <tr
                key={`${user._id}-${index}`}
                className={`border-b transition-colors cursor-pointer
                  ${theme === 'dark'
                    ? 'border-gray-700 hover:bg-gray-700'
                    : 'border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.mobileNumber || '-'}</td>

                <td className="p-3">
                  <button
                    onClick={() => canToggle() && toggleUserStatus(user.email, user.isActive)}
                    disabled={!canToggle()}
                    className={`px-3 py-1 rounded-full text-xs transition ${
                      canToggle() ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-60'
                    } ${
                      user.isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {user.isActive ? 'Enabled' : 'Disabled'}
                  </button>
                </td>

                <td className="p-3 flex justify-center gap-3">

                  <button
                    onClick={() => canToggle() && toggleUserStatus(user.email, user.isActive)}
                    disabled={!canToggle()}
                    className={`${
                      canToggle() ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-30'
                    } ${
                      user.isActive ? 'text-red-500' : 'text-green-500'
                    }`}
                  >
                    {user.isActive ? <Ban size={18} /> : <CheckCircle size={18} />}
                  </button>

                  <button
                    onClick={() => canEdit() && handleEdit(user.email)}
                    disabled={!canEdit()}
                    className={`text-blue-600 ${
                      canEdit() ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-30'
                    }`}
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => handleView(user.email)}
                    className="text-green-600 hover:scale-110 cursor-pointer"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    onClick={() => canDelete() && deleteUser(user.email)}
                    disabled={!canDelete()}
                    className={`text-red-500 ${
                      canDelete() ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-30'
                    }`}
                  >
                    <Trash2 size={18} />
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-6">
          <Loading size="small" color="#3b82f6" />
        </div>
      )}

      {!hasMore && users.length > 0 && (
        <div className={`text-center mt-6 text-sm ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          No more users to load
        </div>
      )}

      {/* MODALS */}
      {openEdit && (
        <EditUser
          email={selectedEmail}
          close={() => setOpenEdit(false)}
        />
      )}

      {openView && (
        <ViewUser
          email={selectedEmail}
          close={() => setOpenView(false)}
        />
      )}
    </div>
  )
}
