'use client'

import { useEffect, useState } from 'react'
import { Search, Eye, Edit, Ban, Trash2 } from 'lucide-react'
import { useTheme } from '../../../contexts/ThemeContext'
import { useToast } from '../../../contexts/ToastContext'
import Cookies from 'js-cookie'
import EditUser from './components/edit'
import ViewUser from './components/view'

export default function UsersPage() {
  const { theme } = useTheme()
  const { success, error } = useToast()

  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedEmail, setSelectedEmail] = useState('')

  const [openEdit, setOpenEdit] = useState(false)
  const [openView, setOpenView] = useState(false)

  // Check token validation
  useEffect(() => {
    const token = Cookies.get('token')
    if (!token) {
      window.location.href = '/landing/auth/login'
      return
    }
  }, [])

  useEffect(() => {
    getAllUsers()
  }, [])

  const getAllUsers = async () => {
    const res = await fetch('/api/admin/users/get-all-users')
    const data = await res.json()
    setUsers(data.data || [])
  }

  // 🔎 Search
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.mobileNumber?.includes(search)
  )

  /* ---------- ACTIONS ---------- */

  // DISABLE
  const disableUser = async (email: string) => {
    if (!confirm('Disable this user?')) return

    await fetch('/api/admin/users/disable-user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    getAllUsers()
  }

  // DELETE
  const deleteUser = async (email: string) => {
    if (!confirm('Delete this user permanently?')) return

    await fetch('/api/admin/users/delete-user', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })

    getAllUsers()
  }

  return (
    <div className="p-6">

      {/* Search */}
      <div className="mb-4 flex items-center gap-3">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search name, email, mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-lg border
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300'
              }`}
          />
        </div>
      </div>

      {/* Table */}
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
            {filteredUsers.map((user) => (
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

                {/* ACTIONS */}
                <td className="p-3 flex justify-center gap-3">

                  {/* Disable */}
                  <button
                    title="Disable"
                    onClick={() => disableUser(user.email)}
                    className="text-red-500 hover:scale-110"
                  >
                    <Ban size={18} />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => {
                      setSelectedEmail(user.email)
                      setOpenEdit(true)
                    }}
                    className="text-blue-600 hover:scale-110"
                  >
                    <Edit size={18} />
                  </button>

                  {/* View */}
                  <button
                    onClick={() => {
                      setSelectedEmail(user.email)
                      setOpenView(true)
                    }}
                    className="text-green-600 hover:scale-110"
                  >
                    <Eye size={18} />
                  </button>

                  {/* Delete */}
                  <button
                    title="Delete"
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
