'use client'
import { useEffect, useState, useRef } from "react"
import { useTheme } from "../../../contexts/ThemeContext"
import { motion, AnimatePresence } from "framer-motion"
import { Megaphone, CheckCircle, XCircle, Clock, Edit3 } from "lucide-react"
import { useInfiniteScroll } from "../../../hooks/useInfiniteScroll"

interface HolidayRequest {
    _id: string;
    userEmail: string;
    holidayDate: string;
    status: 'pending' | 'approved' | 'rejected';
    appliedAt: string;
    reason?: string;
    holidayId?: {
        title: string;
        date: string;
    };
}

export default function Announcements() {
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

    // When page changes > 1, load more
    useEffect(() => {
        if (page > 1) {
            fetchRequests(page, true)
        }
    }, [page])

    // Initial load
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
                // ✅ Local state update instead of full fetch
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
            <div className={`min-h-screen p-8 ml-24 flex justify-center items-center ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    return (
        <div className={`min-h-screen p-8 ml-24 transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Megaphone className="text-indigo-500" size={32} />
                        Announcements & Requests
                    </h1>
                    <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Manage user requests to work on company holidays.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {requests.map((req) => (
                        <motion.div
                            key={req._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`p-5 rounded-2xl shadow-sm border flex flex-col sm:flex-row items-center justify-between gap-4 ${theme === 'dark' ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${req.status === 'pending' ? 'bg-orange-500/10 text-orange-500' :
                                    req.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                    }`}>
                                    {req.status === 'pending' ? <Clock size={24} /> : req.status === 'approved' ? <CheckCircle size={24} /> : <XCircle size={24} />}
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
                                        className={`flex-1 sm:flex-none px-6 py-2 rounded-xl font-bold transition-transform active:scale-95 ${theme === 'dark' ? 'bg-red-900/40 text-red-400 hover:bg-red-900/60' : 'bg-red-50 text-red-600 hover:bg-red-100'
                                            }`}
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
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${req.status === 'approved' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                                        }`}>
                                        {req.status}
                                    </span>
                                    <button
                                        onClick={() => setEditingId(req._id)}
                                        className={`p-2 rounded-lg transition-all hover:scale-110 active:scale-95 ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}
                                        title="Edit decision"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                </div>
                            )}
                        </motion.div>
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
                </AnimatePresence>
            </div>
        </div>
    )
}
