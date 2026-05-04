'use client'

import { useEffect, useState, useRef } from 'react'
import { useTheme } from '../../../contexts/ThemeContext'
import { useToast } from '../../../contexts/ToastContext'
import { Search, Plus, Edit, Trash2, Megaphone, AlertCircle, CheckCircle, Info } from 'lucide-react'
import Swal from 'sweetalert2'
import AddAnnouncement from './components/AddAnnouncement'
import EditAnnouncement from './components/EditAnnouncement'
import { useInfiniteScroll } from '../../../hooks/useInfiniteScroll'

interface Announcement {
  _id: string
  title: string
  description: string
  link?: string
  linkText: string
  type: 'info' | 'warning' | 'success' | 'urgent'
  startAt: string
  endAt: string
  isActive: boolean
  targetAudienceType: 'all' | 'selected' | 'workingRole'
  targetAudienceData: string[]
  createdAt: string
}

interface HolidayRequest {
  _id: string
  userEmail: string
  holidayDate: string
  status: 'pending' | 'approved' | 'rejected'
  appliedAt: string
  reason?: string
  holidayId?: {
    title: string
    date: string
  }
}

interface HelpTicket {
  _id: string
  userId: string
  userEmail: string
  userName: string
  subject: string
  message: string
  priority: 'low' | 'medium' | 'high'
  category: 'technical' | 'attendance' | 'account' | 'other'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  adminReply?: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
}

