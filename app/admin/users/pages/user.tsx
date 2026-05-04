'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Search, Eye, Edit, Ban, Trash2, CheckCircle, Filter, FileText } from 'lucide-react'
import { useTheme } from '../../../../contexts/ThemeContext'
import { useToast } from '../../../../contexts/ToastContext'
import EditUser from './components/edit'
import ViewUser from './components/view'
import UserDocuments from './components/documents'
import Dialog from '@/components/ui/Dialog'
import Loading from '@/components/ui/Loading'
import { useInfiniteScroll } from '../../../../hooks/useInfiniteScroll'

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
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'not-verified'>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | 'developer' | 'graphics'>('all')
  const [developerTypeFilter, setDeveloperTypeFilter] = useState<'all' | 'frontend' | 'backend' | 'fullstack'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const [visibleItems, setVisibleItems] = useState(10)

  const [openEdit, setOpenEdit] = useState(false)
  const [openView, setOpenView] = useState(false)
  const [openDocuments, setOpenDocuments] = useState(false)
  const [currentAdmin, setCurrentAdmin] = useState<CurrentAdmin | null>(null)

  const [dialogConfig, setDialogConfig] = useState<{
    isOpen: boolean,
    title: string,
    message: string,
    type: 'warning' | 'error' | 'info' | 'success',
    confirmLabel: string,
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    confirmLabel: '',
    onConfirm: () => { }
  })

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
  const loadingRef = useRef(false)
  const limit = 1000

  /* ================= FETCH ================= */
  const fetchUsers = useCallback(async (pageNum: number, append: boolean = false, filter: string = verifiedFilter) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/users/get-all-users?page=${pageNum}&limit=${limit}&verified=${filter}`)
      const data = await res.json()

      if (data.success) {
        if (append) {
          setUsers(prev => {
            const existingIds = new Set(prev.map((u: any) => u._id))
            const newUsers = data.data.filter((u: any) => !existingIds.has(u._id))
            return [...prev, ...newUsers]
          })
        } else {
          setUsers(data.data)
        }
        setHasMore(data.pagination.hasMore)
      }
    } catch {
      error('Failed to fetch users')
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [verifiedFilter, error])

  // Initial load & Filter change
  useEffect(() => {
    setUsers([])
    setVisibleItems(10)
    loadingRef.current = false
    fetchUsers(1, false, verifiedFilter)
  }, [verifiedFilter, fetchUsers])

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.mobileNumber?.includes(search)

    if (!matchesSearch) return false

    const role = detectRole(user)
    if (roleFilter === 'developer' && role !== 'Developer') return false
    if (roleFilter === 'graphics' && role !== 'Graphics') return false

    if (roleFilter === 'developer' && developerTypeFilter !== 'all') {
      const devType = getDeveloperType(user)
      if (developerTypeFilter === 'frontend' && devType !== 'frontend') return false
      if (developerTypeFilter === 'backend' && devType !== 'backend') return false
      if (developerTypeFilter === 'fullstack' && devType !== 'fullstack') return false
    }

    return true
  })

  // 🔥 Infinite Scroll (placed after filteredUsers)
  const observerTarget = useInfiniteScroll({
    loading,
    hasMore: visibleItems < filteredUsers.length,
    onLoadMore: () => setVisibleItems(prev => Math.min(prev + 10, filteredUsers.length))
  })

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = filteredUsers.slice(0, visibleItems)

  const handleLoadMore = () => {
    setVisibleItems(prev => Math.min(prev + 10, filteredUsers.length))
  }

  /* ================= ACTIONS ================= */

  // TOGGLE ENABLE/DISABLE
  const toggleUserStatus = async (email: string, isActive: boolean) => {
    const action = isActive ? 'Disable' : 'Enable'

    setDialogConfig({
      isOpen: true,
      title: `${action} User?`,
      message: isActive ? 'User will not be able to login.' : 'User will be able to login.',
      type: 'warning',
      confirmLabel: `Yes, ${action}`,
      onConfirm: async () => {
        try {
          await fetch('/api/admin/users/disable-user', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          })

          success(`User ${action.toLowerCase()}d successfully`)
          
          // ✅ Local state update instead of full fetch
          setUsers(prev => prev.map(u => 
            u.email === email ? { ...u, isActive: !isActive } : u
          ))
        } catch {
          error(`Failed to ${action.toLowerCase()} user`)
        }
      }
    })
  }

  // DELETE
  const deleteUser = async (email: string) => {
    setDialogConfig({
      isOpen: true,
      title: 'Delete User?',
      message: 'This action cannot be undone!',
      type: 'error',
      confirmLabel: 'Yes, Delete',
      onConfirm: async () => {
        try {
          await fetch('/api/admin/users/delete-user', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          })

          success('User deleted successfully')
          
          // ✅ Local state update instead of full fetch
          setUsers(prev => prev.filter(u => u.email !== email))
        } catch {
          error('Failed to delete user')
        }
      }
    })
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

  // DOCUMENTS
  const handleDocuments = (email: string) => {
    setSelectedEmail(email)
    setOpenDocuments(true)
  }

  function detectRole(user: any): 'Developer' | 'Graphics' | '' {
    const workingRoleRaw = typeof user?.workingRole === 'string' ? user.workingRole : ''
    const designationRaw = typeof user?.designation === 'string' ? user.designation : ''
    const skillsRaw = Array.isArray(user?.skills) ? user.skills.join(' ') : (user?.skills ?? '')
    const bioRaw = typeof user?.profile?.bio === 'string' ? user.profile.bio : (typeof user?.bio === 'string' ? user.bio : '')

    const haystack = `${workingRoleRaw} ${designationRaw} ${skillsRaw} ${bioRaw}`
      .toLowerCase()
      .trim()

    if (!haystack) return ''

    const isDeveloper =
      haystack.includes('developer') ||
      haystack.includes('dev') ||
      haystack.includes('mern') ||
      haystack.includes('react') ||
      haystack.includes('node') ||
      haystack.includes('frontend') ||
      haystack.includes('backend') ||
      haystack.includes('fullstack')

    const isGraphics =
      haystack.includes('graphic') ||
      haystack.includes('graphics') ||
      haystack.includes('designer') ||
      haystack.includes('design') ||
      haystack.includes('figma') ||
      haystack.includes('photoshop') ||
      haystack.includes('illustrator')

    if (isDeveloper && !isGraphics) return 'Developer'
    if (isGraphics && !isDeveloper) return 'Graphics'
    if (workingRoleRaw.toLowerCase().includes('developer') || designationRaw.toLowerCase().includes('developer')) return 'Developer'
    if (workingRoleRaw.toLowerCase().includes('graphic') || designationRaw.toLowerCase().includes('graphic')) return 'Graphics'
    return ''
  }

  function getDeveloperType(user: any): 'frontend' | 'backend' | 'fullstack' | 'other' {
    const specialization = getDeveloperSpecialization(user)
    if (specialization === 'Full Stack Developer') return 'fullstack'
    if (specialization === 'Frontend Developer') return 'frontend'
    if (specialization === 'Backend Developer') return 'backend'
    return 'other'
  }

  function getDeveloperSpecialization(user: any): 'Frontend Developer' | 'Backend Developer' | 'Full Stack Developer' | 'Developer' {
    const workingRoleRaw = typeof user?.workingRole === 'string' ? user.workingRole : ''
    const designationRaw = typeof user?.designation === 'string' ? user.designation : ''
    const skillsRaw = Array.isArray(user?.skills) ? user.skills.join(' ') : (user?.skills ?? '')
    const bioRaw = typeof user?.profile?.bio === 'string' ? user.profile.bio : (typeof user?.bio === 'string' ? user.bio : '')

    const haystack = `${workingRoleRaw} ${designationRaw} ${skillsRaw} ${bioRaw}`
      .toLowerCase()
      .trim()

    if (!haystack) return 'Developer'

    const isFrontend =
      haystack.includes('frontend') ||
      haystack.includes('front end') ||
      haystack.includes('ui') ||
      haystack.includes('ux') ||
      haystack.includes('react') ||
      haystack.includes('next') ||
      haystack.includes('html') ||
      haystack.includes('css') ||
      haystack.includes('tailwind')

    const isBackend =
      haystack.includes('backend') ||
      haystack.includes('back end') ||
      haystack.includes('api') ||
      haystack.includes('node') ||
      haystack.includes('express') ||
      haystack.includes('mongodb') ||
      haystack.includes('sql') ||
      haystack.includes('server')

    const isFullStack =
      haystack.includes('fullstack') ||
      haystack.includes('full stack') ||
      (isFrontend && isBackend)

    if (isFullStack) return 'Full Stack Developer'
    if (isFrontend) return 'Frontend Developer'
    if (isBackend) return 'Backend Developer'
    return 'Developer'
  }

  const DeveloperIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    >
      <path d="M6.818 22v-2.857C6.662 17.592 5.633 16.416 4.682 15m9.772 7v-1.714c4.91 0 4.364-5.714 4.364-5.714s2.182 0 2.182-2.286l-2.182-3.428c0-4.572-3.709-6.816-7.636-6.857c-2.2-.023-3.957.53-5.27 1.499" />
      <path d="m13 7l2 2.5l-2 2.5M5 7L3 9.5L5 12m5-6l-2 7" />
    </svg>
  )

  const GraphicsIcon = ({ className }: { className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M21.56 14.751a2.31 2.31 0 0 0-3.051-1.11q-.266.09-.51.23q-.24.132-.45.31a.28.28 0 0 0-.07.39a.29.29 0 0 0 .4.06a3 3 0 0 1 .4-.21a2 2 0 0 1 .42-.14a1.59 1.59 0 0 1 2 .94a3.8 3.8 0 0 1 .3 1.89a3.06 3.06 0 0 1-.63 1.751a3 3 0 0 1-1.16.77a5.8 5.8 0 0 1-1.46.36a.32.32 0 1 0 0 .64a6.4 6.4 0 0 0 2-.37c.469-.164.9-.419 1.27-.75a3.7 3.7 0 0 0 1-2.3a4.3 4.3 0 0 0-.46-2.46M19.79 1.737a1.1 1.1 0 0 0-.38-.7a3.3 3.3 0 0 0-1.111-.42a11 11 0 0 0-2.21-.59a2.7 2.7 0 0 0-1.691.31a1.6 1.6 0 0 0-.38.69c-.36 1.2-1.06 4.281-1.09 4.451a.3.3 0 0 0 .22.34a.28.28 0 0 0 .33-.22c0-.17.91-3.15 1.34-4.3q.06-.141.14-.27a2 2 0 0 1 1.06 0a10 10 0 0 1 2 .62c.21.07.46.1.671.18c0 0 .09 0 .1.09a2.8 2.8 0 0 1-.19 1.11c-.08.31-.19.62-.3.92c-.18-.13-.36-.26-.55-.38s-.21-.13-.32-.18a2.5 2.5 0 0 0-.35-.13c-.29-.09-.57-.12-.87-.19a.28.28 0 0 0-.38.12a.27.27 0 0 0 .11.38q.321.337.7.61q.152.115.33.19q.177.085.37.13c.24.06.47.1.71.14c-.05.12-.09.25-.13.37c-.18.62-.35 1.27-.51 1.93h-.07c-.24-.15-.45-.3-.71-.43a1.8 1.8 0 0 0-.61-.23a6 6 0 0 0-.851 0a.28.28 0 0 0-.36.18a.29.29 0 0 0 .18.36c.25.16.44.331.7.471q.154.086.32.14l.34.08c.28 0 .55 0 .83.08a.3.3 0 0 0 .13 0l-.63 2.72c-.28-.17-.54-.36-.82-.53l-.38-.22a3.5 3.5 0 0 0-.46-.22c-.32-.14-.64-.24-1-.41a.284.284 0 0 0-.37.43q.349.479.8.86c.265.195.558.347.87.451q.539.155 1.09.25c0 .11-.05.22-.08.33c-.08.31-.17.61-.26.91c-.07.54.1.65.7 0c.08-.23.17-.47.24-.71c.63-2 1.14-4.151 1.821-6.092q.525-1.136.9-2.33a3.3 3.3 0 0 0 .06-1.29" />
      <path d="M16.648 12.75c-.44.25.05 1-.29 5.842q-.09 1.267-.34 2.51a1.85 1.85 0 0 1-.27.781a4.8 4.8 0 0 1-2.66.95c-1.524.204-3.07.167-4.582-.11a6.7 6.7 0 0 1-1.24-.36a1.4 1.4 0 0 1-.53-.33a3.5 3.5 0 0 1-.54-1.08a15 15 0 0 1-.42-2a49 49 0 0 1-.51-3.562c-.06-.64-.1-1.29-.12-1.94c0 0 2.67-.11 3.87-.14h2c.651 0 1.301-.06 2.001-.06s1.3 0 2 .06a.32.32 0 1 0 .071-.63c-1-.17-1.93-.28-2.88-.35a.32.32 0 0 0 .19-.29c0-.48.07-1 .12-1.451c.05-.45.11-1 .18-1.44q.14-.63.2-1.27a19.7 19.7 0 0 0-.59-3.662a2.7 2.7 0 0 0-.781-1.18a.54.54 0 0 0-.47-.11c-.37.07-1.15 1.83-1.33 2.3q-.27.65-.44 1.33a.5.5 0 0 0-.27.21c-.09.691-.17 1.371-.25 2.061q-.12 1.035-.18 2.071a.282.282 0 1 0 .56.07c.09-.54.2-1.07.32-1.61c.15-.71.32-1.41.49-2.121h1.28c.12 0 .48 0 .46.07s0 1.31 0 1.68s0 .8-.05 1.2v1.781a.32.32 0 0 0 .15.27h-1.83c-.51 0-.85 0-1.27.08c-.16-.36-.31-.72-.481-1.07a6 6 0 0 0-.3-.56a4 4 0 0 0-.34-.51c-.26-.35-.54-.67-.81-1q.412-.281.75-.65a.32.32 0 0 0-.4-.5a3.63 3.63 0 0 1-2.531 1.08c-.75-.08-1.35-.55-1.52-1.7a2.9 2.9 0 0 1 0-1.001q.166-.797.45-1.56c.1-.3.2-.59.29-.9s.08-.341.11-.521c.37.28.74.55 1.09.84q.398.316.76.67c.348.322.65.689.9 1.09c.23.4.35.851.35 1.311a.33.33 0 0 0 .32.33a.32.32 0 0 0 .32-.32c.022-.45-.05-.9-.21-1.32a5.7 5.7 0 0 0-1.09-1.66c-.24-.27-.5-.52-.76-.771c-.26-.25-.8-.7-1.21-1a5 5 0 0 0-.6-.57a.6.6 0 0 0-.48-.08a.64.64 0 0 0-.37.53v.65q-.045.264-.12.52c-.09.29-.19.57-.29.86a10.5 10.5 0 0 0-.51 1.77c-.08.44-.08.891 0 1.331a2.66 2.66 0 0 0 1.82 2.19a2 2 0 0 0 .26.05q.007.504.07 1.001q.033.275.11.54q.066.27.16.53c.09.26.18.52.28.78a.29.29 0 0 0-.14.24v2.441c.06 1.21.19 2.421.34 3.631q.105 1.072.35 2.121c.126.507.347.985.65 1.41c.242.313.559.561.92.72c.46.203.94.357 1.431.46c1.649.319 3.338.363 5.001.13a5.7 5.7 0 0 0 3.221-1.33a6.4 6.4 0 0 0 .67-3a58 58 0 0 0-.06-6.492c-.02-.37-.45-.28-.45-.28M11.647 6.19a6.7 6.7 0 0 0-1.59 0h-.16c.08-.16.17-.32.26-.47c.29-.5.62-1 .94-1.44q.148.265.26.55c.17.45.3.92.42 1.36a1 1 0 0 0-.09 0zM4.835 9.87c.49-.052.965-.198 1.4-.43q.2.613.46 1.201q.135.283.3.55c.11.18.23.35.35.52l.51.65c-.78.1-1.57.23-2.37.37c0-.33 0-.66-.07-1a5 5 0 0 0-.09-.56c0-.18-.1-.36-.16-.53s-.22-.52-.33-.77" />
    </svg>
  )

  return (
    <div>
      {/* SEARCH + FILTER */}
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

        {/* VERIFICATION FILTER DROPDOWN */}
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value as any)}
            className={`pl-9 pr-4 py-2 rounded-lg border appearance-none cursor-pointer text-sm font-medium transition-all
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
              }`}
          >
            <option value="all">All Users</option>
            <option value="verified">✅ Verified</option>
            <option value="not-verified">❌ Not Verified</option>
          </select>
        </div>

        {/* ROLE FILTER DROPDOWN */}
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => {
              const next = e.target.value as any
              setRoleFilter(next)
              if (next !== 'developer') {
                setDeveloperTypeFilter('all')
              }
            }}
            className={`pl-9 pr-4 py-2 rounded-lg border appearance-none cursor-pointer text-sm font-medium transition-all
              ${theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900'
              }`}
          >
            <option value="all">All Roles</option>
            <option value="graphics">🎨 Graphics</option>
            <option value="developer">💻 Developer</option>
          </select>
        </div>

        {/* DEVELOPER TYPE FILTER (only when Developer selected) */}
        {roleFilter === 'developer' ? (
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <select
              value={developerTypeFilter}
              onChange={(e) => setDeveloperTypeFilter(e.target.value as any)}
              className={`pl-9 pr-4 py-2 rounded-lg border appearance-none cursor-pointer text-sm font-medium transition-all
                ${theme === 'dark'
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
            >
              <option value="all">All Developer Types</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="fullstack">Full Stack</option>
            </select>
          </div>
        ) : null}
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
              <th className="p-3 text-left">Verified</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.map((user, index) => (
              <tr
                key={`${user._id}-${index}`}
                className={`border-b transition-colors cursor-pointer
                  ${!user.isEmailVerified
                    ? theme === 'dark' ? 'border-red-900/30 bg-red-950/20' : 'border-red-200 bg-red-50/50'
                    : theme === 'dark'
                      ? 'border-gray-700 hover:bg-gray-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <td className={`p-3 ${!user.isEmailVerified ? 'text-red-500' : ''}`}>{user.name}</td>
                <td className={`p-3 ${!user.isEmailVerified ? 'text-red-500' : ''}`}>{user.email}</td>
                <td className="p-3">{user.mobileNumber || '-'}</td>

                <td className="p-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    user.isEmailVerified
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {user.isEmailVerified ? '✅ Verified' : '❌ Not Verified'}
                  </span>
                </td>

                <td className="p-3">
                  {(() => {
                    const role = detectRole(user)
                    if (!role) return <span className="text-sm text-gray-400">-</span>

                    const iconClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    const chipClass = theme === 'dark' ? 'bg-gray-700/50 text-gray-100 border-gray-600/40' : 'bg-gray-100 text-gray-800 border-gray-200'

                    const tooltip = role === 'Developer' ? getDeveloperSpecialization(user) : role

                    return (
                      <span
                        title={tooltip}
                        className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold border ${chipClass}`}
                      >
                        <span className="inline-flex items-center">
                          {role === 'Developer' ? (
                            <DeveloperIcon className={iconClass} />
                          ) : (
                            <GraphicsIcon className={iconClass} />
                          )}
                        </span>
                        <span>{role}</span>
                      </span>
                    )
                  })()}
                </td>

                <td className="p-3">
                  <button
                    onClick={() => canToggle() && toggleUserStatus(user.email, user.isActive)}
                    disabled={!canToggle()}
                    className={`px-3 py-1 rounded-full text-xs transition ${canToggle() ? 'hover:scale-105 cursor-pointer' : 'cursor-not-allowed opacity-60'
                      } ${user.isActive
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
                    className={`${canToggle() ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-30'
                      } ${user.isActive ? 'text-red-500' : 'text-green-500'
                      }`}
                  >
                    {user.isActive ? <Ban size={18} /> : <CheckCircle size={18} />}
                  </button>

                  <button
                    onClick={() => canEdit() && handleEdit(user.email)}
                    disabled={!canEdit()}
                    className={`text-blue-600 ${canEdit() ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-30'
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
                    onClick={() => handleDocuments(user.email)}
                    className="text-slate-600 hover:scale-110 cursor-pointer"
                    title="Documents"
                  >
                    <FileText size={18} />
                  </button>

                  <button
                    onClick={() => canDelete() && deleteUser(user.email)}
                    disabled={!canDelete()}
                    className={`text-red-500 ${canDelete() ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-30'
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

      {/* LOAD MORE / INFINITE SCROLL TARGET */}
      {visibleItems < filteredUsers.length && (
        <div ref={observerTarget} className="flex justify-center py-6">
          <button
            onClick={handleLoadMore}
            className={`px-6 py-2 rounded-xl font-bold transition-all hover:scale-105 active:scale-95
              ${theme === 'dark' 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30' 
                : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'}`}
          >
            Load More Users ({filteredUsers.length - visibleItems} remaining)
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

      {openDocuments && (
        <UserDocuments
          email={selectedEmail}
          close={() => setOpenDocuments(false)}
        />
      )}

      <Dialog
        isOpen={dialogConfig.isOpen}
        onClose={() => setDialogConfig(prev => ({ ...prev, isOpen: false }))}
        title={dialogConfig.title}
        message={dialogConfig.message}
        type={dialogConfig.type as any}
        confirmLabel={dialogConfig.confirmLabel}
        onConfirm={dialogConfig.onConfirm}
      />
    </div>
  )
}
