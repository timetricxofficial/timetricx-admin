'use client'

import { useEffect, useState } from 'react'
import { Search, Plus, Edit, Trash2, Video } from 'lucide-react'
import { useTheme } from '../../../contexts/ThemeContext'
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

export default function AdminMeetingsPage() {
  const { theme } = useTheme()

  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [search, setSearch] = useState('')
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [loading, setLoading] = useState(true)

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
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition"
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
                      setSelectedMeeting(meeting)
                      setOpenEdit(true)
                    }}
                    className="text-blue-600 hover:scale-110 transition"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    className="text-gray-700 hover:text-red-600 hover:scale-110 transition"
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
