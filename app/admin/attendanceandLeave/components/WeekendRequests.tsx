'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '../../../../contexts/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'

interface WeekendReq {
    _id: string
    userEmail: string
    userName: string
    date: string
    dayName: string
    entryTime: string
    exitTime?: string
    workedHours?: number
    status: 'pending' | 'approved' | 'rejected'
    approvedBy?: string
    approvedAt?: string
    reason?: string
    createdAt: string
}

interface Props {
    canApprove: boolean
}

export default function WeekendRequests({ canApprove }: Props) {
    const { theme } = useTheme()
    const [requests, setRequests] = useState<WeekendReq[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        fetchRequests()
    }, [filter])

    const fetchRequests = async () => {
        try {
            setLoading(true)
            const statusParam = filter === 'all' ? '' : `?status=${filter}`
            const res = await fetch(`/api/admin/weekend-requests${statusParam}`)
            const data = await res.json()
            if (data.success) setRequests(data.data || [])
        } catch (err) {
            console.error('Failed to fetch weekend requests', err)
        } finally {
            setLoading(false)
        }
    }

    const handleAction = async (requestId: string, action: 'approved' | 'rejected') => {
        try {
            setActionLoading(requestId)

            // Get current admin email
            const adminRes = await fetch('/api/admin/get-current')
            const adminData = await adminRes.json()
            const adminEmail = adminData.data?.email || 'unknown'

            const res = await fetch('/api/admin/weekend-requests', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId,
                    action,
                    adminEmail,
                }),
            })

            const data = await res.json()
            if (data.success) {
                fetchRequests()
            }
        } catch (err) {
            console.error('Action failed', err)
        } finally {
            setActionLoading(null)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        ⏳ Pending
                    </span>
                )
            case 'approved':
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        ✅ Approved
                    </span>
                )
            case 'rejected':
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        ❌ Rejected
                    </span>
                )
            default:
                return null
        }
    }

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    return (
        <div className="w-full">
            {/* Filter tabs */}
            <div className="flex gap-2 mb-6">
                {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer capitalize
              ${filter === f
                                ? 'bg-blue-600 text-white shadow-lg'
                                : theme === 'dark'
                                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Requests list */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`animate-pulse rounded-xl p-5 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                                }`}
                        >
                            <div className="h-4 bg-gray-300 rounded w-1/3 mb-3" />
                            <div className="h-3 bg-gray-300 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : requests.length === 0 ? (
                <div
                    className={`text-center py-16 rounded-2xl border ${theme === 'dark'
                            ? 'bg-gray-900 border-gray-700 text-gray-400'
                            : 'bg-gray-50 border-gray-200 text-gray-500'
                        }`}
                >
                    <p className="text-4xl mb-3">📅</p>
                    <p className="text-lg font-medium">No weekend requests found</p>
                    <p className="text-sm mt-1 opacity-70">
                        {filter === 'pending'
                            ? 'No pending weekend attendance requests'
                            : `No ${filter} requests`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {requests.map((req) => (
                            <motion.div
                                key={req._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={`rounded-xl border p-5 ${theme === 'dark'
                                        ? 'bg-gray-900 border-gray-700'
                                        : 'bg-white border-gray-200 shadow-sm'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3
                                                className={`font-semibold text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                    }`}
                                            >
                                                {req.userName}
                                            </h3>
                                            {getStatusBadge(req.status)}
                                        </div>

                                        <p
                                            className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                                }`}
                                        >
                                            {req.userEmail}
                                        </p>

                                        <div className="flex flex-wrap gap-4 mt-3">
                                            <div
                                                className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                                    }`}
                                            >
                                                📅 <span className="font-medium">{formatDate(req.date)}</span>{' '}
                                                <span className="text-xs opacity-70">({req.dayName})</span>
                                            </div>

                                            <div
                                                className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                                    }`}
                                            >
                                                🕐 Entry: <span className="font-medium">{req.entryTime}</span>
                                            </div>

                                            {req.exitTime && (
                                                <div
                                                    className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                                        }`}
                                                >
                                                    🕐 Exit: <span className="font-medium">{req.exitTime}</span>
                                                </div>
                                            )}

                                            {req.workedHours !== undefined && req.workedHours > 0 && (
                                                <div
                                                    className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                                        }`}
                                                >
                                                    ⏱ <span className="font-medium">{req.workedHours.toFixed(1)} hrs</span>
                                                </div>
                                            )}
                                        </div>

                                        {req.approvedBy && (
                                            <p
                                                className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                                                    }`}
                                            >
                                                {req.status === 'approved' ? 'Approved' : 'Rejected'} by{' '}
                                                {req.approvedBy}
                                            </p>
                                        )}
                                    </div>

                                    {/* Action buttons — only for pending */}
                                    {req.status === 'pending' && canApprove && (
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleAction(req._id, 'approved')}
                                                disabled={actionLoading === req._id}
                                                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium
                          hover:bg-green-500 transition-colors cursor-pointer disabled:opacity-50"
                                            >
                                                {actionLoading === req._id ? '...' : '✅ Approve'}
                                            </button>
                                            <button
                                                onClick={() => handleAction(req._id, 'rejected')}
                                                disabled={actionLoading === req._id}
                                                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium
                          hover:bg-red-500 transition-colors cursor-pointer disabled:opacity-50"
                                            >
                                                {actionLoading === req._id ? '...' : '❌ Reject'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}
