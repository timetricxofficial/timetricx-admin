'use client'

import { useEffect, useState } from 'react'
import { Search, Eye, Edit, Ban, Trash2 } from 'lucide-react'
import { useTheme } from '../../../contexts/ThemeContext'
import { useToast } from '../../../contexts/ToastContext'
import Cookies from 'js-cookie'
import EditUser from './components/edit'
import ViewUser from './components/view'
import Swal from 'sweetalert2'

export default function UsersPage() {
  const { theme } = useTheme()
  const { success, error } = useToast()

  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedEmail, setSelectedEmail] = useState('')

  const [openEdit, setOpenEdit] = useState(false)
  const [openView, setOpenView] = useState(false)

  // 🔥 Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 10

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const token = Cookies.get('adminToken')
    if (!token) {
      window.location.href = '/admin/login'
      return
    }
  }, [])

  /* ================= FETCH ================= */
  useEffect(() => {
    getAllUsers()
  }, [])

  const getAllUsers = async () => {
    try {
      const res = await fetch('/api/admin/users/get-all-users')
      const data = await res.json()
      setUsers(data.data || [])
    } catch {
      error('Failed to fetch users')
    }
  }

  /* ================= SEARCH ================= */
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.mobileNumber?.includes(search)
  )

  /* ================= PAGINATION LOGIC ================= */
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  /* ================= ACTIONS ================= */

  // DISABLE
  const disableUser = async (email: string) => {
    const result = await Swal.fire({
      title: 'Disable User?',
      text: 'User will not be able to login.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Disable'
    })

    if (!result.isConfirmed) return

    try {
      await fetch('/api/admin/users/disable-user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      success('User disabled successfully')
      getAllUsers()
    } catch {
      error('Failed to disable user')
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
      getAllUsers()
    } catch {
      error('Failed to delete user')
    }
  }

  return (
    <div className="p-6">

      {/* SEARCH */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search name, email, mobile..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className={`w-full pl-9 pr-3 py-2 rounded-lg border
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
            {currentUsers.map((user) => (
              <tr
                key={user._id}
                className={`border-b transition-colors
                  ${theme === 'dark'
                    ? 'border-gray-700 hover:bg-gray-700'
                    : 'border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.mobileNumber || '-'}</td>

                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-xs
                    ${user.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                    }`}>
                    {user.isActive ? 'Enabled' : 'Disabled'}
                  </span>
                </td>

                <td className="p-3 flex justify-center gap-3">

                  <button
                    onClick={() => disableUser(user.email)}
                    className="text-red-500 hover:scale-110"
                  >
                    <Ban size={18} />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedEmail(user.email)
                      setOpenEdit(true)
                    }}
                    className="text-blue-600 hover:scale-110"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedEmail(user.email)
                      setOpenView(true)
                    }}
                    className="text-green-600 hover:scale-110"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    onClick={() => deleteUser(user.email)}
                    className="text-gray-700 hover:text-red-600 hover:scale-110"
                  >
                    <Trash2 size={18} />
                  </button>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">

          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-40"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded
                ${currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 text-black'
                }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-40"
          >
            Next
          </button>

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
