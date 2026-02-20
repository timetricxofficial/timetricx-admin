'use client'

import { useEffect, useState } from 'react'
import { Search, Plus, Edit, Trash2, Video } from 'lucide-react'
import { useTheme } from '../../../contexts/ThemeContext'
import { useToast } from '../../../contexts/ToastContext'
import Swal from 'sweetalert2'
import AddMeeting from './components/AddMeeting'
import EditMeeting from './components/EditMeeting'

interface Meeting {
  _id: string
  projectName: string
  hostEmail: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  meetingLink: string
  participants: string[]
  projectId: string
  createdAt: string
  updatedAt: string
}

interface CurrentAdmin {
  email: string
  edit: boolean
}

export default function AdminMeetingsPage() {
  const { theme } = useTheme()
  const { success, error } = useToast()

  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [search, setSearch] = useState('')
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)
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
  const canCreate = () => currentAdmin?.edit === true

  useEffect(() => {
    getMeetings()
  }, [])

  const getMeetings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/meetings/list')
      const data = await res.json()

      if (data.success) {
        setMeetings(data.data)
      }
    } catch (err) {
      console.error('Failed to fetch meetings', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = meetings.filter(m =>
    m.projectName?.toLowerCase().includes(search.toLowerCase()) ||
    m.hostEmail?.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-700'
      case 'ongoing':
        return 'bg-green-100 text-green-700'
      case 'completed':
        return 'bg-blue-100 text-blue-700'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      default:
        return ''
    }
  }

  const handleJoin = (link: string) => {
    if (!link) return
    window.open(link, '_blank')
  }

  /* ---------------- DELETE MEETING ---------------- */
  const deleteMeeting = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You will not be able to recover this meeting!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!'
      })

      if (result.isConfirmed) {
        const res = await fetch(`/api/admin/meetings/${id}`, {
          method: 'DELETE'
        })

        if (res.ok) {
          success('Meeting deleted successfully')
          getMeetings()
        } else {
          error('Failed to delete meeting')
        }
      }
    } catch (err) {
      console.error('Delete meeting error:', err)
      error('Failed to delete meeting')
    }
  }

  return (
    <div className="p-6">

      {/* SEARCH + ADD */}
      <div className="mb-4 flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search meeting..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-lg border
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300'
              }`}
          />
        </div>

        <button
          onClick={() => setOpenAdd(true)}
          disabled={!canCreate()}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
            canCreate()
              ? 'bg-blue-600 hover:bg-blue-500 text-white'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          <Plus size={18} /> Schedule Meeting
        </button>
      </div>

      {/* TABLE */}
      <div
        className={`rounded-xl shadow overflow-x-auto
        ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
      >
        <table className="w-full">
          <thead className={theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-gray-50'}>
            <tr>
              <th className="p-3 text-left">Project</th>
              <th className="p-3 text-left">Host</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Join</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {!loading && filtered.map(meeting => (
              <tr
                key={meeting._id}
                className={`border-b transition-colors
                  ${theme === 'dark'
                    ? 'border-gray-700 hover:bg-gray-700'
                    : 'border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <td className="px-6 py-4 font-medium">
                  {meeting.projectName}
                </td>

                <td className="p-3 text-sm">
                  {meeting.hostEmail}
                </td>

                <td className="p-3 text-sm">
                  {new Date(meeting.startTime).toLocaleString()}
                </td>

                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs capitalize ${getStatusColor(meeting.status)}`}
                  >
                    {meeting.status}
                  </span>
                </td>

                {/* JOIN BUTTON */}
                <td className="p-3 text-center">
                  {meeting.status !== 'cancelled' && meeting.meetingLink ? (
                    <button
                      onClick={() => handleJoin(meeting.meetingLink)}
                      className="flex items-center gap-1 mx-auto px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded-lg transition"
                    >
                      <Video size={14} /> Join
                    </button>
                  ) : (
                    <span className="text-gray-400 text-xs">—</span>
                  )}
                </td>

                {/* ACTIONS */}
                <td className="p-3 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      if (canEdit()) {
                        setSelectedMeeting(meeting)
                        setOpenEdit(true)
                      }
                    }}
                    disabled={!canEdit()}
                    className={`text-blue-600 ${
                      canEdit() ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-30'
                    }`}
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => canDelete() && deleteMeeting(meeting._id)}
                    disabled={!canDelete()}
                    className={`text-gray-700 hover:text-red-600 ${
                      canDelete() ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-30'
                    }`}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}

            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Loading meetings...
                </td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No meetings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD MODAL */}
      {openAdd && (
        <AddMeeting
          onClose={() => {
            setOpenAdd(false)
            getMeetings()
          }}
        />
      )}

      {/* EDIT MODAL */}
      {openEdit && selectedMeeting && (
        <EditMeeting
          meeting={selectedMeeting}
          onClose={() => {
            setOpenEdit(false)
            setSelectedMeeting(null)
            getMeetings()
          }}
        />
      )}
    </div>
  )
}
