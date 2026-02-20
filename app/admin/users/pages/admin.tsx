'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '../../../../contexts/ThemeContext'
import { useToast } from '../../../../contexts/ToastContext'
import { Search, Edit, Eye, Trash2, Ban, CheckCircle } from 'lucide-react'
import Swal from 'sweetalert2'
import AddAdmin from '../components/addadmin'
import ViewAdmin from '../components/viewadmin'
import EditAdmin from '../components/editadmin'

interface AdminData {
  _id: string
  name: string
  email: string
  designation: string
  mobileNumber: string
  status: string
  edit: boolean
  isDisabled: boolean
  createdAt: string
  updatedAt: string
}

interface CurrentAdmin {
  email: string
  status: string
  edit: boolean
}

export default function Admin() {
  const { theme } = useTheme()
  const { success, error } = useToast()
  const [admins, setAdmins] = useState<AdminData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [showViewAdmin, setShowViewAdmin] = useState(false)
  const [showEditAdmin, setShowEditAdmin] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState('')
  const [currentAdmin, setCurrentAdmin] = useState<CurrentAdmin | null>(null)

  /* ---------------- GET CURRENT ADMIN FROM API ---------------- */
  useEffect(() => {
    const fetchCurrentAdmin = async () => {
      try {
        const res = await fetch('/api/admin/get-current')
        const data = await res.json()
        
        if (data.success && data.data) {
          setCurrentAdmin({
            email: data.data.email,
            status: data.data.status,
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

  /* ---------------- PERMISSION CHECKS ---------------- */
  const isRegularAdmin = () => currentAdmin?.status === 'admin'
  const isSuperAdminNoEdit = () => currentAdmin?.status === 'superadmin' && currentAdmin?.edit === false
  const isSuperAdminWithEdit = () => currentAdmin?.status === 'superadmin' && currentAdmin?.edit === true
  const canView = () => !isRegularAdmin()
  const canEdit = () => isSuperAdminWithEdit()
  const canDelete = () => isSuperAdminWithEdit()
  const canToggle = () => isSuperAdminWithEdit()
  const canCreate = () => isSuperAdminWithEdit()

  /* ---------------- FETCH ADMINS ---------------- */
  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/getadmins')
      const data = await res.json()

      if (data.success) {
        setAdmins(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch admins', err)
      error('Failed to fetch admins')
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- TOGGLE ADMIN STATUS ---------------- */
  const toggleAdminStatus = async (email: string, isDisabled: boolean) => {
    const action = isDisabled ? 'Enable' : 'Disable'
    const result = await Swal.fire({
      title: `${action} Admin?`,
      text: isDisabled ? 'Admin will be able to login.' : 'Admin will not be able to login.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${action}`
    })

    if (!result.isConfirmed) return

    try {
      await fetch('/api/admin/admins/toggle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      success(`Admin ${action.toLowerCase()}d successfully`)
      fetchAdmins()
    } catch {
      error(`Failed to ${action.toLowerCase()} admin`)
    }
  }

  /* ---------------- DELETE ADMIN ---------------- */
  const deleteAdmin = async (email: string, name: string) => {
    const result = await Swal.fire({
      title: 'Delete Admin?',
      html: `Are you sure you want to delete <b>${name}</b>?<br>This action cannot be undone!`,
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#2563eb',
      confirmButtonText: 'Yes, Delete'
    })

    if (!result.isConfirmed) return

    try {
      await fetch('/api/admin/admins/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      success('Admin deleted successfully')
      fetchAdmins()
    } catch {
      error('Failed to delete admin')
    }
  }

  /* ---------------- EDIT ADMIN ---------------- */
  const editAdmin = (email: string) => {
    setSelectedEmail(email)
    setShowEditAdmin(true)
  }

  /* ---------------- VIEW ADMIN ---------------- */
  const viewAdmin = (email: string) => {
    setSelectedEmail(email)
    setShowViewAdmin(true)
  }

  /* ---------------- FILTER ---------------- */
  const filtered = admins.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.designation?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6">
      {/* TOGGLE TABS */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* SEARCH */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search admins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border outline-none transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500'
              }`}
            />
          </div>
        </div>

        {/* CREATE ADMIN BUTTON */}
        <button
          onClick={() => setShowAddAdmin(true)}
          disabled={!canCreate()}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            canCreate()
              ? theme === 'dark'
                ? 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
                : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          + Create Admin
        </button>
      </div>

      {/* TABLE */}
      <div className={`rounded-xl shadow overflow-x-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <table className="w-full">
          <thead className={theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-50'}>
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Designation</th>
              <th className="p-3 text-left">Mobile</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {!loading && filtered.map((admin, index) => (
              <tr
                key={`${admin._id}-${index}`}
                className={`border-b transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'border-gray-700 hover:bg-gray-700'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <td className="p-3">{admin.name || '-'}</td>
                <td className="p-3">{admin.email}</td>
                <td className="p-3">{admin.designation || '-'}</td>
                <td className="p-3">{admin.mobileNumber || '-'}</td>

                {/* STATUS */}
                <td className="p-3">
                  <button
                    onClick={() => canToggle() && toggleAdminStatus(admin.email, admin.isDisabled)}
                    disabled={!canToggle()}
                    className={`px-3 py-1 rounded-full text-xs transition ${
                      canToggle() ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-60'
                    } ${
                      !admin.isDisabled
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {!admin.isDisabled ? 'Enabled' : 'Disabled'}
                  </button>
                </td>

                {/* ACTIONS */}
                <td className="p-3 flex justify-center gap-3">
                  {/* Enable/Disable */}
                  <button
                    onClick={() => canToggle() && toggleAdminStatus(admin.email, admin.isDisabled)}
                    disabled={!canToggle()}
                    className={`${
                      canToggle() ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-30'
                    } ${
                      !admin.isDisabled ? 'text-red-500' : 'text-green-500'
                    }`}
                  >
                    {!admin.isDisabled ? <Ban size={18} /> : <CheckCircle size={18} />}
                  </button>

                  {/* Edit */}
                  <button 
                    onClick={() => canEdit() && editAdmin(admin.email)}
                    disabled={!canEdit()}
                    className={`text-blue-600 ${
                      canEdit() ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-30'
                    }`}
                  >
                    <Edit size={18} />
                  </button>

                  {/* View */}
                  <button 
                    onClick={() => canView() && viewAdmin(admin.email)}
                    disabled={!canView()}
                    className={`text-green-600 ${
                      canView() ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-30'
                    }`}
                  >
                    <Eye size={18} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => canDelete() && deleteAdmin(admin.email, admin.name || 'Admin')}
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

            {/* LOADING */}
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Loading admins...
                </td>
              </tr>
            )}

            {/* EMPTY */}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No admins found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* COUNT */}
      <div className="mt-4 text-sm text-gray-500">
        Showing {filtered.length} of {admins.length} admins
      </div>

      {/* ADD ADMIN MODAL */}
      {showAddAdmin && (
        <AddAdmin
          close={() => setShowAddAdmin(false)}
          onSuccess={() => fetchAdmins()}
        />
      )}

      {/* VIEW ADMIN MODAL */}
      {showViewAdmin && (
        <ViewAdmin
          email={selectedEmail}
          close={() => setShowViewAdmin(false)}
        />
      )}

      {/* EDIT ADMIN MODAL */}
      {showEditAdmin && (
        <EditAdmin
          email={selectedEmail}
          close={() => setShowEditAdmin(false)}
          onSuccess={() => fetchAdmins()}
        />
      )}
    </div>
  )
}
