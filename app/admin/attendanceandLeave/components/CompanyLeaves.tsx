'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../../../contexts/ThemeContext'
import { Trash2, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Star, Plus, Upload, X, Loader2, Pencil, Mail, Users, User as UserIcon, Check, Send, Bell, BellOff, Info } from 'lucide-react'
import { getAllFestivals, Festival } from '../../../../utils/indianHolidays'

interface CompanyHoliday {
    _id: string
    title: string
    date: string
    animationUrl?: string
    animationPublicId?: string
    animationResourceType?: 'image' | 'video'
}

export default function CompanyLeaves({ canEdit }: { canEdit: boolean }) {
    const { theme } = useTheme()
    const [holidays, setHolidays] = useState<CompanyHoliday[]>([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [activeTab, setActiveTab] = useState<'calendar' | 'list'>('calendar')

    // Calendar States
    const [currentDate, setCurrentDate] = useState(new Date())
    const [festivals] = useState<Festival[]>(getAllFestivals())

    // Selection Flow
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newHolidayTitle, setNewHolidayTitle] = useState('')

    // Animation Upload State
    const [uploading, setUploading] = useState(false)
    const [tempAnim, setTempAnim] = useState<{ url: string; publicId: string; resourceType: 'image' | 'video' } | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)

    // Notification State (Global & Persistent)
    const [sendNotify, setSendNotify] = useState(false)
    const [notifyTarget, setNotifyTarget] = useState<'all' | 'individual'>('all')
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
    const [allUsers, setAllUsers] = useState<{ _id: string; name: string; email: string }[]>([])
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [broadcasting, setBroadcasting] = useState(false)
    const [showAnnounceUserModal, setShowAnnounceUserModal] = useState(false)

    const fetchHolidays = async () => {
        try {
            const res = await fetch('/api/admin/company-holiday')
            const data = await res.json()
            if (data.success) {
                setHolidays(data.data)
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const fetchUsers = async () => {
        setLoadingUsers(true)
        try {
            const res = await fetch('/api/admin/users/get-user-emails')
            const data = await res.json()
            if (data.success) {
                setAllUsers(data.data)
            }
        } catch (err) {
            console.error('Fetch users error:', err)
        } finally {
            setLoadingUsers(false)
        }
    }

    useEffect(() => {
        fetchHolidays()
        fetchUsers()
    }, [])

    const handleFileUpload = async (file: File) => {
        setUploading(true)
        const isVideo = file.type.startsWith('video/')
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'TimetricxAnimations')
        formData.append('folder', 'timetricx/animations')

        try {
            // Using /auto/upload or just /upload with resource_type: auto
            const res = await fetch(`https://api.cloudinary.com/v1_1/timetricx/auto/upload`, {
                method: 'POST',
                body: formData
            })
            const data = await res.json()
            if (data.secure_url) {
                setTempAnim({
                    url: data.secure_url,
                    publicId: data.public_id,
                    resourceType: data.resource_type === 'video' ? 'video' : 'image'
                })
            }
        } catch (error) {
            console.error('Upload Error:', error)
            alert('Animation upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleAdd = async () => {
        if (!newHolidayTitle || !selectedDate) {
            alert("Please enter a title and select a date.")
            return
        }

        setAdding(true)

        try {
            const body: any = {
                title: newHolidayTitle,
                date: selectedDate,
                notifyTarget: sendNotify ? notifyTarget : 'none',
                selectedUserIds: sendNotify && notifyTarget === 'individual' ? selectedUserIds : []
            }
            if (editingId) body.id = editingId

            if (tempAnim) {
                body.animationUrl = tempAnim.url
                body.animationPublicId = tempAnim.publicId
                body.animationResourceType = tempAnim.resourceType
            }

            const method = editingId ? 'PATCH' : 'POST'
            const res = await fetch('/api/admin/company-holiday', {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            const data = await res.json()
            if (data.success) {
                if (editingId) {
                    setHolidays(holidays.map(h => h._id === editingId ? data.data : h))
                } else {
                    setHolidays([...holidays, data.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()))
                }
                handleCloseModal()
            } else {
                alert(data.message || 'Failed to process request')
            }
        } catch (err) {
            alert('Error occurred while processing request')
        } finally {
            setAdding(false)
        }
    }

    const handleEdit = (holiday: CompanyHoliday) => {
        setEditingId(holiday._id)
        setNewHolidayTitle(holiday.title)
        setSelectedDate(holiday.date.split('T')[0])
        if (holiday.animationUrl) {
            const isVid = holiday.animationResourceType === 'video' ||
                holiday.animationUrl.match(/\.(mp4|webm|ogg|mov)$|^.*\/video\/upload\/.*$/i);

            setTempAnim({
                url: holiday.animationUrl,
                publicId: holiday.animationPublicId || '',
                resourceType: isVid ? 'video' : 'image'
            })
        } else {
            setTempAnim(null)
        }
        setShowAddModal(true)
    }

    const handleCloseModal = () => {
        setEditingId(null)
        setNewHolidayTitle('')
        setTempAnim(null)
        setSelectedDate(null)
        setShowAddModal(false)
    }

    const handleBroadcastAll = async () => {
        if (!window.confirm("Send upcoming holidays list to selected employees?")) return
        setBroadcasting(true)
        try {
            const res = await fetch('/api/admin/company-holiday/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ target: notifyTarget, userIds: selectedUserIds })
            })
            const data = await res.json()
            if (data.success) {
                alert('Broadcast sent successfully!')
            } else {
                alert(data.message || 'Failed to send broadcast')
            }
        } catch (err) {
            alert('Broadcast failed!')
        } finally {
            setBroadcasting(false)
        }
    }

    const handleDelete = async (id: string) => {
        const confirmDel = window.confirm("Are you sure you want to remove this holiday?")
        if (!confirmDel) return

        try {
            const res = await fetch(`/api/admin/company-holiday?id=${id}`, { method: 'DELETE' })
            const data = await res.json()
            if (data.success) {
                setHolidays(holidays.filter(h => h._id !== id))
            }
        } catch (error) {
            alert('Failed to delete holiday')
        }
    }

    /* ================= CALENDAR HELPERS ================= */
    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay()

    const changeMonth = (offset: number) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)
        setCurrentDate(newDate)
    }

    const isToday = (day: number) => {
        const today = new Date()
        return today.getDate() === day &&
            today.getMonth() === currentDate.getMonth() &&
            today.getFullYear() === currentDate.getFullYear()
    }

    const getHolidayForDay = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
        return holidays.find(h => {
            const hDate = new Date(h.date);
            const hDateStr = `${hDate.getFullYear()}-${(hDate.getMonth() + 1).toString().padStart(2, '0')}-${hDate.getDate().toString().padStart(2, '0')}`;
            return hDateStr === dateStr;
        })
    }

    const getFestivalForDay = (day: number) => {
        const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
        return festivals.find(f => f.date === dateStr)
    }

    const handleDateClick = (dayIndex: number) => {
        const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${dayIndex.toString().padStart(2, '0')}`

        // If already a company holiday, open edit mode
        const existing = getHolidayForDay(dayIndex)
        if (existing) {
            handleEdit(existing)
            return
        }

        const fest = getFestivalForDay(dayIndex)
        setSelectedDate(dateStr)
        setNewHolidayTitle(fest ? fest.title : '')
        setShowAddModal(true)
    }

    const daysArr = Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => i + 1)
    const blanks = Array.from({ length: getFirstDayOfMonth(currentDate) }, (_, i) => i)

    return (
        <div className={`space-y-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {/* TABS */}
            <div className="flex justify-center mb-4">
                <div className={`flex p-1 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'}`}>
                    <button
                        onClick={() => setActiveTab('calendar')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'calendar' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Calendar View (Panchang)
                    </button>
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all ${activeTab === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        List View
                    </button>
                </div>
            </div>

            {activeTab === 'calendar' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* CALENDAR BODY */}
                    <div className="xl:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-6 rounded-3xl shadow-2xl border backdrop-blur-xl ${theme === 'dark' ? 'bg-gray-900/60 border-gray-700' : 'bg-white/80 border-gray-200'}`}
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-4">
                                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
                                        <ChevronLeft />
                                    </button>
                                    <h2 className="text-2xl font-bold min-w-[200px] text-center">
                                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </h2>
                                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
                                        <ChevronRight />
                                    </button>
                                </div>
                                <div className="text-sm opacity-60 flex gap-4">
                                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-400 rounded-full" /> Declared Holiday</span>
                                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-400 rounded-full" /> Festival</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-3">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <div key={d} className="text-center font-bold text-gray-500 mb-2">{d}</div>
                                ))}

                                {blanks.map(b => <div key={`b-${b}`} className="aspect-square opacity-0" />)}

                                {daysArr.map(day => {
                                    const holiday = getHolidayForDay(day)
                                    const fest = getFestivalForDay(day)
                                    const today = isToday(day)

                                    return (
                                        <motion.div
                                            key={day}
                                            whileHover={{ scale: 1.05 }}
                                            onClick={() => handleDateClick(day)}
                                            className={`relative aspect-square rounded-2xl p-2 cursor-pointer transition-all border
                      ${today ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-transparent'}
                      ${holiday
                                                    ? 'bg-rose-500/10 border-rose-500/30'
                                                    : fest
                                                        ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                                                        : theme === 'dark' ? 'bg-gray-800/40 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'}
                    `}
                                        >
                                            <span className={`text-lg font-bold ${today ? 'text-green-500' : ''}`}>
                                                {day}
                                            </span>

                                            {holiday && (
                                                <div className="absolute top-2 right-2">
                                                    <Star size={16} fill="#f43f5e" className="text-rose-500" />
                                                </div>
                                            )}

                                            {fest && !holiday && (
                                                <div className="absolute top-2 right-2">
                                                    <CalendarIcon size={14} className="text-blue-500 opacity-60" />
                                                </div>
                                            )}

                                            <div className="mt-auto">
                                                {holiday && (
                                                    <p className="text-[10px] text-red-500 font-bold line-clamp-2 leading-tight">
                                                        {holiday.title}
                                                    </p>
                                                )}
                                                {fest && !holiday && (
                                                    <p className="text-[10px] text-blue-500 font-medium line-clamp-2 leading-tight">
                                                        {fest.title}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </div>

                    {/* SIDEBAR START */}
                    <div className="space-y-6">
                        {/* 📢 Master Announcement Center */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-6 rounded-[2.5rem] border shadow-2xl relative overflow-hidden backdrop-blur-xl ${theme === 'dark' ? 'bg-[#0f172a]/60 border-blue-500/20' : 'bg-white/80 border-gray-100'}`}
                        >

                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Bell className="w-24 h-24" />
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-3 rounded-[1.25rem] ${sendNotify ? 'bg-blue-600 shadow-lg shadow-blue-500/40 text-white' : 'bg-gray-800/40 text-gray-400'}`}>
                                    {sendNotify ? <Bell className="animate-bounce" size={24} /> : <BellOff size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-black text-lg leading-tight">Announcement Center</h3>
                                    <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">Holiday Notifications</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* 👤 Individual Selection Toggle */}
                                <div className={`p-4 rounded-2xl border transition-all duration-500 ${sendNotify && notifyTarget === 'individual' ? 'bg-purple-600/10 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'bg-black/20 border-white/5'}`}>
                                    <div
                                        onClick={() => {
                                            if (sendNotify && notifyTarget === 'individual') {
                                                setSendNotify(false)
                                            } else {
                                                setSendNotify(true)
                                                setNotifyTarget('individual')
                                                setShowAnnounceUserModal(true)
                                            }
                                        }}
                                        className="flex items-center justify-between cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${sendNotify && notifyTarget === 'individual' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-800 text-gray-500'}`}>
                                                <UserIcon size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black leading-tight">Individual Notify</p>
                                                <p className="text-[9px] opacity-40 uppercase tracking-tighter">Select specific staff</p>
                                            </div>
                                        </div>
                                        <div className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center ${sendNotify && notifyTarget === 'individual' ? 'bg-purple-600 shadow-lg shadow-purple-500/50' : 'bg-gray-700'}`}>
                                            <motion.div animate={{ x: sendNotify && notifyTarget === 'individual' ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full" />
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {sendNotify && notifyTarget === 'individual' && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden pt-3"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setShowAnnounceUserModal(true); }}
                                                    className="w-full py-2.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Users size={12} /> {selectedUserIds.length > 0 ? `Manage Selection (${selectedUserIds.length})` : 'Select Employees'}
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* 🌐 Global (All Users) Toggle */}
                                <div className={`p-4 rounded-2xl border transition-all duration-500 ${sendNotify && notifyTarget === 'all' ? 'bg-blue-600/10 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-black/20 border-white/5'}`}>
                                    <div
                                        onClick={() => {
                                            if (sendNotify && notifyTarget === 'all') {
                                                setSendNotify(false)
                                            } else {
                                                setSendNotify(true)
                                                setNotifyTarget('all')
                                            }
                                        }}
                                        className="flex items-center justify-between cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-xl ${sendNotify && notifyTarget === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-800 text-gray-500'}`}>
                                                <Mail size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black leading-tight">Global Notify</p>
                                                <p className="text-[9px] opacity-40 uppercase tracking-tighter">Full Company Broadcast</p>
                                            </div>
                                        </div>
                                        <div className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center ${sendNotify && notifyTarget === 'all' ? 'bg-blue-600 shadow-lg shadow-blue-500/50' : 'bg-gray-700'}`}>
                                            <motion.div animate={{ x: sendNotify && notifyTarget === 'all' ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full" />
                                        </div>
                                    </div>
                                </div>

                                <motion.div className="pt-4 overflow-hidden">
                                    <button
                                        onClick={handleBroadcastAll}
                                        disabled={broadcasting || (sendNotify && notifyTarget === 'individual' && selectedUserIds.length === 0)}
                                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-30
                                            ${sendNotify && notifyTarget === 'individual' ? 'bg-purple-600 text-white shadow-purple-500/40' : 'bg-blue-600 text-white shadow-blue-500/40'}`}
                                    >
                                        {broadcasting ? <Loader2 size={16} className="animate-spin" /> : (
                                            <>
                                                <Send size={16} />
                                                Broadcast All Holidays
                                            </>
                                        )}
                                    </button>
                                    <p className="text-[9px] text-center opacity-40 mt-3 uppercase tracking-tighter">
                                        Target: {sendNotify ? (notifyTarget === 'all' ? 'Every Employee' : `${selectedUserIds.length} Selected Users`) : 'Disabled'}
                                    </p>
                                </motion.div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-6 rounded-[2.5rem] border shadow-2xl backdrop-blur-xl ${theme === 'dark' ? 'bg-gray-900/60 border-gray-700' : 'bg-white/80 border-gray-200'}`}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-yellow-500/20 text-yellow-500 rounded-[1.25rem] shadow-xl shadow-yellow-500/10">
                                    <Star size={24} />
                                </div>
                                <h3 className="text-xl font-black">Festivals This Month</h3>
                            </div>

                            <div className="space-y-4">
                                {festivals
                                    .filter(f => {
                                        const d = new Date(f.date)
                                        return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()
                                    })
                                    .map((f, i) => (
                                        <motion.div
                                            key={f.date}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className={`p-4 rounded-3xl border flex items-center justify-between transition-all group hover:scale-[1.02] ${theme === 'dark' ? 'bg-gray-800/40 border-gray-700 hover:border-rose-500/50 hover:bg-rose-500/5' : 'bg-gray-50 border-gray-200'}`}
                                        >
                                            <div>
                                                <p className="font-bold text-sm">{f.title}</p>
                                                <p className="text-xs opacity-60">{new Date(f.date).toLocaleDateString()}</p>
                                            </div>
                                            {(!holidays.some(h => h.date.split('T')[0] === f.date)) && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedDate(f.date)
                                                        setNewHolidayTitle(f.title)
                                                        setShowAddModal(true)
                                                    }}
                                                    className="p-1 px-3 bg-blue-600 text-white rounded-lg text-xs font-bold hover:scale-105 transition-transform"
                                                >
                                                    Declare Holiday
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}
                                {festivals
                                    .filter(f => {
                                        const d = new Date(f.date)
                                        return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear()
                                    }).length === 0 && (
                                        <p className="text-center py-8 opacity-40 text-sm italic font-medium">No major festivals this month.</p>
                                    )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
            {activeTab === 'list' && (
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-3xl shadow-2xl overflow-hidden border ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}
                    >
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <h2 className="text-2xl font-bold">Official Company Holidays List</h2>
                        </div>

                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {holidays.length === 0 ? (
                                <div className="p-12 text-center opacity-60">No official holidays declared yet.</div>
                            ) : (
                                holidays.map(holiday => (
                                    <div key={holiday._id} className="flex items-center justify-between px-8 py-5 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-all">
                                        <div className="flex-1">
                                            <p className="font-bold text-lg">{holiday.title}</p>
                                            <p className="text-sm opacity-60 flex items-center gap-2 mt-1 uppercase tracking-wider">
                                                📅 {new Date(holiday.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(holiday)}
                                                className="p-3 bg-blue-100 text-blue-600 hover:bg-blue-500 hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow-lg"
                                            >
                                                <Pencil size={24} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(holiday._id)}
                                                className="p-3 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow-lg"
                                            >
                                                <Trash2 size={24} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* ADD HOLIDAY MODAL */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseModal}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className={`relative w-full max-w-4xl p-10 rounded-[2.5rem] shadow-2xl overflow-hidden border ${theme === 'dark' ? 'bg-[#0f172a] border-blue-500/20' : 'bg-white border-gray-100'}`}
                        >
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-400/10 transition-all opacity-40 hover:opacity-100 group"
                            >
                                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>

                            <h2 className="text-2xl font-bold mb-6 text-blue-500">
                                {editingId ? 'Edit Company Holiday' : 'Declare Company Holiday'}
                            </h2>

                            <div className="flex flex-col md:flex-row gap-10">
                                {/* 📝 Left Column: Details */}
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                                            <CalendarIcon size={24} />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black uppercase opacity-40 tracking-widest">Selected Date</label>
                                            <p className="text-lg font-black leading-tight">
                                                {selectedDate ? new Date(selectedDate).toLocaleDateString(undefined, { dateStyle: 'full' }) : ''}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black uppercase opacity-40 tracking-widest mb-2">Holiday Title</label>
                                        <input
                                            autoFocus
                                            type="text"
                                            value={newHolidayTitle}
                                            onChange={e => setNewHolidayTitle(e.target.value)}
                                            className={`w-full p-5 rounded-2xl border outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg font-black
                                                ${theme === 'dark' ? 'bg-black/40 border-white/5 text-white' : 'bg-gray-50 border-gray-200 text-black'}`}
                                            placeholder="e.g. Diwali Festival"
                                        />
                                    </div>

                                    {/* 📧 Email Notification Section */}
                                    <div className={`p-6 rounded-[2rem] border transition-all duration-500 ${sendNotify ? 'bg-blue-600/10 border-blue-500/30' : 'bg-black/20 border-white/5'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-2xl ${sendNotify ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'bg-gray-800 text-gray-500'}`}>
                                                    <Mail size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black leading-none mb-1">Notify Employees</p>
                                                    <p className="text-[10px] opacity-40 uppercase tracking-tighter">Send festive email alerts</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSendNotify(!sendNotify)}
                                                className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center ${sendNotify ? 'bg-blue-600 shadow-lg shadow-blue-500/50' : 'bg-gray-700'}`}
                                            >
                                                <motion.div animate={{ x: sendNotify ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full" />
                                            </button>
                                        </div>

                                        <AnimatePresence>
                                            {sendNotify && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden space-y-4 pt-6"
                                                >
                                                    <div className="flex bg-black/40 p-1 rounded-2xl gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setNotifyTarget('all')}
                                                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-black rounded-xl transition-all
                                                                ${notifyTarget === 'all' ? 'bg-blue-600 text-white shadow-xl' : 'opacity-40 hover:opacity-100'}`}
                                                        >
                                                            <Users size={14} /> Full Company
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setNotifyTarget('individual')
                                                                setShowAnnounceUserModal(true)
                                                            }}
                                                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-black rounded-xl transition-all
                                                                ${notifyTarget === 'individual' ? 'bg-blue-600 text-white shadow-xl' : 'opacity-40 hover:opacity-100'}`}
                                                        >
                                                            <UserIcon size={14} /> Individual
                                                        </button>
                                                    </div>

                                                    {notifyTarget === 'individual' && (
                                                        <div className="pt-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowAnnounceUserModal(true)}
                                                                className="w-full py-4 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-500 text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3"
                                                            >
                                                                <Users size={16} />
                                                                {selectedUserIds.length > 0 ? `Manage Recipients (${selectedUserIds.length})` : 'Select Employees'}
                                                            </button>
                                                            {selectedUserIds.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-3 max-h-20 overflow-y-auto p-1">
                                                                    {selectedUserIds.slice(0, 5).map(id => {
                                                                        const u = allUsers.find(x => x._id === id)
                                                                        return u && (
                                                                            <span key={id} className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 text-[9px] font-bold border border-blue-500/20">
                                                                                {u.name.split(' ')[0]}
                                                                            </span>
                                                                        )
                                                                    })}
                                                                    {selectedUserIds.length > 5 && (
                                                                        <span className="px-2 py-1 rounded-lg bg-gray-500/10 text-gray-400 text-[9px] font-bold border border-white/5">
                                                                            +{selectedUserIds.length - 5} More
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* 🎨 Right Column: Media & Upload */}
                                <div className="flex-1 space-y-6 flex flex-col justify-center">
                                    <div>
                                        <div className="flex items-center justify-between mb-3 px-1">
                                            <label className="text-[10px] font-black uppercase opacity-40 tracking-widest">Holiday Media</label>
                                            {tempAnim && <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Uploaded</span>}
                                        </div>
                                        {!tempAnim ? (
                                            <div className="relative h-full min-h-[300px]">
                                                <input
                                                    type="file"
                                                    accept="image/*,video/*"
                                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                    disabled={uploading}
                                                />
                                                <div className={`h-full min-h-[300px] border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-4 transition-all
                                                    ${theme === 'dark' ? 'border-white/5 bg-black/20 hover:bg-black/40' : 'border-gray-200 bg-gray-50'}`}>
                                                    {uploading ? (
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Syncing with Cloud...</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="w-16 h-16 rounded-3xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                                                                <Upload size={32} />
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-xs font-black uppercase tracking-widest">Upload Animation</p>
                                                                <p className="text-[9px] opacity-40 mt-1 uppercase">GIF, Image or Video (4:3 Recommended)</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative group rounded-[2.5rem] overflow-hidden border border-blue-500/30 shadow-2xl h-full min-h-[300px]">
                                                {tempAnim.resourceType === 'video' ? (
                                                    <video src={tempAnim.url} autoPlay loop muted className="w-full h-full object-cover" />
                                                ) : (
                                                    <img src={tempAnim.url} alt="" className="w-full h-full object-cover" />
                                                )}
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                                                    <button
                                                        onClick={() => setTempAnim(null)}
                                                        className="p-4 bg-red-600 text-white rounded-3xl shadow-2xl shadow-red-500/50 hover:scale-110 active:scale-95 transition-all flex items-center gap-2"
                                                    >
                                                        <Trash2 size={24} />
                                                        <span className="text-xs font-black uppercase tracking-widest">Remove Media</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 flex gap-4">
                                <button
                                    onClick={handleCloseModal}
                                    className="flex-1 py-4 rounded-3xl font-black text-xs uppercase tracking-widest opacity-40 hover:opacity-100 hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAdd}
                                    disabled={adding}
                                    className="flex-[2] py-4 rounded-3xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-500/40 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {adding ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                        <>
                                            <Check size={18} />
                                            {editingId ? 'Update Holiday' : 'Confirm Holiday'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* 👤 SELECTION DIALOG FOR ANNOUNCEMENT CENTER */}
            <AnimatePresence>
                {showAnnounceUserModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAnnounceUserModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            className={`relative w-full max-w-lg p-8 rounded-[3rem] shadow-2xl overflow-hidden border ${theme === 'dark' ? 'bg-[#0f172a] border-purple-500/20' : 'bg-white border-gray-100'}`}
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

                            <button
                                onClick={() => setShowAnnounceUserModal(false)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-all text-gray-500 hover:text-white"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-4 bg-purple-600 text-white rounded-3xl shadow-xl shadow-purple-500/30">
                                    <Users size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black leading-tight">Select Recipients</h2>
                                    <p className="text-xs opacity-40 uppercase tracking-widest font-bold">Individual Selection Mode</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2 text-[10px] font-black uppercase opacity-40 tracking-widest">
                                    <span>Employee List</span>
                                    <span>{selectedUserIds.length} Selected</span>
                                </div>

                                <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                    {loadingUsers ? (
                                        <div className="py-12 flex flex-col items-center gap-3 opacity-40">
                                            <Loader2 className="animate-spin" />
                                            <p className="text-xs font-bold uppercase tracking-widest">Fetching Employees...</p>
                                        </div>
                                    ) : (
                                        allUsers.map(user => {
                                            const isSelected = selectedUserIds.includes(user._id)
                                            return (
                                                <div
                                                    key={user._id}
                                                    onClick={() => {
                                                        setSelectedUserIds(prev =>
                                                            isSelected ? prev.filter(id => id !== user._id) : [...prev, user._id]
                                                        )
                                                    }}
                                                    className={`flex items-center justify-between p-3.5 rounded-2xl cursor-pointer transition-all border
                                                        ${isSelected ? 'bg-purple-600/10 border-purple-500/40 shadow-xl' : 'border-transparent hover:bg-white/5'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black transition-all
                                                            ${isSelected ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400'}`}>
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold leading-none">{user.name}</p>
                                                            <p className="text-[10px] opacity-40 font-medium mt-1 uppercase tracking-tighter">{user.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`w-6 h-6 rounded-xl flex items-center justify-center border transition-all
                                                        ${isSelected ? 'bg-purple-600 border-purple-600 shadow-lg' : 'border-white/10 bg-black/40'}`}>
                                                        {isSelected && <Check size={14} className="text-white" strokeWidth={4} />}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setSelectedUserIds([])}
                                        className="flex-1 py-4 rounded-2xl bg-gray-600/20 text-gray-400 text-xs font-black uppercase tracking-widest hover:bg-red-600/20 hover:text-red-400 transition-all border border-transparent hover:border-red-500/30"
                                    >
                                        Clear All
                                    </button>
                                    <button
                                        onClick={() => setShowAnnounceUserModal(false)}
                                        className="flex-[2] py-4 rounded-2xl bg-purple-600 text-white text-xs font-black uppercase tracking-widest shadow-2xl shadow-purple-500/40 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        Confirm Selection
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    )
}
