'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '../../../../../contexts/ThemeContext'
import Loading from '@/components/ui/Loading'

type DocMap = Record<string, string | undefined>

const LABELS: Record<string, string> = {
  aadhar: 'Aadhar Card',
  collegeId: 'College ID',
  offerLetter: 'Offer Letter',
  signedOfferLetter: 'Signed Offer Letter',
  noc: 'NOC',
  marksheet10: '10th Marksheet',
  marksheet12: '12th Marksheet',
  resume: 'Resume'
}

const getFileName = (url: string) => {
  try {
    const clean = url.split('?')[0]
    const last = clean.split('/').filter(Boolean).pop() || clean
    return decodeURIComponent(last)
  } catch {
    return url
  }
}

export default function UserDocuments({ email, close }: any) {
  const { theme } = useTheme()

  const [docs, setDocs] = useState<DocMap | null>(null)
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    if (email) void getDocs()
  }, [email])

  const getDocs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/get-user-by-email?email=${email}`)
      const data = await res.json()
      setDocs((data?.data?.documents || null) as DocMap | null)
    } finally {
      setLoading(false)
    }
  }

  const entries = Object.keys(LABELS).map((key) => ({
    key,
    label: LABELS[key],
    value: docs ? (docs as any)[key] : undefined
  }))

  const hasAny = entries.some((e) => !!e.value)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: theme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(15,23,42,0.35)',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px'
      }}
    >
      <div
        style={{
          width: 'min(720px, 96vw)',
          maxHeight: '80vh',
          overflowY: 'auto',
          padding: '20px',
          borderRadius: '16px',
          backdropFilter: 'blur(16px)',
          boxShadow: theme === 'dark'
            ? '0 20px 55px rgba(0,0,0,0.55), 0 10px 30px rgba(59,130,246,0.18)'
            : '0 18px 45px rgba(15,23,42,0.18), 0 10px 25px rgba(59,130,246,0.16)',
          border:
            theme === 'dark'
              ? '1px solid rgba(148,163,184,0.22)'
              : '1px solid rgba(15,23,42,0.12)',
          background: theme === 'dark' ? 'rgba(17,24,39,0.92)' : 'rgba(255,255,255,0.95)',
          transform: show ? 'translateY(0)' : 'translateY(12px)',
          opacity: show ? 1 : 0,
          transition: 'all 0.25s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: theme === 'dark' ? '#fff' : '#111'
              }}
            >
              Documents
            </h2>
            <p
              style={{
                marginTop: 2,
                fontSize: 12,
                color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
              title={email}
            >
              {email}
            </p>
          </div>

          <button
            onClick={close}
            style={{
              color: theme === 'dark' ? '#d1d5db' : '#4b5563',
              fontSize: 18,
              lineHeight: 1
            }}
            aria-label="Close"
          >
            ✖
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loading size="small" />
            </div>
          ) : !docs || !hasAny ? (
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                color: theme === 'dark' ? '#d1d5db' : '#374151',
                fontSize: 13,
                fontWeight: 600,
                textAlign: 'center'
              }}
            >
              No documents uploaded
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
              {entries
                .filter((e) => !!e.value)
                .map((e) => (
                  <div
                    key={e.key}
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      minWidth: 0
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: 11,
                            color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: 6
                          }}
                        >
                          {e.label}
                        </p>

                        <p
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: theme === 'dark' ? '#fff' : '#111',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {getFileName(String(e.value))}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <a
                          href={String(e.value)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Open
                        </a>

                        <a
                          href={String(e.value)}
                          download
                          className={`px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${
                            theme === 'dark'
                              ? 'bg-gray-700 text-white hover:bg-gray-600'
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                          }`}
                        >
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