/* =========================================
   ANNOUNCEMENTS TAB (New Admin Management)
========================================= */
function AnnouncementsTab() {
  const { theme } = useTheme()
  const { success, error } = useToast()

  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [search, setSearch] = useState('')
  const [openAdd, setOpenAdd] = useState(false)
  const [editAnnouncement, setEditAnnouncement] = useState<Announcement | null>(null)

  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const loadingRef = useRef(false)
  const limit = 10

  const observerTarget = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: () => setPage(p => p + 1)
  })

  // Fetch announcements
  useEffect(() => {
    getAnnouncements(page, page > 1)
  }, [page])

  const getAnnouncements = async (pageNum: number = 1, append: boolean = false) => {
    if (loadingRef.current) return
    try {
      loadingRef.current = true
      setLoading(true)

      const res = await fetch(`/api/admin/announcements?page=${pageNum}&limit=${limit}`)
      
      if (res.status === 401) {
        error('Unauthorized. Please login again.')
        return
      }

      const data = await res.json()

      if (data.success) {
        if (append) {
          setAnnouncements(prev => {
            const existingIds = new Set(prev.map(a => a._id))
            const newItems = data.data.filter((a: any) => !existingIds.has(a._id))
            return [...prev, ...newItems]
          })
        } else {
          setAnnouncements(data.data || [])
        }
        setHasMore(data.pagination?.hasMore ?? false)
      } else {
        error(data.message || 'Failed to fetch announcements')
      }
    } catch (err) {
      console.error('Failed to fetch announcements', err)
      error('Failed to fetch announcements. Please check your connection.')
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }

  // Delete announcement
  const deleteAnnouncement = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: 'Delete Announcement?',
      html: `Are you sure you want to delete <b>${title}</b>?<br>This will set it as inactive.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#2563eb',
      confirmButtonText: 'Yes, Delete'
    })

    if (!result.isConfirmed) return

    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        success('Announcement deleted successfully')
        setAnnouncements(prev => prev.filter(a => a._id !== id))
      } else {
        error('Failed to delete announcement')
      }
    } catch {
      error('Failed to delete announcement')
    }
  }

  const filtered = announcements.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.description.toLowerCase().includes(search.toLowerCase())
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertCircle size={16} className="text-red-500" />
      case 'warning': return <AlertCircle size={16} className="text-yellow-500" />
      case 'success': return <CheckCircle size={16} className="text-green-500" />
      default: return <Info size={16} className="text-blue-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'urgent': return 'bg-red-100 text-red-700'
      case 'warning': return 'bg-yellow-100 text-yellow-700'
      case 'success': return 'bg-green-100 text-green-700'
      default: return 'bg-blue-100 text-blue-700'
    }
  }

  return (
    <div>
      {/* SEARCH + ADD */}
      <div className="mb-4 flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            placeholder="Search announcements..."
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
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2
            ${theme === 'dark'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
        >
          <Plus size={18} /> Add Announcement
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
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Start Date</th>
              <th className="p-3 text-left">End Date</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {!loading && filtered.map(item => (
              <tr
                key={item._id}
                className={`border-b transition-colors
                  ${theme === 'dark'
                    ? 'border-gray-700 hover:bg-gray-700'
                    : 'border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {/* TITLE */}
                <td className="p-3">
                  <div className="font-medium">{item.title}</div>
                  <div className={`text-xs mt-1 truncate max-w-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.description}
                  </div>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline mt-1 inline-block"
                    >
                      {item.linkText} →
                    </a>
                  )}
                </td>

                {/* TYPE */}
                <td className="p-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getTypeColor(item.type)}`}>
                    {getTypeIcon(item.type)}
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                </td>

                {/* START DATE */}
                <td className="p-3 text-sm">
                  {new Date(item.startAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>

                {/* END DATE */}
                <td className="p-3 text-sm">
                  {new Date(item.endAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>

                {/* STATUS */}
                <td className="p-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium
                    ${item.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="p-3 text-center">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setEditAnnouncement(item)}
                      className="text-blue-600 hover:scale-110 transition"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(item._id, item.title)}
                      className="text-gray-400 hover:text-red-600 hover:scale-110 transition"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {/* LOADING */}
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Loading announcements...
                </td>
              </tr>
            )}

            {/* EMPTY */}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No announcements found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div ref={observerTarget} className="h-10 w-full" />

      {/* MODALS */}
      {openAdd && (
        <AddAnnouncement
          onClose={() => {
            setOpenAdd(false)
            setPage(1)
            setHasMore(true)
            getAnnouncements(1, false)
          }}
        />
      )}

      {editAnnouncement && (
        <EditAnnouncement
          announcement={editAnnouncement}
          onClose={() => {
            setEditAnnouncement(null)
            setPage(1)
            setHasMore(true)
            getAnnouncements(1, false)
          }}
        />
      )}
    </div>
  )
}

/* =========================================
   REQUESTS TAB (Existing)
========================================= */
function RequestsTab() {
  const { theme } = useTheme()
  const [requests, setRequests] = useState<HolidayRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const loadingRef = useRef(false)
  const limit = 10

  const observerTarget = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: () => setPage(p => p + 1)
  })

  const fetchRequests = async (pageNum: number = 1, append: boolean = false) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/holiday-requests?page=${pageNum}&limit=${limit}`, { cache: 'no-store' })
      const data = await res.json()
      if (data.success) {
        if (append) {
          setRequests(prev => {
            const existingIds = new Set(prev.map(r => r._id))
            const newRequests = data.data.filter((r: any) => !existingIds.has(r._id))
            return [...prev, ...newRequests]
          })
        } else {
          setRequests(data.data || [])
        }
        setHasMore(data.pagination?.hasMore ?? false)
      }
    } catch (err) {
      console.error(err)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }

  useEffect(() => {
    if (page > 1) {
      fetchRequests(page, true)
    }
  }, [page])

  useEffect(() => {
    setPage(1)
    setHasMore(true)
    fetchRequests(1, false)
  }, [])

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch("/api/admin/holiday-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status })
      })
      const data = await res.json()
      if (data.success) {
        setRequests(prev => prev.map(r =>
          r._id === id ? { ...r, status: status } : r
        ))
      } else {
        alert(data.message)
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading && page === 1) {
    return (
      <div className={`flex justify-center items-center py-12 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {requests.map((req) => (
        <div
          key={req._id}
          className={`p-5 rounded-2xl shadow-sm border flex flex-col sm:flex-row items-center justify-between gap-4 ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-100'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${req.status === 'pending' ? 'bg-orange-500/10 text-orange-500' :
              req.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>
              {req.status === 'pending' ? <Info size={24} /> : req.status === 'approved' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
            </div>
            <div>
              <h3 className="font-bold text-lg">{req.userEmail}</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Requested to work on <span className="font-semibold">{req.holidayId?.title}</span> ({new Date(req.holidayDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })})
              </p>
              {req.reason && (
                <div className={`mt-2 p-2 rounded text-sm italic border-l-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-gray-300' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>
                  &quot;{req.reason}&quot;
                </div>
              )}
              <p className="text-xs mt-2 opacity-60">
                Applied at: {new Date(req.appliedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {req.status === 'pending' || editingId === req._id ? (
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => { handleAction(req._id, 'rejected'); setEditingId(null); }}
                className={`flex-1 sm:flex-none px-6 py-2 rounded-xl font-bold transition-transform active:scale-95 ${theme === 'dark' ? 'bg-red-900/40 text-red-400 hover:bg-red-900/60' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
              >
                Reject
              </button>
              <button
                onClick={() => { handleAction(req._id, 'approved'); setEditingId(null); }}
                className="flex-1 sm:flex-none px-6 py-2 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 transition-transform active:scale-95"
              >
                Approve
              </button>
              {editingId === req._id && (
                <button
                  onClick={() => setEditingId(null)}
                  className={`px-3 py-2 rounded-xl font-bold transition-transform active:scale-95 ${theme === 'dark' ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  Cancel
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${req.status === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                {req.status}
              </span>
              <button
                onClick={() => setEditingId(req._id)}
                className={`p-2 rounded-lg transition-all hover:scale-110 active:scale-95 ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
                title="Edit decision"
              >
                <Edit size={16} />
              </button>
            </div>
          )}
        </div>
      ))}

      {requests.length === 0 && !loading && (
        <div className={`p-8 rounded-2xl border text-center ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>No work requests available.</p>
        </div>
      )}
      {loading && page > 1 && (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      )}
      {hasMore && (
        <div ref={observerTarget} className="h-10 w-full" />
      )}

      {!hasMore && requests.length > 0 && (
        <div className={`text-center mt-6 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          No more requests to load
        </div>
      )}
    </div>
  )
}

/* =========================================
   HELP TICKETS TAB
========================================= */
function HelpTicketsTab() {
  const { theme } = useTheme()
  const { success, error } = useToast()
  const [tickets, setTickets] = useState<HelpTicket[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all')
  const [replyingId, setReplyingId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const loadingRef = useRef(false)
  const limit = 10

  const observerTarget = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: () => setPage(p => p + 1)
  })

  const fetchTickets = async (pageNum: number = 1, append: boolean = false) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : ''
      const res = await fetch(`/api/admin/help-tickets?page=${pageNum}&limit=${limit}${statusParam}`, { cache: 'no-store' })
      const data = await res.json()
      if (data.success) {
        if (append) {
          setTickets(prev => {
            const existingIds = new Set(prev.map(t => t._id))
            const newTickets = data.data.filter((t: any) => !existingIds.has(t._id))
            return [...prev, ...newTickets]
          })
        } else {
          setTickets(data.data || [])
        }
        setHasMore(data.pagination?.hasMore ?? false)
      }
    } catch (err) {
      console.error('Failed to fetch help tickets', err)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }

  useEffect(() => {
    if (page > 1) {
      fetchTickets(page, true)
    }
  }, [page])

  useEffect(() => {
    setPage(1)
    setHasMore(true)
    fetchTickets(1, false)
  }, [statusFilter])

  const handleReply = async (id: string, isEdit: boolean = false) => {
    if (!replyText.trim()) {
      error('Please enter a reply')
      return
    }

    try {
      const res = await fetch('/api/admin/help-tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          adminReply: replyText,
          status: isEdit ? undefined : 'resolved'
        })
      })
      const data = await res.json()
      if (data.success) {
        success(isEdit ? 'Reply updated successfully' : 'Reply sent successfully')
        setTickets(prev => prev.map(t =>
          t._id === id ? { ...t, adminReply: replyText, ...(isEdit ? {} : { status: 'resolved', resolvedAt: new Date().toISOString() }) } : t
        ))
        setReplyingId(null)
        setEditingReplyId(null)
        setReplyText('')
      } else {
        error(data.message || 'Failed to send reply')
      }
    } catch (err) {
      error('Error sending reply')
    }
  }

  const handleDeleteTicket = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete Ticket?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      background: theme === 'dark' ? '#1a1a1a' : '#fff',
      color: theme === 'dark' ? '#fff' : '#111'
    })

    if (!result.isConfirmed) return

    try {
      const res = await fetch(`/api/admin/help-tickets?id=${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()

      if (data.success) {
        success('Ticket deleted successfully')
        setTickets(prev => prev.filter(t => t._id !== id))
      } else {
        error(data.message || 'Failed to delete ticket')
      }
    } catch (err) {
      error('Error deleting ticket')
    }
  }

  const startEditReply = (ticket: HelpTicket) => {
    setEditingReplyId(ticket._id)
    setReplyText(ticket.adminReply || '')
  }

  const handleStatusChange = async (id: string, newStatus: HelpTicket['status']) => {
    try {
      const res = await fetch('/api/admin/help-tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        success(`Status updated to ${newStatus}`)
        setTickets(prev => prev.map(t =>
          t._id === id ? { ...t, status: newStatus, ...(newStatus === 'resolved' || newStatus === 'closed' ? { resolvedAt: new Date().toISOString() } : {}) } : t
        ))
      } else {
        error(data.message || 'Failed to update status')
      }
    } catch (err) {
      error('Error updating status')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-500'
      case 'medium': return 'bg-yellow-500/20 text-yellow-500'
      case 'low': return 'bg-green-500/20 text-green-500'
      default: return 'bg-gray-500/20 text-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/20 text-blue-500'
      case 'in_progress': return 'bg-orange-500/20 text-orange-500'
      case 'resolved': return 'bg-green-500/20 text-green-500'
      case 'closed': return 'bg-gray-500/20 text-gray-500'
      default: return 'bg-gray-500/20 text-gray-500'
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* FILTER */}
      <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'}`}>
        <label className={`text-sm font-medium mr-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Filter by Status:
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className={`px-3 py-2 rounded-lg border ${
            theme === 'dark'
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="all">All Tickets</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* TICKETS LIST */}
      {tickets.map((ticket) => (
        <div
          key={ticket._id}
          className={`p-5 rounded-2xl shadow-sm border ${
            theme === 'dark' ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-100'
          }`}
        >
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${getStatusColor(ticket.status)}`}>
                {ticket.status === 'open' ? <AlertCircle size={20} /> :
                 ticket.status === 'in_progress' ? <Info size={20} /> :
                 ticket.status === 'resolved' ? <CheckCircle size={20} /> :
                 <AlertCircle size={20} />}
              </div>
              <div>
                <h3 className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {ticket.subject}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {ticket.userName} • {ticket.userEmail}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority.toUpperCase()}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* MESSAGE */}
          <div className={`p-4 rounded-xl mb-4 ${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
            <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Category: <span className="capitalize">{ticket.category}</span>
            </p>
            <p className={`${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              {ticket.message}
            </p>
          </div>

          {/* ADMIN REPLY */}
          {ticket.adminReply && editingReplyId !== ticket._id && (
            <div className={`p-4 rounded-xl mb-4 border-l-4 border-blue-500 ${
              theme === 'dark' ? 'bg-blue-500/10' : 'bg-blue-50'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <p className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  Admin Reply:
                </p>
                <button
                  onClick={() => startEditReply(ticket)}
                  className="text-xs px-2 py-1 rounded bg-blue-600/20 text-blue-600 hover:bg-blue-600/30 transition-colors"
                >
                  Edit Reply
                </button>
              </div>
              <p className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                {ticket.adminReply}
              </p>
              {ticket.resolvedAt && (
                <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Resolved on: {new Date(ticket.resolvedAt).toLocaleString('en-IN')}
                </p>
              )}
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-2">
            {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
              <>
                <button
                  onClick={() => setReplyingId(replyingId === ticket._id ? null : ticket._id)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  {replyingId === ticket._id ? 'Cancel Reply' : 'Reply'}
                </button>
                <button
                  onClick={() => handleStatusChange(ticket._id, 'in_progress')}
                  disabled={ticket.status === 'in_progress'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    ticket.status === 'in_progress'
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  Mark In Progress
                </button>
              </>
            )}
            {ticket.status !== 'closed' && (
              <button
                onClick={() => handleStatusChange(ticket._id, 'closed')}
                className="px-4 py-2 rounded-lg bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Close Ticket
              </button>
            )}
            {(ticket.status === 'closed' || ticket.status === 'resolved') && (
              <button
                onClick={() => handleStatusChange(ticket._id, 'open')}
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Reopen
              </button>
            )}
            {/* DELETE BUTTON */}
            <button
              onClick={() => handleDeleteTicket(ticket._id)}
              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors ml-auto"
            >
              Delete
            </button>
          </div>

          {/* NEW REPLY FORM */}
          {replyingId === ticket._id && (
            <div className="mt-4 p-4 rounded-xl border border-blue-500/30">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                rows={4}
                className={`w-full p-3 rounded-lg border resize-none ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleReply(ticket._id, false)}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Send Reply
                </button>
              </div>
            </div>
          )}

          {/* EDIT REPLY FORM */}
          {editingReplyId === ticket._id && (
            <div className="mt-4 p-4 rounded-xl border border-orange-500/30">
              <p className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'}`}>
                Edit Reply:
              </p>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Update your reply..."
                rows={4}
                className={`w-full p-3 rounded-lg border resize-none ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleReply(ticket._id, true)}
                  className="px-4 py-2 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition-colors"
                >
                  Update Reply
                </button>
                <button
                  onClick={() => { setEditingReplyId(null); setReplyText(''); }}
                  className="px-4 py-2 rounded-lg bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className={`mt-4 pt-3 border-t text-xs ${
            theme === 'dark' ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-400'
          }`}>
            Created: {new Date(ticket.createdAt).toLocaleString('en-IN')}
          </div>
        </div>
      ))}

      {tickets.length === 0 && !loading && (
        <div className={`p-8 rounded-2xl border text-center ${
          theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
            No help tickets found.
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Loading tickets...</p>
        </div>
      )}

      <div ref={observerTarget} className="h-10 w-full" />

      {!hasMore && tickets.length > 0 && (
        <div className={`text-center mt-6 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          No more tickets to load
        </div>
      )}
    </div>
  )
}

/* =========================================
   MAIN PAGE
========================================= */
export default function Announcements() {
  const { theme } = useTheme()
  const [activeTab, setActiveTab] = useState<'announcements' | 'requests' | 'help'>('announcements')

  return (
    <div className={`min-h-screen p-8 ml-24 transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Megaphone className="text-indigo-500" size={32} />
          Announcements & Requests
        </h1>
        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Manage announcements and user requests.
        </p>
      </div>

      {/* TAB SWITCHER WITH SLIDE ANIMATION */}
      <div className="mb-6 flex items-center justify-center">
        <div
          className={`relative flex items-center rounded-full p-1.5 ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
          }`}
        >
          {/* Sliding Background */}
          <div
            className="absolute h-[calc(100%-12px)] bg-blue-600 rounded-full transition-all duration-300 ease-out"
            style={{
              width: '33.333%',
              left: activeTab === 'announcements' ? '6px' : activeTab === 'requests' ? '33.333%' : 'calc(66.666% - 6px)',
            }}
          />

          {(['announcements', 'requests', 'help'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative z-10 px-6 h-10 rounded-full text-sm font-medium transition-colors duration-300 min-w-[130px] ${
                activeTab === tab
                  ? 'text-white'
                  : theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab === 'announcements' && 'Announcements'}
              {tab === 'requests' && 'Holiday Requests'}
              {tab === 'help' && 'Help Tickets'}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      {activeTab === 'announcements' && <AnnouncementsTab />}
      {activeTab === 'requests' && <RequestsTab />}
      {activeTab === 'help' && <HelpTicketsTab />}
    </div>
  )
}
