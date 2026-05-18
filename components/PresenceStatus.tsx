import { useSocket } from '@/hooks/useSocket'
import { useEffect, useState } from 'react'

export default function PresenceStatus() {
  const { lastPresenceResult } = useSocket()
  const [display, setDisplay] = useState<{
    status: string
    score: number
    message: string
  } | null>(null)

  useEffect(() => {
    if (!lastPresenceResult) return

    const { status, score, message, userName } = lastPresenceResult

    setDisplay({
      status,
      score: Math.round((score ?? 0) * 100),
      message: message || `${userName || 'User'} — Match: ${Math.round((score ?? 0) * 100)}%`,
    })

    const timer = setTimeout(() => setDisplay(null), 12000)
    return () => clearTimeout(timer)
  }, [lastPresenceResult])

  if (!display) return null

  const { status, score, message } = display

  const statusMap: Record<string, string> = {
    verified: '✅ Verified',
    partial_match: '⚠️ Partial Match',
    present_but_failed: '⚠️ Verification Failed',
    not_present: '❌ Not Present',
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="font-semibold mb-2">{statusMap[status] ?? status}</h3>
      <p className="mb-1"><strong>Score:</strong> {score}%</p>
      <p><strong>Message:</strong> {message}</p>
    </div>
  )
}
