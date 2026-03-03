'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function HolidayActionContent() {
    const searchParams = useSearchParams()
    const id = searchParams.get('id')
    const actionParam = searchParams.get('action') // 'approved' or 'rejected'

    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState(false)
    const [complete, setComplete] = useState(false)
    const [requestData, setRequestData] = useState<any>(null)
    const [errorMsg, setErrorMsg] = useState('')
    const [rejectionReason, setRejectionReason] = useState('')

    useEffect(() => {
        if (!id || !actionParam) {
            setErrorMsg('Invalid URL parameters. Missing ID or action.')
            setLoading(false)
            return
        }

        // Fetch holiday request details
        const fetchRequest = async () => {
            try {
                const res = await fetch(`/api/admin/holiday-requests/get-single?id=${id}`)
                const data = await res.json()

                if (data.success) {
                    setRequestData(data.data)

                    // If action is already approved, auto-process it!
                    if (actionParam === 'approved' && data.data.status === 'pending') {
                        handleAction('approved', '')
                    } else if (data.data.status !== 'pending') {
                        setComplete(true) // Already processed
                    }
                } else {
                    setErrorMsg(data.message || 'Holiday request not found')
                }
            } catch (err) {
                setErrorMsg('Failed to load holiday request details')
            } finally {
                setLoading(false)
            }
        }

        fetchRequest()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, actionParam])

    const handleAction = async (actionSubmit: 'approved' | 'rejected', reason: string) => {
        setProcessing(true)
        try {
            const res = await fetch('/api/admin/holiday-requests/quick-action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    action: actionSubmit,
                    rejectionReason: reason
                })
            })

            const data = await res.json()
            if (data.success) {
                setRequestData((prev: any) => ({ ...prev, status: actionSubmit }))
                setComplete(true)
            } else {
                setErrorMsg(data.message || 'Failed to update request')
            }
        } catch (err) {
            setErrorMsg('Failed to process the request')
        } finally {
            setProcessing(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
            </div>
        )
    }

    if (errorMsg) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4">
                <div className="bg-red-900/40 p-6 rounded-xl border border-red-500 max-w-md text-center">
                    <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
                    <p>{errorMsg}</p>
                </div>
            </div>
        )
    }

    if (!requestData) return null

    // UI FOR ALREADY COMPLETED OR AUTO-APPROVED
    if (complete || requestData.status !== 'pending') {
        const isApprove = requestData.status === 'approved'
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6">
                <div className="bg-[#1e293b] p-8 rounded-2xl border border-gray-700 max-w-md w-full text-center shadow-2xl">

                    <div className="mx-auto w-20 h-20 rounded-full overflow-hidden border-2 border-gray-500 mb-4 shadow-lg">
                        {requestData.profilePicture ? (
                            <img src={requestData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-pink-600 flex items-center justify-center text-3xl font-bold text-white">
                                {requestData.userName?.[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold mb-1">{requestData.userName}</h2>
                    <p className="text-gray-400 text-sm mb-6">{requestData.designation}</p>

                    <div className="bg-[#0f172a] p-4 rounded-xl mb-6 text-left border border-gray-800">
                        <p className="text-sm font-semibold text-pink-400 mb-1">Company Holiday</p>
                        <p className="font-semibold text-lg">{requestData.holidayTitle}</p>
                        <p className="text-xs text-gray-400 mb-2">{new Date(requestData.holidayDate).toDateString()}</p>
                        <div className="h-px bg-gray-800 my-2"></div>
                        <p className="text-xs text-gray-400 mt-2">Reason: <span className="text-gray-200">{requestData.reason}</span></p>
                    </div>

                    <div className={`inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-lg ${isApprove ? 'bg-green-500/20 text-green-400 border border-green-500' : 'bg-red-500/20 text-red-400 border border-red-500'}`}>
                        {isApprove ? '✅ Request Approved' : '❌ Request Rejected'}
                    </div>

                    <p className="text-xs text-gray-500 mt-6">User has been informed on their dashboard.</p>
                </div>
            </div>
        )
    }

    // UI FOR REJECTION REASON INPUT (Status is still pending AND action was 'rejected')
    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6">
            <div className="bg-[#1e293b] p-8 rounded-2xl border border-gray-700 max-w-md w-full shadow-2xl">

                <h2 className="text-2xl font-bold mb-2 text-center text-red-400">Reject Work Request</h2>
                <p className="text-gray-400 text-sm text-center mb-6">Provide a reason for rejecting the holiday work request from <b>{requestData.userName}</b>.</p>

                <div className="bg-[#0f172a] p-4 rounded-xl mb-6">
                    <p className="text-xs text-gray-400">Holiday: <span className="text-white font-bold">{requestData.holidayTitle}</span></p>
                    <p className="text-xs text-gray-400 mt-1">Reason: <span className="text-white">{requestData.reason}</span></p>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rejection Reason</label>
                    <textarea
                        rows={4}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full bg-[#0f172a] border border-gray-600 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                        placeholder="Please specify why this work request is rejected..."
                    ></textarea>
                </div>

                <button
                    onClick={() => handleAction('rejected', rejectionReason)}
                    disabled={processing || !rejectionReason.trim()}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors flex justify-center items-center"
                >
                    {processing ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                        'Confirm Rejection'
                    )}
                </button>

            </div>
        </div>
    )
}

export default function HolidayActionPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div></div>}>
            <HolidayActionContent />
        </Suspense>
    )
}
